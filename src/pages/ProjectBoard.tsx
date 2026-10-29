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
} from 'lucide-react';
import { Board } from '../components/kanban/Board';
import { TaskModal } from '../components/kanban/TaskModal';
import { LearningModal } from '../components/shared/LearningModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { DropdownMenu } from '../components/shared/DropdownMenu';
import { Badge, resolveBadgeVariant } from '../components/shared/Badge';
import { useFetchTasks } from '../hooks/useFetchTasks';
import { useLookups } from '../hooks/useLookups';
import { useLearnings } from '../hooks/useLearnings';
import { apiFetch } from '../utils/api';
import { calculateProjectProgress } from '../utils/progress';
import type { Task, Lookup, Project } from '../../shared/types';

export const ProjectBoard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Project state
  const [project, setProject] = useState<Project | null>(null);

  // Project modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  // Tasks hook
  const { tasks, isLoading, error, refetch, createTask, updateTask, moveTask, deleteTask } =
    useFetchTasks(projectId);

  // Learnings hook for task-linked learnings
  const { createLearning } = useLearnings();
  const [learningModalTask, setLearningModalTask] = useState<Task | null>(null);

  const { lookups: taskStatuses } = useLookups('TASK_STATUS');
  const { lookups: taskTypes } = useLookups('TASK_TYPE');
  const { lookups: priorities } = useLookups('PRIORITY');

  // Task modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('TASK_STAT_BACKLOG');

  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchId) return false;
    }
    return true;
  });

  const handleOpenCreateTask = (statusId: string = 'TASK_STAT_BACKLOG') => {
    setSelectedTask(null);
    setTargetColumnId(statusId);
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
    dueDate?: number;
  }) => {
    if (selectedTask) {
      return await updateTask(selectedTask.id, data);
    } else {
      return await createTask({ ...data, statusId: targetColumnId });
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full px-4 sm:px-6 py-4 select-none overflow-hidden space-y-3">
      {/* 1. Apple Project Breadcrumbs & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-black/[0.06] flex-shrink-0 gap-3">
        {/* Left: Breadcrumbs & Project Identity */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-lg shadow-2xs">
                PRJ-{projectId?.slice(0, 4).toUpperCase()}
              </span>
              <h1 className="text-base font-bold text-[#1D1D1F] tracking-tight">
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
              <p className="text-xs text-[#6E6E73] line-clamp-1 mt-0.5 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Progress Meter & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-black/[0.06] shadow-xs text-xs">
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

          {/* Project Options Menu */}
          {project && (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors border border-black/[0.06] shadow-xs bg-white"
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

          {/* New Task Button */}
          <button
            onClick={() => handleOpenCreateTask('TASK_STAT_BACKLOG')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Compact Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 flex-shrink-0 gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search filter input */}
          <div className="relative">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-1.5 bg-white border border-black/[0.08] hover:border-black/[0.14] focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] w-48 sm:w-56 transition-colors shadow-2xs font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-[#86868B] hover:text-[#1D1D1F] text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Type Filter Segmented Control */}
          <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
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
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
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
          <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
            <button
              onClick={() => setPriorityFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
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
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
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

      {/* 3. 6-Lane Kanban Board Surface */}
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
              className="text-white bg-rose-600 px-3 py-1 rounded-xl text-xs font-medium hover:bg-rose-500 shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <Board
            statuses={taskStatuses}
            tasks={filteredTasks}
            onTaskClick={handleOpenEditTask}
            onTaskDrop={handleDropTask}
            onAddTask={handleOpenCreateTask}
            onRecordLearning={(task) => setLearningModalTask(task)}
          />
        )}
      </div>

      {/* Task Modal (Create / Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        defaultStatusId={targetColumnId}
        taskTypes={taskTypes}
        taskStatuses={taskStatuses}
        priorities={priorities}
        onSaveTask={handleSaveTask}
        onDeleteTask={deleteTask}
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
