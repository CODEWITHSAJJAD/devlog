import React, { useState } from 'react';
import { Modal } from './Modal';
import { useLookups } from '../../hooks/useLookups';
import { getProjectCode } from '../../utils/projectCode';
import { Loader2, Calendar, Tag } from 'lucide-react';

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
      subtitle="Establish a new workspace for tracking tickets and continuous technical learnings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono">
            {error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#1D1D1F]">
              Project Title *
            </label>
            {title.trim().length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-md font-bold">
                <Tag className="w-2.5 h-2.5" />
                Key: {getProjectCode(title)} (e.g. {getProjectCode(title)}-1)
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cloudflare Edge Engine"
            className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
            Scope & Objectives
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High-level engineering scope, milestones, or architecture notes..."
            className="w-full p-3.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Initial Status
            </label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] transition-all"
            >
              {projectStatuses.map((s) => (
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
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] transition-all"
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
            <Calendar className="w-3.5 h-3.5 text-[#86868B]" /> Target Delivery Date
          </label>
          <input
            type="date"
            value={dueDateStr}
            onChange={(e) => setDueDateStr(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] transition-all font-mono"
          />
        </div>

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
            disabled={isSubmitting || !title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
