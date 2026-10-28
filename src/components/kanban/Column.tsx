import React from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  status: Lookup;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const Column: React.FC<ColumnProps> = ({ status, tasks, onTaskClick }) => {
  return (
    <div className="flex flex-col w-80 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
          {status.label}
        </h3>
        <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}
      </div>
    </div>
  );
};
