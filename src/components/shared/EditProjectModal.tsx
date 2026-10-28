import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLookups } from '../../hooks/useLookups';
import { toDateInputValue } from '../../utils/api';
import type { Project } from '../../../shared/types';
import { Loader2, Calendar } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [dueDateStr, setDueDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lookups: projectStatuses } = useLookups('PROJECT_STATUS');
  const { lookups: priorities } = useLookups('PRIORITY');

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setStatusId(project.statusId);
      setPriorityId(project.priorityId);
      setDueDateStr(toDateInputValue(project.dueDate));
      setError(null);
    }
  }, [project]);

  if (!project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const dueDate = dueDateStr ? Math.floor(new Date(dueDateStr).getTime() / 1000) : null;
    const completedAt =
      statusId === 'PROJ_STAT_COMPLETED' && project.statusId !== 'PROJ_STAT_COMPLETED'
        ? Math.floor(Date.now() / 1000)
        : statusId !== 'PROJ_STAT_COMPLETED'
        ? null
        : project.completedAt;

    const res = await onSubmit(project.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      statusId,
      priorityId,
      dueDate: dueDate as any,
      completedAt: completedAt as any,
    });

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to update project');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
      subtitle={`Update parameters and lifecycle status for PRJ-${project.id.slice(0, 4).toUpperCase()}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-mono">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Core Platform Edge Migration"
            className="w-full px-3.5 py-2.5 bg-[#0a0c10] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Scope & Objectives
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="High-level engineering scope, milestones, or architecture notes..."
            className="w-full p-3.5 bg-[#0a0c10] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0c10] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            >
              {projectStatuses.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#101217]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
            <select
              value={priorityId}
              onChange={(e) => setPriorityId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0c10] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            >
              {priorities.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#101217]">
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Delivery Date
          </label>
          <input
            type="date"
            value={dueDateStr}
            onChange={(e) => setDueDateStr(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#0a0c10] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_10px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
