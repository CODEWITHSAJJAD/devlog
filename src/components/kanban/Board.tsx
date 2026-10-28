import React from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Column } from './Column';

interface BoardProps {
  statuses: Lookup[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskDrop?: (taskId: string, targetStatusId: string) => void;
  onAddTask?: (statusId: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  statuses,
  tasks,
  onTaskClick,
  onTaskDrop,
  onAddTask,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start select-none">
      {statuses.map((status) => (
        <Column
          key={status.id}
          status={status}
          tasks={tasks.filter((t) => t.statusId === status.id)}
          onTaskClick={onTaskClick}
          onTaskDrop={onTaskDrop}
          onAddTask={onAddTask}
        />
      ))}
    </div>
  );
};
