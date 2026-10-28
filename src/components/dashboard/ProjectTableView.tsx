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

interface ProjectTableViewProps {
  projects: Project[];
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onView,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#0e1015] border border-white/[0.08] rounded-2xl shadow-[0_16px_36px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 font-semibold">Key</th>
              <th className="py-3 px-4 font-semibold">Project Title & Scope</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Priority</th>
              <th className="py-3 px-4 font-semibold">Target Deadline</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-xs">
            {projects.map((project) => {
              const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';

              return (
                <tr
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  {/* Key */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      PRJ-{project.id.slice(0, 4).toUpperCase()}
                    </span>
                  </td>

                  {/* Title & Scope */}
                  <td className="py-3.5 px-4 min-w-[240px]">
                    <div className="font-semibold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                      {project.title}
                    </div>
                    {project.description && (
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {project.description}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      label={project.statusId.replace('PROJ_STAT_', '')}
                      variant={resolveBadgeVariant(project.statusId)}
                      dot
                    />
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      label={project.priorityId.replace('PRIO_', '')}
                      variant={resolveBadgeVariant(project.priorityId)}
                    />
                  </td>

                  {/* Target Deadline */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {isCompleted ? (
                      <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    ) : project.dueDate ? (
                      <span className="inline-flex items-center text-slate-300">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {formatDate(project.dueDate)}
                      </span>
                    ) : (
                      <span className="text-slate-600">No deadline</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors font-medium inline-flex items-center gap-1"
                        title="Open Kanban Board"
                      >
                        Board <ArrowRight className="w-3 h-3" />
                      </button>

                      <DropdownMenu
                        trigger={
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
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
                            label: 'Open Board',
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
