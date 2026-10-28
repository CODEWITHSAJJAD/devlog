import React from 'react';
import type { Task } from '../../../shared/types';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { formatDate } from '../../utils/api';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDragStart }) => {
  const shortId = `TSK-${task.id.slice(0, 4).toUpperCase()}`;
  const isDone = task.statusId === 'TASK_STAT_DONE';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart?.(e, task.id);
      }}
      onClick={onClick}
      className={`p-3.5 bg-[#101217] hover:bg-[#14161c] rounded-xl border border-white/[0.06] hover:border-white/[0.14] cursor-grab active:cursor-grabbing transition-all duration-150 active:scale-[0.98] group relative shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] ${
        isDone ? 'opacity-80' : ''
      }`}
    >
      {/* Top Header: ID + Type + Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-slate-500 font-semibold group-hover:text-indigo-400 transition-colors">
            {shortId}
          </span>
          <Badge
            label={task.typeId.replace('TASK_TYPE_', '')}
            variant={resolveBadgeVariant(task.typeId)}
            dot
          />
        </div>
        <Badge
          label={task.priorityId.replace('PRIO_', '')}
          variant={resolveBadgeVariant(task.priorityId)}
          className="text-[10px]"
        />
      </div>

      {/* Title */}
      <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed mb-1.5 group-hover:text-white transition-colors">
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
          {task.description}
        </p>
      )}

      {/* Footer Metadata */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          {isDone ? (
            <span className="inline-flex items-center text-emerald-400">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Done
            </span>
          ) : task.dueDate ? (
            <span className="inline-flex items-center text-slate-400">
              <Calendar className="w-3 h-3 mr-1 text-slate-500" />
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="inline-flex items-center text-slate-600">
              <Clock className="w-3 h-3 mr-1" />
              No deadline
            </span>
          )}
        </div>

        {isDone && (
          <span className="inline-flex items-center text-emerald-400 text-[10px] hover:underline font-medium">
            <Sparkles className="w-3 h-3 mr-0.5" /> Log
          </span>
        )}
      </div>
    </div>
  );
};
