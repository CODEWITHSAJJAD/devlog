import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Board } from '../components/kanban/Board';
import { TaskModal } from '../components/kanban/TaskModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { DropdownMenu } from '../components/shared/DropdownMenu';
import { Badge, resolveBadgeVariant } from '../components/shared/Badge';
import { useFetchTasks } from '../hooks/useFetchTasks';
import { useLookups } from '../hooks/useLookups';
import { apiFetch } from '../utils/api';
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

  const { lookups: taskStatuses } = useLookups('TASK_STATUS');
  const { lookups: taskTypes } = useLookups('TASK_TYPE');
  const { lookups: priorities } = useLookups('PRIORITY');

  // Task modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('TASK_STAT_BACKLOG');

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

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

  const filteredTasks = tasks.filter((t) => {
    if (typeFilter !== 'ALL' && t.typeId !== typeFilter) return false;
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
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-7xl mx-auto w-full p-4 md:p-6 select-none overflow-hidden">
      {/* Board Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] flex-shrink-0 gap-3">
        <div className="flex items-center gap-3.5">
          <Link
            to="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#101217] hover:bg-white/10 border border-white/[0.06] transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-indigo-400/90 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                PRJ-{projectId?.slice(0, 4).toUpperCase()}
              </span>
              <h1 className="text-base font-bold text-white tracking-tight">
                {project?.title || 'Kanban Board'}
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

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Project Options Menu */}
          {project && (
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#101217] hover:bg-white/10 border border-white/[0.06] transition-colors"
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

          {/* Type Filter Chips */}
          <div className="flex items-center bg-[#101217] border border-white/[0.06] rounded-xl p-0.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({tasks.length})
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

          <button
            onClick={() => handleOpenCreateTask('TASK_STAT_BACKLOG')}
            className="flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Board Content (4-State) */}
      <div className="flex-1 pt-4 overflow-hidden">
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
          />
        )}
      </div>

      {/* Task Modal (Create / Edit / Attach Learnings) */}
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
