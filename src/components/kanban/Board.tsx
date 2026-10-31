import React from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Column } from './Column';

interface BoardProps {
  statuses: Lookup[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskDrop?: (taskId: string, targetStatusId: string) => void;
  onAddTask?: (statusId: string) => void;
  onRecordLearning?: (task: Task) => void;
}

export const Board: React.FC<BoardProps> = ({
  statuses,
  tasks,
  onTaskClick,
  onTaskDrop,
  onAddTask,
  onRecordLearning,
}) => {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 h-full items-start select-none touch-pan-x">
      {statuses.map((status) => (
        <Column
          key={status.id}
          status={status}
          tasks={tasks.filter((t) => t.statusId === status.id)}
          onTaskClick={onTaskClick}
          onTaskDrop={onTaskDrop}
          onAddTask={onAddTask}
          onRecordLearning={onRecordLearning}
        />
      ))}
    </div>
  );
};
