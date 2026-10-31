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

  // Apple Status accent dot for all 6 column types
  const getStatusColor = () => {
    const s = status.id.toUpperCase();
    if (s.includes('DONE') || s.includes('COMPLETED')) return 'bg-[#34C759]';
    if (s.includes('TESTING') || s.includes('QA') || s.includes('REVIEW')) return 'bg-[#0071E3]';
    if (s.includes('IN_PROGRESS') || s.includes('PROGRESS')) return 'bg-[#FF9500]';
    if (s.includes('BLOCKED')) return 'bg-[#FF3B30]';
    if (s.includes('TODO') || s.includes('TO_DO')) return 'bg-[#5856D6]';
    return 'bg-[#86868B]';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-[80vw] sm:w-76 min-w-[17.5rem] sm:min-w-[19rem] max-w-[20rem] sm:max-w-[19rem] rounded-2xl border transition-all flex-shrink-0 max-h-full overflow-hidden ${
        isDragOver
          ? 'border-[#0071E3] bg-[#E8F2FE]/60 ring-2 ring-[#0071E3]/20 shadow-md'
          : 'bg-[#ECECEF]/70 border-black/[0.05]'
      }`}
    >
      {/* Apple Workstation Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <h3 className="font-semibold text-xs text-[#1D1D1F]">
            {status.label}
          </h3>
          <span className="text-[10px] font-mono text-[#6E6E73] bg-white/80 border border-black/[0.06] px-2 py-0.5 rounded-full font-medium shadow-2xs">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask?.(status.id)}
          className="text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg hover:bg-white/80 transition-colors"
          title={`Add task to ${status.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List / Drop Zone */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto min-h-[220px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task)}
            onRecordLearning={onRecordLearning}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-black/[0.08] rounded-xl text-[#86868B] text-xs font-mono gap-1 transition-colors bg-white/40">
            <span>Empty lane</span>
            <button
              onClick={() => onAddTask?.(status.id)}
              className="text-[11px] text-[#0071E3] hover:underline font-medium"
            >
              + Add task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
