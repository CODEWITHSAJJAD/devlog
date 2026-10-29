import React, { useState, useEffect } from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Modal } from '../shared/Modal';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { DeleteConfirmModal } from '../shared/DeleteConfirmModal';
import { useLearnings } from '../../hooks/useLearnings';
import { toDateInputValue } from '../../utils/api';
import { Sparkles, Trash2, BookOpen, Plus, Loader2, Calendar } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatusId?: string;
  taskTypes: Lookup[];
  taskStatuses: Lookup[];
  priorities: Lookup[];
  onSaveTask: (data: {
    title: string;
    description?: string;
    typeId: string;
    statusId?: string;
    priorityId?: string;
    dueDate?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  onDeleteTask?: (taskId: string) => Promise<{ success: boolean; error?: string }>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  defaultStatusId = 'TASK_STAT_BACKLOG',
  taskTypes,
  taskStatuses,
  priorities,
  onSaveTask,
  onDeleteTask,
}) => {
  const isEditing = !!task;

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('TASK_TYPE_FEATURE');
  const [statusId, setStatusId] = useState(defaultStatusId);
  const [priorityId, setPriorityId] = useState('PRIO_MEDIUM');
  const [dueDateStr, setDueDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Learning Logger state
  const {
    learnings,
    createLearning,
    deleteLearning,
    refetch: refetchLearnings,
  } = useLearnings(task?.id);

  const [isAddingLearning, setIsAddingLearning] = useState(false);
  const [learningTitle, setLearningTitle] = useState('');
  const [learningContent, setLearningContent] = useState('');
  const [learningTagsStr, setLearningTagsStr] = useState('');
  const [isSavingLearning, setIsSavingLearning] = useState(false);

  // Sync form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setTypeId(task.typeId || 'TASK_TYPE_FEATURE');
      setStatusId(task.statusId || defaultStatusId);
      setPriorityId(task.priorityId || 'PRIO_MEDIUM');
      setDueDateStr(toDateInputValue(task.dueDate));
    } else {
      setTitle('');
      setDescription('');
      setTypeId('TASK_TYPE_FEATURE');
      setStatusId(defaultStatusId);
      setPriorityId('PRIO_MEDIUM');
      setDueDateStr('');
    }
    setError(null);
    setIsAddingLearning(false);
  }, [task, defaultStatusId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const dueDate = dueDateStr ? Math.floor(new Date(dueDateStr).getTime() / 1000) : undefined;

    const res = await onSaveTask({
      title: title.trim(),
      description: description.trim() || undefined,
      typeId,
      statusId,
      priorityId,
      dueDate,
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to save task');
    }
  };

  const handleCreateLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !learningTitle.trim() || !learningContent.trim()) return;

    setIsSavingLearning(true);
    const tags = learningTagsStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const res = await createLearning({
      taskId: task.id,
      title: learningTitle.trim(),
      content: learningContent.trim(),
      tags,
    });

    setIsSavingLearning(false);

    if (res.success) {
      setLearningTitle('');
      setLearningContent('');
      setLearningTagsStr('');
      setIsAddingLearning(false);
      refetchLearnings();
    } else {
      setError(res.error || 'Failed to attach learning');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? 'Task Details' : 'Create New Task'}
        subtitle={
          isEditing
            ? `Tracking parameters for TSK-${task.id.slice(0, 4).toUpperCase()}`
            : 'Add a new ticket to your Kanban board'
        }
        maxWidth="max-w-xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono">
              {error}
            </div>
          )}

          {/* Task Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement WebCrypto Password Hashing"
                className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Type</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all"
                >
                  {taskTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Status</label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all"
                >
                  {taskStatuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Priority</label>
                <select
                  value={priorityId}
                  onChange={(e) => setPriorityId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all"
                >
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#86868B]" /> Target Deadline
              </label>
              <input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Description / Acceptance Criteria
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Technical specifications, acceptance criteria, or repro notes..."
                className="w-full p-3.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
              {isEditing && onDeleteTask ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex items-center px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 active:scale-95 bg-white shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Task
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Learning Logger Section (When editing an existing task) */}
          {isEditing && (
            <div className="pt-5 border-t border-black/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0071E3]" />
                  <h4 className="text-xs font-bold text-[#1D1D1F]">
                    Attached Technical Learnings ({learnings.length})
                  </h4>
                </div>
                {!isAddingLearning && (
                  <button
                    type="button"
                    onClick={() => setIsAddingLearning(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#0071E3] bg-[#E8F2FE] hover:bg-[#D5E8FD] rounded-xl transition-colors border border-[#0071E3]/20 font-semibold active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Learning
                  </button>
                )}
              </div>

              {/* Add Learning Form */}
              {isAddingLearning && (
                <form
                  onSubmit={handleCreateLearning}
                  className="p-4 bg-[#F5F5F7] border border-[#0071E3]/30 rounded-2xl space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#0071E3] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#0071E3]" />
                      Record Technical Note
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingLearning(false)}
                      className="text-[#86868B] hover:text-[#1D1D1F] text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Title (e.g. Cloudflare D1 JSON Serialization Handling)"
                    value={learningTitle}
                    onChange={(e) => setLearningTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3]"
                  />
                  <textarea
                    required
                    rows={4}
                    placeholder="Markdown note, root cause, architectural decision, code snippet..."
                    value={learningContent}
                    onChange={(e) => setLearningContent(e.target.value)}
                    className="w-full p-3 bg-white border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] font-mono leading-relaxed"
                  />
                  <input
                    type="text"
                    placeholder="Tags comma-separated (e.g. D1, Edge, Security)"
                    value={learningTagsStr}
                    onChange={(e) => setLearningTagsStr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:border-[#0071E3] font-mono"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingLearning}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-xs"
                    >
                      {isSavingLearning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isSavingLearning ? 'Saving...' : 'Save Learning'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* List of Existing Learnings for this Task */}
              <div className="space-y-3">
                {learnings.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 bg-[#F5F5F7] border border-black/[0.06] rounded-xl space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1D1D1F]">{l.title}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteLearning(l.id);
                          refetchLearnings();
                        }}
                        className="text-[#86868B] hover:text-rose-600 p-1 rounded-lg transition-colors"
                        title="Delete learning"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <MarkdownViewer content={l.content} className="text-xs text-[#1D1D1F]" />
                    {l.tags && l.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-black/[0.04]">
                        {l.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] px-2 py-0.5 rounded-md border border-[#0071E3]/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {learnings.length === 0 && !isAddingLearning && (
                  <p className="text-xs font-mono text-[#86868B] italic py-1">
                    No technical learnings logged for this ticket yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Task Confirmation Modal */}
      {task && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          title="Delete Task"
          itemName={task.title}
          itemType="Task"
          description="will be permanently deleted from this project board."
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            if (onDeleteTask) {
              const res = await onDeleteTask(task.id);
              if (res.success) {
                setIsDeleteOpen(false);
                onClose();
              }
              return res;
            }
            return { success: false };
          }}
        />
      )}
    </>
  );
};
