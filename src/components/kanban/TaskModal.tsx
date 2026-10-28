import React, { useState, useEffect } from 'react';
import type { Task, Lookup } from '../../../shared/types';
import { Modal } from '../shared/Modal';
import { MarkdownViewer } from '../shared/MarkdownViewer';
import { useLearnings } from '../../hooks/useLearnings';
import { Sparkles, Trash2, BookOpen, Plus } from 'lucide-react';

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

  // Learning Logger state
  const { learnings, createLearning, refetch: refetchLearnings } = useLearnings(task?.id);
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
      setDueDateStr(
        task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      );
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Task (${task?.id.slice(0, 4).toUpperCase()})` : 'Create Task'}
      subtitle={isEditing ? 'Update details or attach technical learnings' : 'Add a ticket to the board'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement WebCrypto Password Hashing"
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {taskTypes.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#11131a]">
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
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {taskStatuses.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#11131a]">
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
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#11131a]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Acceptance Criteria</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specs, repro steps, or acceptance requirements..."
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {isEditing && onDeleteTask ? (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    await onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="flex items-center text-xs text-rose-400 hover:text-rose-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Task
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>

        {/* Learning Logger Section (When editing an existing task) */}
        {isEditing && (
          <div className="pt-5 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-slate-200">
                  Technical Learnings ({learnings.length})
                </h4>
              </div>
              {!isAddingLearning && (
                <button
                  type="button"
                  onClick={() => setIsAddingLearning(true)}
                  className="flex items-center text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Record Learning
                </button>
              )}
            </div>

            {/* Add Learning Drawer/Form */}
            {isAddingLearning && (
              <form onSubmit={handleCreateLearning} className="p-3 bg-black/40 border border-emerald-500/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    New Architectural / Debug Learning
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingLearning(false)}
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Learning Title (e.g. Cloudflare D1 JSON Serialization quirk)"
                  value={learningTitle}
                  onChange={(e) => setLearningTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Markdown lesson, root cause, architectural decision, code snippets..."
                  value={learningContent}
                  onChange={(e) => setLearningContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Tags comma-separated (e.g. D1, Edge, Security)"
                  value={learningTagsStr}
                  onChange={(e) => setLearningTagsStr(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingLearning}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                  >
                    {isSavingLearning ? 'Saving...' : 'Save Learning to Knowledge Base'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Existing Learnings for this Task */}
            <div className="space-y-2.5">
              {learnings.map((l) => (
                <div key={l.id} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-100">{l.title}</span>
                  </div>
                  <MarkdownViewer content={l.content} className="text-xs text-slate-400" />
                  {l.tags && l.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {l.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
