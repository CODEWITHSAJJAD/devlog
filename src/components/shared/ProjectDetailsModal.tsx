import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Badge, resolveBadgeVariant } from './Badge';
import { formatDate } from '../../utils/api';
import type { Project } from '../../../shared/types';
import { Calendar, CheckCircle2, Clock, Edit2, Trash2, ArrowRight, FolderKanban } from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  project,
  onClose,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (!project) return null;

  const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      subtitle={`Project Identifier: PRJ-${project.id.slice(0, 4).toUpperCase()}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Status & Priority Row */}
        <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-white/[0.06]">
          <Badge
            label={project.statusId.replace('PROJ_STAT_', '')}
            variant={resolveBadgeVariant(project.statusId)}
            dot
          />
          <Badge
            label={`Priority: ${project.priorityId.replace('PRIO_', '')}`}
            variant={resolveBadgeVariant(project.priorityId)}
          />
          {isCompleted && (
            <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Completed {project.completedAt ? formatDate(project.completedAt) : ''}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Scope & Objectives
          </h4>
          <div className="p-4 bg-[#0a0c10] border border-white/[0.06] rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[5rem] shadow-inner font-sans">
            {project.description || 'No detailed scope provided for this project.'}
          </div>
        </div>

        {/* Timeline & Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[#0a0c10] border border-white/[0.06] rounded-xl shadow-inner">
            <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Target Deadline
            </span>
            <span className="text-slate-200 font-medium font-mono">
              {project.dueDate ? formatDate(project.dueDate) : 'No deadline scheduled'}
            </span>
          </div>

          <div className="p-3.5 bg-[#0a0c10] border border-white/[0.06] rounded-xl shadow-inner">
            <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Created At
            </span>
            <span className="text-slate-200 font-medium font-mono">{formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/10 rounded-xl transition-colors border border-white/[0.06] active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(project);
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors border border-rose-500/20 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/projects/${project.id}`);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_10px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
          >
            <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
            Open Kanban Board
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
