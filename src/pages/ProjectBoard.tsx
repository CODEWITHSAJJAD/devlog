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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full px-4 sm:px-6 md:px-8 py-4 select-none overflow-hidden">
      {/* 1. Project Breadcrumbs & Telemetry HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3.5 border-b border-white/[0.08] flex-shrink-0 gap-3.5">
        {/* Left: Breadcrumbs & Project Monogram */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#131622] hover:bg-[#181c2a] border border-white/[0.08] transition-all active:scale-95"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                PRJ-{projectId?.slice(0, 4).toUpperCase()}
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                {project?.title || 'Project Board'}
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
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Telemetry Health Gauge & Action Suite */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Progress Telemetry Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#131622] border border-white/[0.08]">
            {/* Circular mini gauge */}
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white/[0.08]"
                  fill="transparent"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={44}
                  strokeDashoffset={44 - (44 * completionPercentage) / 100}
                  className="text-sky-400 transition-all duration-500"
                  fill="transparent"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="font-semibold text-slate-200">{completionPercentage}%</span>
              <span className="text-slate-400">
                ({doneTasks}/{totalTasks} closed{testingTasks > 0 ? `, ${testingTasks} in testing` : ''})
              </span>
            </div>
            {criticalTasks > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                <Flame className="w-2.5 h-2.5" />
                {criticalTasks} critical
              </span>
            )}
          </div>

          {/* Project Options Menu */}
          {project && (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#131622] hover:bg-[#181c2a] border border-white/[0.08] transition-colors active:scale-95"
                  title="Project settings"
                >
                  <MoreVertical className="w-4 h-4" />
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
            className="flex items-center px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_10px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Task
          </button>
        </div>
      </div>

      {/* 2. Interactive Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 flex-shrink-0 gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search filter input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-1.5 bg-[#131622] border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44 sm:w-56 transition-colors font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1.5 text-slate-500 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center bg-[#131622] border border-white/[0.06] rounded-xl p-0.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Types
            </button>
            {taskTypes.map((t: Lookup) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                  typeFilter === t.id
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center bg-[#131622] border border-white/[0.06] rounded-xl p-0.5">
            <button
              onClick={() => setPriorityFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                priorityFilter === 'ALL'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Priorities
            </button>
            {priorities.map((p: Lookup) => (
              <button
                key={p.id}
                onClick={() => setPriorityFilter(p.id)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                  priorityFilter === p.id
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task counter indicator */}
        <div className="text-[11px] font-mono text-slate-500">
          Showing <span className="text-white font-semibold">{filteredTasks.length}</span> of {tasks.length} tasks
        </div>
      </div>

      {/* 3. Kanban Board Surface */}
      <div className="flex-1 pt-1.5 overflow-hidden">
        {isLoading && (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
            Loading Kanban board...
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => refetch()}
              className="text-white bg-rose-600 px-3 py-1 rounded text-xs font-medium hover:bg-rose-500"
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

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsOpen}
        project={project}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={() => setIsEditProjectOpen(true)}
        onDelete={() => setIsDeleteProjectOpen(true)}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectOpen}
        project={project}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
      />

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteProjectOpen}
        title="Delete Project"
        itemName={project?.title || ''}
        itemType="Project"
        description="will be soft-deleted. You will be redirected to the projects list."
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
};
