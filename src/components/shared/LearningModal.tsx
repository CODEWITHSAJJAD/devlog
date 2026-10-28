import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { MarkdownViewer } from './MarkdownViewer';
import { formatDate, apiFetch } from '../../utils/api';
import type { Learning, Task } from '../../../shared/types';
import {
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  Loader2,
  Eye,
  FileCode,
  X,
} from 'lucide-react';

interface LearningModalProps {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  learning: Learning | null;
  initialTaskId?: string;
  onClose: () => void;
  onSave?: (
    payload: { taskId: string; title: string; content: string; tags: string[] },
    id?: string
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete?: (learning: Learning) => void;
  onSwitchToEdit?: (learning: Learning) => void;
}

export const LearningModal: React.FC<LearningModalProps> = ({
  isOpen,
  mode,
  learning,
  initialTaskId,
  onClose,
  onSave,
  onDelete,
  onSwitchToEdit,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState(initialTaskId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Available tasks for selection if creating from Knowledge Base
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (learning && (mode === 'view' || mode === 'edit')) {
      setTitle(learning.title);
      setContent(learning.content);
      setTaskId(learning.taskId);
      setTags(learning.tags || []);
      setError(null);
    } else if (mode === 'create') {
      setTitle('');
      setContent('');
      setTaskId(initialTaskId || '');
      setTags([]);
      setError(null);
    }
  }, [learning, mode, initialTaskId]);

  useEffect(() => {
    if (isOpen && mode === 'create' && !initialTaskId) {
      setLoadingTasks(true);
      apiFetch<Task[]>('/api/tasks')
        .then((res) => {
          if (res.success && res.data) {
            setAvailableTasks(res.data);
            if (res.data.length > 0 && !taskId) {
              setTaskId(res.data[0].id);
            }
          }
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [isOpen, mode, initialTaskId, taskId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleCopyMarkdown = () => {
    if (!learning) return;
    const text = `# ${learning.title}\n\n${learning.content}\n\nTags: ${learning.tags?.join(', ') || 'none'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !taskId) {
      setError('Title, content, and parent task are required.');
      return;
    }

    if (!onSave) return;

    setIsSubmitting(true);
    setError(null);

    const res = await onSave(
      {
        taskId,
        title: title.trim(),
        content: content.trim(),
        tags,
      },
      learning?.id
    );

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to save learning');
    }
  };

  // -------------------------------------------------------------
  // VIEW MODE
  // -------------------------------------------------------------
  if (mode === 'view' && learning) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={learning.title}
        subtitle={`Recorded on ${formatDate(learning.createdAt)} • Task: TSK-${learning.taskId.slice(0, 4).toUpperCase()}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Action Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {learning.tags && learning.tags.length > 0 ? (
                learning.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">No tags attached</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                title="Copy note"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </button>

              {onSwitchToEdit && (
                <button
                  type="button"
                  onClick={() => onSwitchToEdit(learning)}
                  className="inline-flex items-center px-2.5 py-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(learning);
                  }}
                  className="inline-flex items-center px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="p-5 bg-[#0d0e12] border border-white/5 rounded-2xl max-h-[60vh] overflow-y-auto shadow-inner">
            <MarkdownViewer content={learning.content} className="text-xs text-slate-200" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // -------------------------------------------------------------
  // EDIT / CREATE MODE
  // -------------------------------------------------------------
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Record Technical Learning' : 'Edit Technical Learning'}
      subtitle={
        mode === 'create'
          ? 'Document architectural findings, bug fixes, or post-mortem notes'
          : `Updating note for TSK-${taskId.slice(0, 4).toUpperCase()}`
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Task Selection (When Creating from KB) */}
        {mode === 'create' && !initialTaskId && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Associate with Task *
            </label>
            {loadingTasks ? (
              <div className="text-xs text-slate-500 flex items-center py-2">
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Loading available tasks...
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                No active tasks found. Create a task in your projects first, or enter a Task ID below.
              </div>
            ) : (
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#14161c]">
                    TSK-{t.id.slice(0, 4).toUpperCase()}: {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Learning Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. SQLite Foreign Key Enforcements in Cloudflare D1"
            className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
        </div>

        {/* Markdown Editor with Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Technical Content (Markdown supported) *
            </label>
            <div className="flex items-center bg-[#0d0e12] border border-white/10 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === 'write'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3 h-3" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="### Root Cause&#10;Explain what failed and why.&#10;&#10;```typescript&#10;// Code snippet or resolution&#10;```&#10;&#10;### Key Takeaways&#10;- Lesson learned for future sprints."
              className="w-full p-3 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed transition-colors shadow-inner"
            />
          ) : (
            <div className="p-4 bg-[#0d0e12] border border-white/10 rounded-xl min-h-[12rem] max-h-[16rem] overflow-y-auto">
              {content.trim() ? (
                <MarkdownViewer content={content} className="text-xs text-slate-200" />
              ) : (
                <span className="text-xs text-slate-500 italic">No markdown entered yet.</span>
              )}
            </div>
          )}
        </div>

        {/* Tag Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Tags (Categorization)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag (e.g. Cloudflare, SQLite, Drizzle) and press Enter"
                className="w-full pl-8 pr-3 py-1.5 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 text-xs text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
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
            disabled={isSubmitting || !title.trim() || !content.trim() || !taskId}
            className="flex items-center px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isSubmitting
              ? 'Saving...'
              : mode === 'create'
              ? 'Record Learning'
              : 'Update Learning'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
