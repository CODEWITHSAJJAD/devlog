import React, { useState, useEffect } from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Modal } from '../shared/Modal';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { DeleteConfirmModal } from '../shared/DeleteConfirmModal';
import { useLearnings } from '../../hooks/useLearnings';
import { toDateInputValue } from '../../utils/api';
import { Sparkles, Trash2, BookOpen, Plus, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setTypeId(task.typeId);
      setStatusId(task.statusId);
      setPriorityId(task.priorityId);
      setDueDateStr(toDateInputValue(task.dueDate));
      refetchLearnings();
    } else {
      setTitle('');
      setDescription('');
      setTypeId('TASK_TYPE_FEATURE');
      setStatusId(defaultStatusId);
      setPriorityId('PRIO_MEDIUM');
      setDueDateStr('');
    }
    setIsAddingLearning(false);
    setError(null);
  }, [task, defaultStatusId, refetchLearnings]);

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
    if (!task?.id || !learningTitle.trim() || !learningContent.trim()) return;

    setIsSavingLearning(true);
    const tags = learningTagsStr
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
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
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isDeleteOpen}
        onClose={onClose}
        title={isEditing ? `Task: TSK-${task?.id.slice(0, 4).toUpperCase()}` : 'Create Task'}
        subtitle={
          isEditing
            ? 'Update specifications, transition status, or attach technical learnings'
            : 'Add a new ticket to the board'
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Task Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement WebCrypto Password Hashing"
                className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {taskTypes.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#14161c]">
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {taskStatuses.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#14161c]">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={priorityId}
                  onChange={(e) => setPriorityId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#14161c]">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
              <input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Description / Acceptance Criteria
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Technical specifications, acceptance criteria, or repro notes..."
                className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              {isEditing && onDeleteTask ? (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Task
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </div>
          </form>

          {/* Learning Logger Section (When editing an existing task) */}
          {isEditing && (
            <div className="pt-5 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    Attached Technical Learnings ({learnings.length})
                  </h4>
                </div>
                {!isAddingLearning && (
                  <button
                    type="button"
                    onClick={() => setIsAddingLearning(true)}
                    className="inline-flex items-center px-2.5 py-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Record Learning
                  </button>
                )}
              </div>

              {/* Add Learning Form */}
              {isAddingLearning && (
                <form
                  onSubmit={handleCreateLearning}
                  className="p-4 bg-[#0d0e12] border border-emerald-500/30 rounded-xl space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Record Technical Note
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingLearning(false)}
                      className="text-slate-400 hover:text-white text-xs"
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
                    className="w-full px-3 py-1.5 bg-[#14161c] border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  <textarea
                    required
                    rows={4}
                    placeholder="Markdown note, root cause, architectural decision, code snippet..."
                    value={learningContent}
                    onChange={(e) => setLearningContent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#14161c] border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                  />
                  <input
                    type="text"
                    placeholder="Tags comma-separated (e.g. D1, Edge, Security)"
                    value={learningTagsStr}
                    onChange={(e) => setLearningTagsStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#14161c] border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingLearning}
                      className="flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSavingLearning && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {isSavingLearning ? 'Saving...' : 'Save Learning'}
                    </button>
                  </div>
                </form>
              )}

              {/* List of Existing Learnings for this Task */}
              <div className="space-y-2.5">
                {learnings.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 bg-[#0d0e12] border border-white/[0.06] rounded-xl space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{l.title}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteLearning(l.id);
                          refetchLearnings();
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete learning"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <MarkdownViewer content={l.content} className="text-xs text-slate-300" />
                    {l.tags && l.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-white/[0.04]">
                        {l.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {learnings.length === 0 && !isAddingLearning && (
                  <p className="text-xs font-mono text-slate-600 italic py-2">
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
          description="will be soft-deleted. Attached learnings will remain archived in the Knowledge Base."
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
