import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { DropdownMenu } from '../shared/DropdownMenu';
import { formatDate } from '../../utils/api';
import type { Project } from '../../../shared/types';

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';
  const progress = project.progress !== undefined ? project.progress : isCompleted ? 100 : 0;
  const totalTasks = project.totalTasks ?? 0;
  const doneTasks = project.doneTasks ?? 0;

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-[#34C759]';
    if (progress >= 70) return 'bg-[#0071E3]';
    if (progress >= 30) return 'bg-[#5856D6]';
    return 'bg-[#FF9500]';
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative p-6 bg-white hover:bg-[#FAFBFD] border border-black/[0.06] hover:border-[#0071E3]/30 rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03),0_12px_28px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 cursor-pointer"
    >
      <div>
        {/* Top Header: ID Key, Status & More Menu */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-[11px] font-bold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-lg shadow-2xs">
            PRJ-{project.id.slice(0, 4).toUpperCase()}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Badge
              label={project.statusId.replace('PROJ_STAT_', '')}
              variant={resolveBadgeVariant(project.statusId)}
              dot
            />

            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
                  title="Project options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              }
              items={[
                {
                  label: 'View Details',
                  icon: <Eye className="w-3.5 h-3.5" />,
                  onClick: () => onView(project),
                },
                {
                  label: 'Edit Project',
                  icon: <Edit2 className="w-3.5 h-3.5" />,
                  onClick: () => onEdit(project),
                },
                {
                  label: 'Open Kanban Board',
                  icon: <ExternalLink className="w-3.5 h-3.5" />,
                  onClick: () => navigate(`/projects/${project.id}`),
                },
                'divider',
                {
                  label: 'Delete Project',
                  icon: <Trash2 className="w-3.5 h-3.5" />,
                  danger: true,
                  onClick: () => onDelete(project),
                },
              ]}
            />
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-base font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors mb-2 leading-snug">
          {project.title}
        </h3>

        {/* Project Description */}
        {project.description ? (
          <p className="text-xs text-[#6E6E73] line-clamp-2 leading-relaxed mb-4">
            {project.description}
          </p>
        ) : (
          <p className="text-xs text-[#86868B] italic mb-4">No description provided</p>
        )}

        {/* Apple Dynamic Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#6E6E73] mb-1.5">
            <span className="font-medium text-[#6E6E73]">
              {totalTasks > 0 ? `${doneTasks}/${totalTasks} tasks closed` : 'No tasks assigned'}
            </span>
            <span className="font-bold text-[#1D1D1F]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-black/[0.04] rounded-full overflow-hidden p-[1px]">
            <div
              className={`h-full ${getProgressColor()} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Ribbon: Due date and Priority badge */}
      <div className="pt-3.5 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#6E6E73]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {isCompleted ? (
            <span className="inline-flex items-center text-[#34C759] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[10px]">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </span>
          ) : project.dueDate ? (
            <span className="inline-flex items-center text-[#6E6E73]">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#86868B]" />
              {formatDate(project.dueDate)}
            </span>
          ) : (
            <span className="text-[#86868B]">No deadline</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            label={project.priorityId.replace('PRIO_', '')}
            variant={resolveBadgeVariant(project.priorityId)}
          />
          <ArrowRight className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3] group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
};
