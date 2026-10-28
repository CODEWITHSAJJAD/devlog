import React, { useState } from 'react';
import { Modal } from './Modal';
import { useLookups } from '../../hooks/useLookups';
import { Loader2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    statusId?: string;
    priorityId?: string;
    dueDate?: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('PROJ_STAT_NOT_STARTED');
  const [priorityId, setPriorityId] = useState('PRIO_MEDIUM');
  const [dueDateStr, setDueDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lookups: projectStatuses } = useLookups('PROJECT_STATUS');
  const { lookups: priorities } = useLookups('PRIORITY');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const dueDate = dueDateStr ? Math.floor(new Date(dueDateStr).getTime() / 1000) : undefined;
    const res = await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      statusId,
      priorityId,
      dueDate,
    });

    setIsSubmitting(false);
    if (res.success) {
      setTitle('');
      setDescription('');
      setDueDateStr('');
      onClose();
    } else {
      setError(res.error || 'Failed to create project');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Establish a new engineering workspace for tracking tickets and learnings"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Project Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Core Edge Platform Migration"
            className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Scope & Objectives</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High-level engineering scope, milestones, or architecture notes..."
            className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Initial Status</label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {projectStatuses.map((s) => (
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
            disabled={isSubmitting || !title.trim()}
            className="flex items-center px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
