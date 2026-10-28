import React from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Column } from './Column';

interface BoardProps {
  statuses: Lookup[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export const Board: React.FC<BoardProps> = ({ statuses, tasks, onTaskClick }) => {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full">
      {statuses.map((status) => (
        <Column
          key={status.id}
          status={status}
          tasks={tasks.filter((t) => t.statusId === status.id)}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};
