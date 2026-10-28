import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Board } from '../components/kanban/Board';
import { TaskModal } from '../components/kanban/TaskModal';
import { useFetchTasks } from '../hooks/useFetchTasks';
import { useLookups } from '../hooks/useLookups';
import type { Task, Lookup } from '../../shared/types';

export const ProjectBoard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { tasks, isLoading, error, refetch, createTask, updateTask, moveTask, deleteTask } =
    useFetchTasks(projectId);

  const { lookups: taskStatuses } = useLookups('TASK_STATUS');
  const { lookups: taskTypes } = useLookups('TASK_TYPE');
  const { lookups: priorities } = useLookups('PRIORITY');

  // Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>('TASK_STAT_BACKLOG');

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

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

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#090a0f] p-6 select-none overflow-hidden">
      {/* Board Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Kanban Board
            </h1>
            <p className="text-[11px] font-mono text-slate-500">
              Drag tickets between columns to update status & trigger learning prompts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Type Filter Chips */}
          <div className="flex items-center bg-[#11131a] border border-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                typeFilter === 'ALL' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {taskTypes.map((t: Lookup) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                  typeFilter === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenCreateTask('TASK_STAT_BACKLOG')}
            className="flex items-center px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
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
    </div>
  );
};
