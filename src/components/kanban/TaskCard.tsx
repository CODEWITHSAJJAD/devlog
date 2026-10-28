import React from 'react';
import type { Task } from '../../../shared/types';
import { formatDate } from '../../utils/api';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          {task.typeId}
        </span>
        <span className="text-xs text-slate-400">
          {formatDate(task.dueDate)}
        </span>
      </div>
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">
        {task.title}
      </h4>
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
    </div>
  );
};
