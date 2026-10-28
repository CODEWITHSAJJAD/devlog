import React, { useState } from 'react';
import type { Task } from '../../../shared/types';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { formatDate, parseToDate } from '../../utils/api';
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

  // Priority icon renderer
  const renderPriorityIcon = () => {
    const prio = task.priorityId.toUpperCase();
    if (prio.includes('CRITICAL')) {
      return (
        <span title="Critical Priority">
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
        </span>
      );
    }
    if (prio.includes('HIGH')) {
      return (
        <span title="High Priority">
          <ChevronsUp className="w-3.5 h-3.5 text-orange-400" />
        </span>
      );
    }
    if (prio.includes('MED')) {
      return (
        <span title="Medium Priority">
          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
        </span>
      );
    }
    return (
      <span title="Low Priority">
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
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
      return { label: 'Overdue', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
    if (!isDone && diffDays <= 2) {
      return { label: 'Due soon', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    return { label: formatDate(task.dueDate), color: 'text-slate-400 bg-white/[0.03] border-white/[0.06]' };
  };

  const dueStatus = getDueStatus();

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
      className={`group relative p-3.5 rounded-xl bg-[#0c0e14] hover:bg-[#11131b] border border-white/[0.06] hover:border-white/[0.14] cursor-grab active:cursor-grabbing transition-all duration-150 active:scale-[0.98] shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] ${
        isDragging ? 'opacity-40 rotate-1 scale-105 border-indigo-500' : ''
      } ${isDone ? 'opacity-85' : ''}`}
    >
      {/* Top Header: ID + Priority Icon + Type Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-slate-500 font-semibold group-hover:text-indigo-400 transition-colors">
            {shortId}
          </span>
          <Badge
            label={task.typeId.replace('TASK_TYPE_', '')}
            variant={resolveBadgeVariant(task.typeId)}
            dot
          />
        </div>
        <div className="flex items-center gap-1.5">
          {renderPriorityIcon()}
          <span className="text-[10px] font-mono text-slate-400">
            {task.priorityId.replace('PRIO_', '')}
          </span>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed mb-1.5 group-hover:text-white transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {task.description}
        </p>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          {isDone ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
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
            <span className="inline-flex items-center text-slate-500">
              <Clock className="w-2.5 h-2.5 mr-1" />
              No deadline
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
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all active:scale-95 shadow-sm"
            title="Record learning for this completed task"
          >
            <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-400" />
            + Learning
          </button>
        )}
      </div>
    </div>
  );
};
