import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useLookups } from '../../hooks/useLookups';
import type { Project } from '../../../shared/types';
import { Loader2 } from 'lucide-react';

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
      if (project.dueDate) {
        const rawDate = project.dueDate as unknown;
        const d =
          rawDate instanceof Date
            ? rawDate
            : new Date(Number(rawDate) * (Number(rawDate) > 1e11 ? 1 : 1000));
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDueDateStr(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDateStr('');
      }
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
            placeholder="e.g. Core Platform Edge Migration"
            className="w-full px-3 py-2 bg-[#0d0e12] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
