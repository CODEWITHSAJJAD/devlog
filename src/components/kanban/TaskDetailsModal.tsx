import React from 'react';
import { Modal } from '../shared/Modal';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { formatDate } from '../../utils/api';
import { getTaskProgress } from '../../utils/progress';
import { useLearnings } from '../../hooks/useLearnings';
import type { Task, Sprint } from '../../../shared/types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Flame,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  BookOpen,
} from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  sprint?: Sprint | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRecordLearning?: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  task,
  sprint,
  onClose,
  onEdit,
  onDelete,
  onRecordLearning,
}) => {
  const { learnings } = useLearnings(task?.id);

  if (!task) return null;

  const shortId = `TSK-${task.id.slice(0, 4).toUpperCase()}`;
  const isDone = task.statusId === 'TASK_STAT_DONE';
  const progress = getTaskProgress(task.statusId);

  // Priority icon renderer
  const renderPriorityIcon = () => {
    const prio = task.priorityId.toUpperCase();
    if (prio.includes('CRITICAL')) {
      return <Flame className="w-3.5 h-3.5 text-rose-500" />;
    }
    if (prio.includes('HIGH')) {
      return <ChevronsUp className="w-3.5 h-3.5 text-orange-500" />;
    }
    if (prio.includes('MED')) {
      return <ChevronUp className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />;
  };

  // Progress Bar color fill
  const getProgressFill = () => {
    if (progress >= 100) return 'bg-[#34C759]';
    if (progress >= 75) return 'bg-[#0071E3]';
    if (progress >= 45) return 'bg-[#FF9500]';
    if (progress >= 20) return 'bg-[#5856D6]';
    return 'bg-black/20';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      subtitle={`Ticket Identifier: ${shortId}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status, Priority, Type & Sprint Bar */}
        <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-black/[0.06]">
          <Badge
            label={task.statusId.replace('TASK_STAT_', '')}
            variant={resolveBadgeVariant(task.statusId)}
            dot
          />
          <Badge
            label={task.typeId.replace('TASK_TYPE_', '')}
            variant={resolveBadgeVariant(task.typeId)}
          />
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-black/[0.04] text-[#1D1D1F] border border-black/[0.08]">
            {renderPriorityIcon()}
            <span>Priority: {task.priorityId.replace('PRIO_', '')}</span>
          </span>

          {/* Sprint / Version Info */}
          {sprint ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20">
              <Layers className="w-3 h-3 text-[#0071E3]" />
              {sprint.name} {sprint.version ? `(${sprint.version})` : ''}
            </span>
          ) : task.version ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-[#6E6E73] bg-black/[0.04] border border-black/[0.08]">
              Version: {task.version}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#86868B] bg-black/[0.03] border border-black/[0.06]">
              Product Backlog
            </span>
          )}

          {isDone && (
            <span className="inline-flex items-center text-xs text-[#34C759] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Done {task.completedAt ? `• ${formatDate(task.completedAt)}` : ''}
            </span>
          )}
        </div>

        {/* Multiline Description with Markdown Support and Dedicated Scroll */}
        <div>
          <h4 className="text-xs font-semibold text-[#1D1D1F] mb-1.5 flex items-center justify-between">
            <span>Description & Acceptance Criteria</span>
            {task.description && (
              <span className="text-[10px] font-mono text-[#86868B]">Multiline Markdown</span>
            )}
          </h4>
          <div className="p-3.5 sm:p-4 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs text-[#1D1D1F] leading-relaxed break-words min-h-[5.5rem] max-h-48 sm:max-h-60 overflow-y-auto pr-2.5">
            {task.description ? (
              <MarkdownViewer content={task.description} />
            ) : (
              <p className="text-[#86868B] italic">No detailed description provided for this task.</p>
            )}
          </div>
        </div>

        {/* Timeline & Progress Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 sm:p-3.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl">
            <span className="text-[#86868B] block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#0071E3]" /> Target Deadline
            </span>
            <span className="text-[#1D1D1F] font-semibold font-mono">
              {task.dueDate ? formatDate(task.dueDate) : 'No deadline'}
            </span>
          </div>

          <div className="p-3 sm:p-3.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl">
            <span className="text-[#86868B] block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#0071E3]" /> Created Date
            </span>
            <span className="text-[#1D1D1F] font-semibold font-mono">
              {formatDate(task.createdAt)}
            </span>
          </div>

          <div className="p-3 sm:p-3.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#86868B] font-mono text-[11px]">Progress Weight</span>
              <span className="text-[#1D1D1F] font-bold font-mono text-[11px]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-black/[0.05] rounded-full overflow-hidden p-[1px]">
              <div
                className={`h-full ${getProgressFill()} rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Associated Technical Learnings Section with Dedicated Scroll */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Technical Learnings ({learnings.length})</span>
            </h4>
            {onRecordLearning && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordLearning(task);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>+ Log Learning</span>
              </button>
            )}
          </div>

          {learnings.length > 0 ? (
            <div className="space-y-2 max-h-52 sm:max-h-64 overflow-y-auto pr-1">
              {learnings.map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-white border border-black/[0.06] rounded-xl text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1D1D1F]">{l.title}</span>
                    <span className="text-[10px] font-mono text-[#86868B]">
                      {formatDate(l.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#6E6E73] text-[11px] line-clamp-3 leading-relaxed">
                    {l.content}
                  </p>
                  {l.tags && l.tags.length > 0 && (
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {l.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/[0.03] text-[#6E6E73] border border-black/[0.05]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-[#F5F5F7] border border-dashed border-black/[0.08] rounded-xl text-center text-xs text-[#86868B] font-mono">
              No learnings logged for this ticket yet. Click "+ Log Learning" to preserve insights.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between pt-4 border-t border-black/[0.06] gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3.5 py-2 sm:py-1.5 text-xs text-[#1D1D1F] hover:bg-black/[0.05] rounded-xl transition-colors border border-black/[0.08] active:scale-95 bg-white shadow-2xs cursor-pointer font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5 text-[#6E6E73]" />
              Edit Task
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(task);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3.5 py-2 sm:py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 active:scale-95 bg-white shadow-2xs cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Task
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#F5F5F7] hover:bg-black/[0.08] text-[#1D1D1F] text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
