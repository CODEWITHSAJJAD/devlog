import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { useFetchProjects } from '../hooks/useFetchProjects';
import { CreateProjectModal } from '../components/shared/CreateProjectModal';
import { Badge, resolveBadgeVariant } from '../components/shared/Badge';
import { formatDate } from '../utils/api';

export const Dashboard: React.FC = () => {
  const { projects, isLoading, error, refetch, createProject } = useFetchProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredProjects = projects.filter((p) => {
    if (filter === 'ACTIVE') return p.statusId !== 'PROJ_STAT_COMPLETED';
    if (filter === 'COMPLETED') return p.statusId === 'PROJ_STAT_COMPLETED';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header & Primary Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            Engineering Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage mission-critical multi-tenant repositories, sprints, and task lifecycles.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </button>
      </div>

      {/* Filter Tabs & Metric Summary */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === tab
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="text-xs font-mono text-slate-500">
          Total: <span className="text-slate-200 font-semibold">{projects.length}</span> projects
        </div>
      </div>

      {/* 4-State UI */}
      {/* 1. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[#11131a] border border-white/5 rounded-xl animate-pulse p-6" />
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
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d0e14]/50">
          <FolderKanban className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Get started by initializing a new project workspace to track tickets and technical learnings.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Project
          </button>
        </div>
      )}

      {/* 4. Success State */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isCompleted = project.statusId === 'PROJ_STAT_COMPLETED';
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group p-5 bg-[#11131a] hover:bg-[#161822] border border-white/5 hover:border-white/15 rounded-xl transition-all duration-150 flex flex-col justify-between shadow-sm relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] text-slate-500 group-hover:text-indigo-400 transition-colors">
                      PRJ-{project.id.slice(0, 4).toUpperCase()}
                    </span>
                    <Badge
                      label={project.statusId.replace('PROJ_STAT_', '')}
                      variant={resolveBadgeVariant(project.statusId)}
                      className="text-[10px]"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-indigo-300 transition-colors mb-1.5">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-1">
                    {isCompleted ? (
                      <span className="inline-flex items-center text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Completed
                      </span>
                    ) : project.dueDate ? (
                      <span className="inline-flex items-center text-slate-400">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {formatDate(project.dueDate)}
                      </span>
                    ) : (
                      <span>No deadline</span>
                    )}
                  </div>
                  <span className="inline-flex items-center text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all text-xs font-sans font-medium">
                    Open Board &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createProject}
      />
    </div>
  );
};
