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
  FolderKanban,
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

  // Progress fill color
  const getProgressColor = () => {
    if (progress >= 100) return 'bg-emerald-400';
    if (progress >= 60) return 'bg-sky-400';
    if (progress >= 25) return 'bg-indigo-400';
    return 'bg-slate-600';
  };

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative p-5 bg-[#121520] hover:bg-[#181d2c] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Top Header: ID Key, Status & More Menu */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="font-mono text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md">
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
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
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
        <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors mb-1.5 leading-snug">
          {project.title}
        </h3>

        {/* Project Description */}
        {project.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
            {project.description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic mb-3.5">No description provided</p>
        )}

        {/* Dynamic Project Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
            <span className="text-slate-500 flex items-center gap-1">
              <FolderKanban className="w-3 h-3 text-slate-500" />
              {totalTasks > 0 ? `${doneTasks}/${totalTasks} tasks done` : 'No tasks recorded'}
            </span>
            <span className="font-semibold text-slate-200">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Ribbon: Due date and Priority badge */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </span>
          ) : project.dueDate ? (
            <span className="inline-flex items-center text-slate-400">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {formatDate(project.dueDate)}
            </span>
          ) : (
            <span className="text-slate-600">No deadline</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge
            label={project.priorityId.replace('PRIO_', '')}
            variant={resolveBadgeVariant(project.priorityId)}
          />
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] group-hover:bg-sky-500/20 border border-white/[0.06] group-hover:border-sky-500/30 flex items-center justify-center transition-all">
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
