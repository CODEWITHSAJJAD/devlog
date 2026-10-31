import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { MarkdownViewer } from './MarkdownViewer';
import { formatDate, apiFetch } from '../../utils/api';
import { formatTaskKey } from '../../utils/projectCode';
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
  Bold,
  Italic,
  Code,
  Quote,
  List,
} from 'lucide-react';

interface LearningModalProps {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  learning: Learning | null;
  initialTaskId?: string;
  defaultTaskId?: string;
  defaultTitle?: string;
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
  defaultTaskId,
  defaultTitle,
  onClose,
  onSave,
  onDelete,
  onSwitchToEdit,
}) => {
  const effectiveTaskId = defaultTaskId || initialTaskId || '';

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState(effectiveTaskId);
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
      setTitle(defaultTitle || '');
      setContent('');
      setTaskId(effectiveTaskId);
      setTags([]);
      setError(null);
    }
  }, [learning, mode, effectiveTaskId, defaultTitle]);

  useEffect(() => {
    if (isOpen && mode === 'create' && !effectiveTaskId) {
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
  }, [isOpen, mode, effectiveTaskId, taskId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setContent((prev) => prev + snippet);
  };

  const handleCopyMarkdown = () => {
    if (!learning) return;
    const md = `# ${learning.title}\n\n${learning.content}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!taskId) {
      setError('Please associate this learning with a valid Task');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      taskId,
      title: title.trim(),
      content: content.trim(),
      tags,
    };

    const res = onSave ? await onSave(payload, learning?.id) : { success: true };
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
        subtitle={`Recorded on ${formatDate(learning.createdAt)} • Task: ${learning.taskKey || formatTaskKey(undefined, undefined, undefined, learning.taskId)}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          {/* Action Ribbon */}
          <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {learning.tags && learning.tags.length > 0 ? (
                learning.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#86868B] italic">No tags attached</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center px-3 py-1.5 text-xs text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EBEBEF] rounded-xl transition-colors border border-black/[0.06] active:scale-95"
                title="Copy note"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-[#34C759]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1 text-[#6E6E73]" />
                    Copy
                  </>
                )}
              </button>

              {onSwitchToEdit && (
                <button
                  type="button"
                  onClick={() => onSwitchToEdit(learning)}
                  className="inline-flex items-center px-3 py-1.5 text-xs text-[#0071E3] bg-[#E8F2FE] hover:bg-[#D5E8FD] rounded-xl transition-colors border border-[#0071E3]/20 active:scale-95 font-medium"
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
                  className="inline-flex items-center px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="p-5 bg-[#F9F9FB] border border-black/[0.05] rounded-2xl max-h-[60vh] overflow-y-auto">
            <MarkdownViewer content={learning.content} className="text-xs text-[#1D1D1F]" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-black/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors active:scale-95"
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
          : `Updating note for ${formatTaskKey(undefined, undefined, undefined, taskId)}`
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Task Selection (When Creating without pre-bound Task) */}
        {mode === 'create' && !effectiveTaskId && (
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Associate with Task *
            </label>
            {loadingTasks ? (
              <div className="text-xs text-[#86868B] flex items-center py-2">
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-[#0071E3]" /> Loading available tasks...
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                No active tasks found. Create a task in your projects first, or enter a Task ID below.
              </div>
            ) : (
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all"
              >
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {formatTaskKey(t.taskKey, undefined, t.taskNumber, t.id)}: {t.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
            Learning Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. SQLite Foreign Key Enforcements in Cloudflare D1"
            className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
          />
        </div>

        {/* Markdown Editor with Formatting Toolbar & Tabs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F]">
              Technical Content (Markdown) *
            </label>
            <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeTab === 'write'
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <FileCode className="w-3 h-3" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>
          </div>

          {activeTab === 'write' ? (
            <div className="space-y-1.5">
              {/* Markdown Helper Toolbar */}
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#F5F5F7] border border-black/[0.06] rounded-t-xl text-[#6E6E73]">
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('**bold text**')}
                  className="p-1 hover:text-[#1D1D1F] rounded hover:bg-black/[0.05] transition-colors"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('*italic text*')}
                  className="p-1 hover:text-[#1D1D1F] rounded hover:bg-black/[0.05] transition-colors"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('\n```typescript\n// code here\n```\n')}
                  className="p-1 hover:text-[#1D1D1F] rounded hover:bg-black/[0.05] transition-colors"
                  title="Code Block"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('\n> Quote\n')}
                  className="p-1 hover:text-[#1D1D1F] rounded hover:bg-black/[0.05] transition-colors"
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('\n- List item\n')}
                  className="p-1 hover:text-[#1D1D1F] rounded hover:bg-black/[0.05] transition-colors"
                  title="Bulleted List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                required
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="### Root Cause&#10;Explain what failed and why.&#10;&#10;```typescript&#10;// Code snippet or resolution&#10;```&#10;&#10;### Key Takeaways&#10;- Lesson learned for future sprints."
                className="w-full p-3.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-b-xl text-xs text-[#1D1D1F] placeholder-[#86868B] font-mono leading-relaxed transition-all"
              />
            </div>
          ) : (
            <div className="p-4 bg-[#F5F5F7] border border-black/[0.06] rounded-xl min-h-[12rem] max-h-[16rem] overflow-y-auto">
              {content.trim() ? (
                <MarkdownViewer content={content} className="text-xs text-[#1D1D1F]" />
              ) : (
                <div className="text-[#86868B] text-xs italic">
                  Markdown preview will render here once you write content.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
            Knowledge Tags
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868B]" />
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
                placeholder="e.g. database, sqlite, d1, security (press Enter)"
                className="w-full pl-9 pr-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2 bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold rounded-xl border border-black/[0.08] shadow-2xs transition-colors"
            >
              Add Tag
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-md"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="ml-1 text-[#0071E3] hover:text-[#0051A8]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{mode === 'create' ? 'Record Learning' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
