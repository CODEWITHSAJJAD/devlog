import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useFetchProjects } from '../hooks/useFetchProjects';
import { CreateProjectModal } from '../components/shared/CreateProjectModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { DropdownMenu } from '../components/shared/DropdownMenu';
import { Badge, resolveBadgeVariant } from '../components/shared/Badge';
import { formatDate } from '../utils/api';
import type { Project } from '../../shared/types';

export const Dashboard: React.FC = () => {
  const { projects, isLoading, error, refetch, createProject, updateProject, deleteProject } =
    useFetchProjects();
  const navigate = useNavigate();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // Filter state
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'ACTIVE') return p.statusId !== 'PROJ_STAT_COMPLETED';
    if (filter === 'COMPLETED') return p.statusId === 'PROJ_STAT_COMPLETED';
    return true;
  });

  const activeCount = projects.filter((p) => p.statusId !== 'PROJ_STAT_COMPLETED').length;
  const completedCount = projects.filter((p) => p.statusId === 'PROJ_STAT_COMPLETED').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header & Primary Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              Workspace
            </span>
            <span className="text-slate-500 text-xs font-mono">• Multi-Tenant</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Engineering Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Manage mission-critical engineering initiatives, Kanban sprint boards, and attached technical learnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </button>
        </div>
      </div>

      {/* Metrics & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#101217] border border-white/[0.06] rounded-xl w-fit">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            All Projects ({projects.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'ACTIVE'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'COMPLETED'
                ? 'bg-white/10 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>Active: <strong className="text-slate-200">{activeCount}</strong></span>
          <span>Completed: <strong className="text-emerald-400">{completedCount}</strong></span>
        </div>
      </div>

      {/* 4-State UI */}
      {/* 1. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-[#101217] border border-white/[0.06] rounded-2xl animate-pulse p-6"
            />
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded text-xs font-medium hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0c0d12]/50">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {filter !== 'ALL'
              ? `There are no projects matching the "${filter.toLowerCase()}" filter.`
              : 'Initialize your first engineering project to start tracking Kanban tickets and technical learnings.'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Project
          </button>
        </div>
      )}

      {/* 4. Success State: Project Grid */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative p-5 bg-[#101217] hover:bg-[#14161c] border border-white/[0.06] hover:border-white/[0.14] rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
              >
                <div>
                  {/* Top Header: ID badge, Status, and Action Dropdown */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="font-mono text-[11px] font-semibold text-indigo-400/90 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      PRJ-{project.id.slice(0, 4).toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Badge
                        label={project.statusId.replace('PROJ_STAT_', '')}
                        variant={resolveBadgeVariant(project.statusId)}
                        className="text-[10px]"
                      />

                      {/* Dropdown Menu for View, Edit, Delete */}
                      <DropdownMenu
                        trigger={
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                            title="Project options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye className="w-3.5 h-3.5" />,
                            onClick: () => setViewingProject(project),
                          },
                          {
                            label: 'Edit Project',
                            icon: <Edit2 className="w-3.5 h-3.5" />,
                            onClick: () => setEditingProject(project),
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
                            onClick: () => setDeletingProject(project),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-indigo-300 transition-colors mb-2">
                    {project.title}
                  </h3>

                  {/* Project Description */}
                  {project.description ? (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 italic mb-4">
                      No description provided
                    </p>
                  )}
                </div>

                {/* Footer Ribbon: Due date and Open Board CTA */}
                <div className="pt-3.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px]">
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

                  <span className="inline-flex items-center text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all text-xs font-sans font-medium">
                    Board &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createProject}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={updateProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={!!viewingProject}
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onEdit={(proj) => setEditingProject(proj)}
        onDelete={(proj) => setDeletingProject(proj)}
      />

      {/* Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProject}
        title="Delete Project"
        itemName={deletingProject?.title || ''}
        itemType="Project"
        description="will be soft-deleted. All associated tickets and technical learnings will remain securely archived in the database."
        onClose={() => setDeletingProject(null)}
        onConfirm={async () => {
          if (!deletingProject) return { success: false };
          return await deleteProject(deletingProject.id);
        }}
      />
    </div>
  );
};
