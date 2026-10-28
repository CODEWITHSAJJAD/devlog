import React, { useState } from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  status: Lookup;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskDrop?: (taskId: string, targetStatusId: string) => void;
  onAddTask?: (statusId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onTaskDrop,
  onAddTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTaskDrop?.(taskId, status.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 bg-[#0c0d12] rounded-2xl border transition-all duration-150 flex-shrink-0 max-h-full ${
        isDragOver
          ? 'border-indigo-500/50 bg-indigo-950/20 shadow-[0_0_24px_rgba(99,102,241,0.12)]'
          : 'border-white/[0.06]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-tight text-slate-200">
            {status.label}
          </span>
          <span className="text-[10px] font-mono font-medium bg-white/[0.05] text-slate-400 border border-white/[0.06] px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(status.id)}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors"
          title={`Add task to ${status.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[160px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-white/[0.06] rounded-xl text-slate-600 text-xs font-mono gap-1">
            <span>No tasks in this lane</span>
            <button
              onClick={() => onAddTask?.(status.id)}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              + Create task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
