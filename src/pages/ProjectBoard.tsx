import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Search,
  Flame,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import { Board } from '../components/kanban/Board';
import { TaskModal } from '../components/kanban/TaskModal';
import { TaskDetailsModal } from '../components/kanban/TaskDetailsModal';
import { BacklogView } from '../components/backlog/BacklogView';
import { SprintModal } from '../components/backlog/SprintModal';
import { LearningModal } from '../components/shared/LearningModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { DropdownMenu } from '../components/shared/DropdownMenu';
import { Badge, resolveBadgeVariant } from '../components/shared/Badge';
import { useFetchTasks } from '../hooks/useFetchTasks';
import { useFetchSprints } from '../hooks/useFetchSprints';
import { useLookups } from '../hooks/useLookups';
import { useLearnings } from '../hooks/useLearnings';
import { apiFetch } from '../utils/api';
import { calculateProjectProgress } from '../utils/progress';
import { getProjectCode } from '../utils/projectCode';
import type { Task, Lookup, Project, Sprint } from '../../shared/types';

export const ProjectBoard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Tab state: 'board' | 'backlog'
  const [viewTab, setViewTab] = useState<'board' | 'backlog'>('board');

  // Project state
  const [project, setProject] = useState<Project | null>(null);

  // Project modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  // Tasks hook
  const { tasks, isLoading, error, refetch, createTask, updateTask, moveTask, deleteTask } =
    useFetchTasks(projectId);

  // Sprints hook
  const {
    sprints,
    createSprint,
    updateSprint,
    deleteSprint,
  } = useFetchSprints(projectId);

  // Sprint modal state
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [sprintModalMode, setSprintModalMode] = useState<'create' | 'edit'>('create');
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // Learnings hook for task-linked learnings
  const { createLearning } = useLearnings();
  const [learningModalTask, setLearningModalTask] = useState<Task | null>(null);

  const { lookups: taskStatuses } = useLookups('TASK_STATUS');
  const { lookups: taskTypes } = useLookups('TASK_TYPE');
  const { lookups: priorities } = useLookups('PRIORITY');

  // Task details modal state (opens on click)
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);

  // Task edit / create modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('TASK_STAT_BACKLOG');
  const [defaultSprintId, setDefaultSprintId] = useState<string | null>(null);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sprintFilter, setSprintFilter] = useState<string>('ALL');

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    const res = await apiFetch<Project>(`/api/projects/${projectId}`);
    if (res.success && res.data) {
      setProject(res.data);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Real weighted engineering progress
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.statusId === 'TASK_STAT_DONE').length;
  const testingTasks = tasks.filter((t) => t.statusId === 'TASK_STAT_TESTING').length;
  const completionPercentage = calculateProjectProgress(tasks, project?.statusId);
  const criticalTasks = tasks.filter(
    (t) => t.priorityId === 'PRIO_CRITICAL' && t.statusId !== 'TASK_STAT_DONE'
  ).length;

  const filteredTasks = tasks.filter((t) => {
    if (typeFilter !== 'ALL' && t.typeId !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && t.priorityId !== priorityFilter) return false;
    if (sprintFilter !== 'ALL') {
      if (sprintFilter === 'NONE' && t.sprintId) return false;
      if (sprintFilter !== 'NONE' && t.sprintId !== sprintFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchVersion = t.version?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchId && !matchVersion) return false;
    }
    return true;
  });

  const handleOpenCreateTask = (statusId: string = 'TASK_STAT_BACKLOG', sprintId?: string | null) => {
    setSelectedTask(null);
    setTargetColumnId(statusId);
    setDefaultSprintId(sprintId ?? null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: {
    title: string;
    description?: string;
    typeId: string;
    statusId?: string;
    priorityId?: string;
    sprintId?: string | null;
    version?: string | null;
    dueDate?: number;
  }) => {
    if (selectedTask) {
      return await updateTask(selectedTask.id, data);
    } else {
      return await createTask({
        ...data,
        statusId: data.statusId || targetColumnId,
        sprintId: data.sprintId ?? defaultSprintId,
      });
    }
  };

  const handleDropTask = (taskId: string, targetStatusId: string) => {
    const targetTasks = tasks.filter((t) => t.statusId === targetStatusId);
    const newPosition = targetTasks.length + 1;
    moveTask(taskId, targetStatusId, newPosition);
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    const res = await apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res.success) {
      setProject((prev) => (prev ? { ...prev, ...updates } : null));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update project' };
  };

  const handleDeleteProject = async () => {
    if (!projectId) return { success: false };
    const res = await apiFetch(`/api/projects/${projectId}`, { method: 'DELETE' });
    if (res.success) {
      navigate('/');
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete project' };
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] min-h-0 w-full px-3 sm:px-6 py-3 sm:py-4 select-none overflow-hidden space-y-3">
      {/* 1. Apple Project Breadcrumbs & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-black/[0.06] flex-shrink-0 gap-3">
        {/* Top/Left Row: Breadcrumbs & Project Identity */}
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/"
              className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors flex-shrink-0"
              title="Back to Projects"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-1.5 sm:px-2 py-0.5 rounded-lg shadow-2xs">
                  {project?.code || getProjectCode(project?.title)}
                </span>
                <h1 className="text-sm sm:text-base font-bold text-[#1D1D1F] tracking-tight truncate max-w-[130px] sm:max-w-xs">
                  {project?.title || 'Board'}
                </h1>
                {project && (
                  <Badge
                    label={project.statusId.replace('PROJ_STAT_', '')}
                    variant={resolveBadgeVariant(project.statusId)}
                    dot
                  />
                )}
              </div>

              {project?.description && (
                <p className="text-[11px] sm:text-xs text-[#6E6E73] line-clamp-1 mt-0.5 max-w-xl hidden sm:block">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Mobile-Only Project Options Menu */}
          <div className="flex items-center gap-1.5 md:hidden flex-shrink-0">
            {project && (
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F] border border-black/[0.06] bg-white shadow-2xs cursor-pointer"
                    title="Project settings"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                }
                items={[
                  {
                    label: 'Project Details',
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () => setIsDetailsOpen(true),
                  },
                  {
                    label: 'Edit Project',
                    icon: <Edit2 className="w-3.5 h-3.5" />,
                    onClick: () => setIsEditProjectOpen(true),
                  },
                  'divider',
                  {
                    label: 'Delete Project',
                    icon: <Trash2 className="w-3.5 h-3.5" />,
                    danger: true,
                    onClick: () => setIsDeleteProjectOpen(true),
                  },
                ]}
              />
            )}
          </div>
        </div>

        {/* Center & Actions: Segmented Tabs (Board vs Backlog) + Buttons */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          {/* Dual Tabs (Board vs Backlog) */}
          <div className="flex items-center bg-black/[0.04] p-0.5 sm:p-1 rounded-xl border border-black/[0.03]">
            <button
              type="button"
              onClick={() => setViewTab('board')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewTab === 'board'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('backlog')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewTab === 'backlog'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Backlog</span>
              {tasks.length > 0 && (
                <span className="font-mono text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 bg-black/[0.06] rounded-md text-[#1D1D1F]">
                  {tasks.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: Progress Meter & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Progress Indicator (hidden on small mobile) */}
            <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-black/[0.06] shadow-xs text-xs">
              <div className="w-16 h-2 bg-black/[0.05] rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full bg-[#0071E3] rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="font-mono font-bold text-[#1D1D1F] text-[11px]">
                {completionPercentage}%
              </span>
              <span className="text-[#86868B] text-[11px]">
                ({doneTasks}/{totalTasks} closed{testingTasks > 0 ? `, ${testingTasks} in test` : ''})
              </span>
              {criticalTasks > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-md">
                  <Flame className="w-2.5 h-2.5 text-rose-500" />
                  {criticalTasks}
                </span>
              )}
            </div>

            {/* Desktop Project Options Menu */}
            {project && (
              <div className="hidden md:block">
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="p-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors border border-black/[0.06] shadow-xs bg-white cursor-pointer"
                      title="Project settings"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Project Details',
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => setIsDetailsOpen(true),
                    },
                    {
                      label: 'Edit Project',
                      icon: <Edit2 className="w-3.5 h-3.5" />,
                      onClick: () => setIsEditProjectOpen(true),
                    },
                    'divider',
                    {
                      label: 'Delete Project',
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      danger: true,
                      onClick: () => setIsDeleteProjectOpen(true),
                    },
                  ]}
                />
              </div>
            )}

            {/* New Sprint Button (Backlog tab) */}
            {viewTab === 'backlog' && (
              <button
                onClick={() => {
                  setEditingSprint(null);
                  setSprintModalMode('create');
                  setIsSprintModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-black/[0.03] text-[#1D1D1F] text-xs font-semibold rounded-xl border border-black/[0.08] shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="hidden sm:inline">Sprint / Version</span>
                <span className="sm:hidden">Sprint</span>
              </button>
            )}

            {/* New Task Button */}
            <button
              onClick={() => handleOpenCreateTask('TASK_STAT_BACKLOG')}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content View: Board Tab vs Backlog Tab */}
      {viewTab === 'board' ? (
        <>
          {/* Compact Filter Toolbar for Board */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 flex-shrink-0 gap-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto flex-nowrap">
              {/* Search filter input */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#86868B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tasks..."
                  className="pl-7 pr-3 py-1.5 bg-white border border-black/[0.08] hover:border-black/[0.14] focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] w-36 sm:w-52 transition-colors shadow-2xs font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 text-[#86868B] hover:text-[#1D1D1F] text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Sprint Filter */}
              {sprints.length > 0 && (
                <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03] flex-shrink-0">
                  <select
                    value={sprintFilter}
                    onChange={(e) => setSprintFilter(e.target.value)}
                    className="bg-transparent text-xs text-[#1D1D1F] font-medium border-0 focus:ring-0 px-2 py-0.5 cursor-pointer max-w-[140px] truncate"
                  >
                    <option value="ALL">All Sprints & Backlog</option>
                    <option value="NONE">Unassigned (Backlog Only)</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.version ? `(${s.version})` : ''} [{s.status}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type Filter Segmented Control */}
              <div className="flex items-center bg-black/[0.04] rounded-xl p-0.5 sm:p-1 gap-1 border border-black/[0.03] flex-shrink-0">
                <button
                  onClick={() => setTypeFilter('ALL')}
                  className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                    typeFilter === 'ALL'
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  All Types
                </button>
                {taskTypes.map((t: Lookup) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      typeFilter === t.id
                        ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center bg-black/[0.04] rounded-xl p-0.5 sm:p-1 gap-1 border border-black/[0.03] flex-shrink-0">
                <button
                  onClick={() => setPriorityFilter('ALL')}
                  className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                    priorityFilter === 'ALL'
                      ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  All Priorities
                </button>
                {priorities.map((p: Lookup) => (
                  <button
                    key={p.id}
                    onClick={() => setPriorityFilter(p.id)}
                    className={`px-2 sm:px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                      priorityFilter === p.id
                        ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Counter */}
            <div className="text-[11px] font-mono text-[#86868B]">
              Showing <span className="text-[#1D1D1F] font-semibold">{filteredTasks.length}</span> of {tasks.length} tasks
            </div>
          </div>

          {/* 6-Lane Kanban Board Surface */}
          <div className="flex-1 pt-1 overflow-hidden">
            {isLoading && (
              <div className="h-full flex items-center justify-center text-xs font-mono text-[#86868B]">
                Loading Kanban board...
              </div>
            )}

            {error && !isLoading && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => refetch()}
                  className="text-white bg-rose-600 px-3 py-1 rounded-xl text-xs font-medium hover:bg-rose-500 shadow-xs cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <Board
                statuses={taskStatuses}
                tasks={filteredTasks}
                onTaskClick={(task) => setSelectedTaskForDetails(task)}
                onTaskDrop={handleDropTask}
                onAddTask={handleOpenCreateTask}
                onRecordLearning={(task) => setLearningModalTask(task)}
              />
            )}
          </div>
        </>
      ) : (
        /* Backlog & Sprint Versions View */
        <div className="flex-1 pt-1 overflow-hidden">
          <BacklogView
            tasks={filteredTasks}
            sprints={sprints}
            taskStatuses={taskStatuses}
            taskTypes={taskTypes}
            priorities={priorities}
            onTaskClick={(task) => setSelectedTaskForDetails(task)}
            onAddTaskToSprint={(sprintId) => handleOpenCreateTask('TASK_STAT_BACKLOG', sprintId)}
            onQuickCreateTask={async (title, sprintId, typeId) => {
              const res = await createTask({
                title,
                sprintId,
                typeId: typeId || 'TASK_TYPE_FEATURE',
                statusId: 'TASK_STAT_BACKLOG',
                priorityId: 'PRIO_MEDIUM',
              });
              return res.success;
            }}
            onMoveTaskToSprint={(taskId, targetSprintId) => {
              updateTask(taskId, { sprintId: targetSprintId });
            }}
            onOpenCreateSprint={() => {
              setEditingSprint(null);
              setSprintModalMode('create');
              setIsSprintModalOpen(true);
            }}
            onEditSprint={(sprint) => {
              setEditingSprint(sprint);
              setSprintModalMode('edit');
              setIsSprintModalOpen(true);
            }}
            onDeleteSprint={async (sprintId) => {
              await deleteSprint(sprintId);
            }}
            onUpdateSprintStatus={async (sprintId, status) => {
              await updateSprint(sprintId, { status });
            }}
            onDeleteTask={(taskId) => deleteTask(taskId)}
            onRecordLearning={(task) => setLearningModalTask(task)}
          />
        </div>
      )}

      {/* Task Details Modal (Opened when clicking any task on Board or Backlog) */}
      <TaskDetailsModal
        isOpen={selectedTaskForDetails !== null}
        task={selectedTaskForDetails}
        sprint={sprints.find((s) => s.id === selectedTaskForDetails?.sprintId) || null}
        onClose={() => setSelectedTaskForDetails(null)}
        onEdit={(task) => {
          setSelectedTaskForDetails(null);
          handleOpenEditTask(task);
        }}
        onDelete={(task) => {
          setSelectedTaskForDetails(null);
          deleteTask(task.id);
        }}
        onRecordLearning={(task) => {
          setSelectedTaskForDetails(null);
          setLearningModalTask(task);
        }}
      />

      {/* Task Modal (Create / Edit form) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        defaultStatusId={targetColumnId}
        defaultSprintId={defaultSprintId}
        sprints={sprints}
        taskTypes={taskTypes}
        taskStatuses={taskStatuses}
        priorities={priorities}
        onSaveTask={handleSaveTask}
        onDeleteTask={deleteTask}
      />

      {/* Sprint Modal (Create / Edit sprint & version) */}
      <SprintModal
        isOpen={isSprintModalOpen}
        mode={sprintModalMode}
        sprint={editingSprint}
        onClose={() => setIsSprintModalOpen(false)}
        onSubmit={async (data) => {
          if (sprintModalMode === 'create') {
            return await createSprint(data);
          } else if (editingSprint) {
            return await updateSprint(editingSprint.id, data);
          }
          return { success: false, error: 'Invalid sprint state' };
        }}
      />

      {/* Instant Task-Linked Learning Modal */}
      <LearningModal
        isOpen={learningModalTask !== null}
        mode="create"
        learning={null}
        defaultTaskId={learningModalTask?.id}
        defaultTitle={learningModalTask ? `Learnings from: ${learningModalTask.title}` : undefined}
        onClose={() => setLearningModalTask(null)}
        onSave={async (payload) => {
          return await createLearning({
            ...payload,
            taskId: learningModalTask?.id || payload.taskId,
          });
        }}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectOpen}
        project={project}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        project={project}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={() => {
          setIsDetailsOpen(false);
          setIsEditProjectOpen(true);
        }}
        onDelete={() => {
          setIsDetailsOpen(false);
          setIsDeleteProjectOpen(true);
        }}
      />

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteProjectOpen}
        title="Delete Project"
        itemName={project?.title || ''}
        itemType="Project"
        description="will be permanently removed along with all workspace tickets."
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};
