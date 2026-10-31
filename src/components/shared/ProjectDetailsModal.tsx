import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Badge, resolveBadgeVariant } from './Badge';
import { formatDate } from '../../utils/api';
import { getProjectCode } from '../../utils/projectCode';
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
      subtitle={`Project Code: ${project.code || getProjectCode(project.title)}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Status & Priority Row */}
        <div className="flex items-center gap-2 flex-wrap pb-4 border-b border-black/[0.06]">
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
            <span className="inline-flex items-center text-xs text-[#34C759] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Completed {project.completedAt ? formatDate(project.completedAt) : ''}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-[#1D1D1F] mb-1.5">
            Scope & Objectives
          </h4>
          <div className="p-4 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs text-[#1D1D1F] leading-relaxed whitespace-pre-wrap min-h-[5rem] font-sans">
            {project.description || 'No detailed scope provided for this project.'}
          </div>
        </div>

        {/* Timeline & Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl">
            <span className="text-[#86868B] block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#0071E3]" /> Target Deadline
            </span>
            <span className="text-[#1D1D1F] font-semibold font-mono">
              {project.dueDate ? formatDate(project.dueDate) : 'No deadline scheduled'}
            </span>
          </div>

          <div className="p-3.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl">
            <span className="text-[#86868B] block mb-1 flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#0071E3]" /> Created At
            </span>
            <span className="text-[#1D1D1F] font-semibold font-mono">{formatDate(project.createdAt)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(project);
              }}
              className="inline-flex items-center px-3.5 py-1.5 text-xs text-[#1D1D1F] hover:bg-black/[0.05] rounded-xl transition-colors border border-black/[0.08] active:scale-95 bg-white shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5 text-[#6E6E73]" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(project);
              }}
              className="inline-flex items-center px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 active:scale-95 bg-white shadow-2xs"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-[0.98]"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
