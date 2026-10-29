import React, { useState } from 'react';
import type { Task } from '../../../shared/types';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { formatDate, parseToDate } from '../../utils/api';
import { getTaskProgress } from '../../utils/progress';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onRecordLearning?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onRecordLearning,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const shortId = `TSK-${task.id.slice(0, 4).toUpperCase()}`;
  const isDone = task.statusId === 'TASK_STAT_DONE';
  const progress = getTaskProgress(task.statusId);

  // Priority icon renderer
  const renderPriorityIcon = () => {
    const prio = task.priorityId.toUpperCase();
    if (prio.includes('CRITICAL')) {
      return (
        <span title="Critical Priority">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
        </span>
      );
    }
    if (prio.includes('HIGH')) {
      return (
        <span title="High Priority">
          <ChevronsUp className="w-3.5 h-3.5 text-orange-500" />
        </span>
      );
    }
    if (prio.includes('MED')) {
      return (
        <span title="Medium Priority">
          <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
        </span>
      );
    }
    return (
      <span title="Low Priority">
        <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
      </span>
    );
  };

  // Due date status
  const getDueStatus = () => {
    const dueDateObj = parseToDate(task.dueDate);
    if (!dueDateObj) return null;
    const now = Date.now();
    const diffDays = Math.ceil((dueDateObj.getTime() - now) / (1000 * 60 * 60 * 24));

    if (!isDone && diffDays < 0) {
      return { label: 'Overdue', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    }
    if (!isDone && diffDays <= 2) {
      return { label: 'Due soon', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { label: formatDate(task.dueDate), color: 'text-[#6E6E73] bg-black/[0.03] border-black/[0.06]' };
  };

  const dueStatus = getDueStatus();

  // Progress Bar color fill
  const getProgressFill = () => {
    if (progress >= 100) return 'bg-[#34C759]';
    if (progress >= 75) return 'bg-[#0071E3]';
    if (progress >= 45) return 'bg-[#FF9500]';
    if (progress >= 20) return 'bg-[#5856D6]';
    return 'bg-black/20';
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart?.(e, task.id);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      className={`p-3.5 rounded-xl bg-white hover:bg-white/95 border border-black/[0.06] hover:border-[#0071E3]/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-grab active:cursor-grabbing transition-all select-none group ${
        isDragging ? 'opacity-40 border-[#0071E3]' : ''
      } ${isDone ? 'opacity-90' : ''}`}
    >
      {/* Top Header: ID + Priority Icon + Type Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-[#0071E3] font-bold bg-[#E8F2FE] border border-[#0071E3]/20 px-1.5 py-0.2 rounded">
            {shortId}
          </span>
          <Badge
            label={task.typeId.replace('TASK_TYPE_', '')}
            variant={resolveBadgeVariant(task.typeId)}
            dot
          />
        </div>
        <div className="flex items-center gap-1">
          {renderPriorityIcon()}
          <span className="text-[10px] font-mono text-[#86868B]">
            {task.priorityId.replace('PRIO_', '')}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-[#1D1D1F] line-clamp-2 leading-relaxed mb-1.5 group-hover:text-[#0071E3] transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-[#6E6E73] line-clamp-2 leading-relaxed mb-2.5">
          {task.description}
        </p>
      )}

      {/* Task Linear Progress Bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#86868B] mb-1">
          <span className="text-[#86868B]">Progress</span>
          <span className="font-bold text-[#1D1D1F]">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden p-[1px]">
          <div
            className={`h-full ${getProgressFill()} rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer Metadata */}
      <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          {isDone ? (
            <span className="inline-flex items-center text-[10px] font-semibold text-[#34C759]">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Done
            </span>
          ) : dueStatus ? (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${dueStatus.color}`}
            >
              <Calendar className="w-2.5 h-2.5 mr-1" />
              {dueStatus.label}
            </span>
          ) : (
            <span className="inline-flex items-center text-[#86868B]">
              <Clock className="w-2.5 h-2.5 mr-1" />
              No date
            </span>
          )}
        </div>

        {/* Record Learning Fast Trigger */}
        {isDone && onRecordLearning && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRecordLearning(task);
            }}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
            title="Record learning for this completed task"
          >
            <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-600" />
            + Learning
          </button>
        )}
      </div>
    </div>
  );
};
