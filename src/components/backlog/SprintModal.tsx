import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { toDateInputValue } from '../../utils/api';
import type { Sprint } from '../../../shared/types';
import { Calendar, Target, Loader2 } from 'lucide-react';

interface SprintModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  sprint?: Sprint | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    version?: string;
    goal?: string;
    status?: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
    startDate?: number;
    endDate?: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const SprintModal: React.FC<SprintModalProps> = ({
  isOpen,
  mode,
  sprint,
  onClose,
  onSubmit,
}) => {
  const isEditing = mode === 'edit';

  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [goal, setGoal] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'PLANNED' | 'COMPLETED'>('PLANNED');
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && sprint) {
      setName(sprint.name);
      setVersion(sprint.version || '');
      setGoal(sprint.goal || '');
      setStatus((sprint.status as any) || 'PLANNED');
      setStartDateStr(toDateInputValue(sprint.startDate));
      setEndDateStr(toDateInputValue(sprint.endDate));
    } else {
      setName('');
      setVersion('');
      setGoal('');
      setStatus('PLANNED');
      setStartDateStr('');
      setEndDateStr('');
    }
    setError(null);
  }, [isEditing, sprint, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const startDate = startDateStr ? Math.floor(new Date(startDateStr).getTime() / 1000) : undefined;
    const endDate = endDateStr ? Math.floor(new Date(endDateStr).getTime() / 1000) : undefined;

    const res = await onSubmit({
      name: name.trim(),
      version: version.trim() || undefined,
      goal: goal.trim() || undefined,
      status,
      startDate,
      endDate,
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to save sprint');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Sprint / Version' : 'Create New Sprint'}
      subtitle={
        isEditing
          ? `Adjust iteration schedule and version scope for ${sprint?.name}`
          : 'Define an engineering milestone, version release, or sprint cycle'
      }
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Sprint Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 1, Core Auth Sprint"
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Version Tag
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. v1.0.0"
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#0071E3]" /> Sprint Goal / Deliverables
          </label>
          <textarea
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Complete responsive auth, deploy production database migrations"
            className="w-full p-3 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Sprint State
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all"
            >
              <option value="PLANNED">Planned (Future)</option>
              <option value="ACTIVE">Active (In Flight)</option>
              <option value="COMPLETED">Completed (Closed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#86868B]" /> Start Date
            </label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#86868B]" /> End Date
            </label>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/[0.08] hover:border-black/[0.14] focus:bg-white focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] transition-all font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? 'Save Changes' : 'Create Sprint'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
