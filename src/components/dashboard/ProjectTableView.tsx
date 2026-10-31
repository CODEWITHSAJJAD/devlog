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
} from 'lucide-react';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { DropdownMenu } from '../shared/DropdownMenu';
import { formatDate } from '../../utils/api';
import { getProjectCode } from '../../utils/projectCode';
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
    <div className="w-full bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[11px] font-semibold text-[#6E6E73]">
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Project Name</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {projects.map((project) => {
              const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';
              const progress = project.progress !== undefined ? project.progress : isCompleted ? 100 : 0;
              const totalTasks = project.totalTasks ?? 0;
              const doneTasks = project.doneTasks ?? 0;

              return (
                <tr
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="hover:bg-[#F5F5F7] transition-colors cursor-pointer group"
                >
                  {/* Key */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-[11px] text-[#0071E3] font-bold bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-md">
                      {project.code || getProjectCode(project.title)}
                    </span>
                  </td>

                  {/* Title & Scope */}
                  <td className="py-3 px-4 min-w-[220px]">
                    <div className="font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                      {project.title}
                    </div>
                    {project.description && (
                      <div className="text-[11px] text-[#6E6E73] line-clamp-1 mt-0.5">
                        {project.description}
                      </div>
                    )}
                  </td>

                  {/* Progress Column */}
                  <td className="py-3 px-4 whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-black/[0.05] rounded-full overflow-hidden p-[1px]">
                        <div
                          className={`h-full ${progress >= 100 ? 'bg-[#34C759]' : progress >= 50 ? 'bg-[#0071E3]' : 'bg-[#5856D6]'} rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#1D1D1F]">
                        {progress}%
                      </span>
                    </div>
                    {totalTasks > 0 && (
                      <div className="text-[10px] text-[#86868B] mt-0.5 font-mono">
                        {doneTasks}/{totalTasks} closed
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge
                      label={project.statusId.replace('PROJ_STAT_', '')}
                      variant={resolveBadgeVariant(project.statusId)}
                      dot
                    />
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <Badge
                      label={project.priorityId.replace('PRIO_', '')}
                      variant={resolveBadgeVariant(project.priorityId)}
                    />
                  </td>

                  {/* Target Deadline */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#6E6E73]">
                    {isCompleted ? (
                      <span className="inline-flex items-center text-[#34C759] font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Completed
                      </span>
                    ) : project.dueDate ? (
                      <span className="inline-flex items-center text-[#6E6E73]">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#86868B]" />
                        {formatDate(project.dueDate)}
                      </span>
                    ) : (
                      <span className="text-[#86868B]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-1.5 rounded-lg text-[#86868B] hover:text-[#0071E3] hover:bg-black/[0.04] transition-colors"
                        title="Open Kanban Board"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <DropdownMenu
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors"
                            title="More options"
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
