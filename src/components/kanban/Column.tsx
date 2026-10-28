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
  onRecordLearning?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onTaskDrop,
  onAddTask,
  onRecordLearning,
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

  // Get status accent colors
  const getStatusTheme = () => {
    const s = status.id.toUpperCase();
    if (s.includes('DONE') || s.includes('COMPLETED')) {
      return {
        pip: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      };
    }
    if (s.includes('PROGRESS')) {
      return {
        pip: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      };
    }
    if (s.includes('REVIEW')) {
      return {
        pip: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
    }
    return {
      pip: 'bg-slate-400',
      badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
  };

  const theme = getStatusTheme();

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-80 min-w-[20rem] rounded-2xl border transition-all duration-200 flex-shrink-0 max-h-full ${
        isDragOver
          ? 'border-indigo-500/60 bg-indigo-950/20 shadow-[0_0_30px_rgba(99,102,241,0.18)] scale-[1.01]'
          : 'bg-[#090b10]/90 backdrop-blur-xl border-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Machined Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${theme.pip}`} />
          <h3 className="font-semibold text-xs tracking-tight text-slate-200">
            {status.label}
          </h3>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(status.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition-colors active:scale-95"
          title={`Add task to ${status.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List / Drop Zone */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[220px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
            onRecordLearning={onRecordLearning}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/[0.06] hover:border-white/[0.12] rounded-xl text-slate-500 text-xs font-mono gap-1.5 transition-colors">
            <span>No tasks in this lane</span>
            <button
              onClick={() => onAddTask?.(status.id)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Create task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
