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
      className={`flex flex-col w-80 bg-[#0d0e14] rounded-xl border transition-colors flex-shrink-0 max-h-full ${
        isDragOver ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-white/5'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-tight text-slate-200">
            {status.label}
          </span>
          <span className="text-[10px] font-mono font-medium bg-white/5 text-slate-400 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(status.id)}
          className="text-slate-500 hover:text-slate-200 p-1 rounded hover:bg-white/5 transition-colors"
          title={`Add task to ${status.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto min-h-[150px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border border-dashed border-white/5 rounded-lg text-slate-600 text-xs font-mono">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
