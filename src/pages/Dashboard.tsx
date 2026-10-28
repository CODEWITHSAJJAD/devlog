import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useFetchProjects } from '../hooks/useFetchProjects';
import { useLearnings } from '../hooks/useLearnings';
import { CreateProjectModal } from '../components/shared/CreateProjectModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { ProjectTableView } from '../components/dashboard/ProjectTableView';
import type { Project } from '../../shared/types';

export const Dashboard: React.FC = () => {
  const { projects, isLoading, error, refetch, createProject, updateProject, deleteProject } =
    useFetchProjects();
  const { learnings } = useLearnings();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // View & Filter states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Weighted engineering progress metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.statusId === 'PROJ_STAT_COMPLETED').length;
  const activeProjects = totalProjects - completedProjects;

  const totalProgressSum = projects.reduce(
    (sum, p) => sum + (p.progress !== undefined ? p.progress : p.statusId === 'PROJ_STAT_COMPLETED' ? 100 : 0),
    0
  );
  const completionRate = totalProjects > 0 ? Math.round(totalProgressSum / totalProjects) : 0;
  const highPriorityCount = projects.filter((p) => p.priorityId === 'PRIO_HIGH').length;

  // Filter logic
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'ACTIVE' && p.statusId === 'PROJ_STAT_COMPLETED') return false;
    if (statusFilter === 'COMPLETED' && p.statusId !== 'PROJ_STAT_COMPLETED') return false;
    if (priorityFilter !== 'ALL' && p.priorityId !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesDesc = p.description?.toLowerCase().includes(q);
      const matchesKey = `prj-${p.id.slice(0, 4).toLowerCase()}`.includes(q);
      if (!matchesTitle && !matchesDesc && !matchesKey) return false;
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[96rem] mx-auto space-y-7 select-none">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 font-bold">
              Mission Control
            </span>
            <span className="text-slate-500 text-xs font-mono">• Production Tier</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Projects Mission Control
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            High-performance sprint boards, architectural initiatives, and cross-project knowledge capture.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Project
        </button>
      </div>

      {/* 2. Asymmetric Executive Telemetry Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Hero Tile: Sprint Completion Gauge */}
        <div className="md:col-span-5 p-5 bg-[#121520] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> Sprint Delivery Rate
              </span>
              <div className="text-3xl font-black text-white tracking-tight mt-2">
                {completionRate}%
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {completedProjects} of {totalProjects} projects finalized (weighted progress)
              </p>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-white/[0.06]"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * completionRate) / 100}
                  className="text-sky-400 transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <CheckCircle2 className="w-5 h-5 text-sky-400 absolute" />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{activeProjects} in development</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> High Reliability
            </span>
          </div>
        </div>

        {/* Telemetry Tile 2: Active Initiatives & Priority */}
        <div className="md:col-span-4 p-5 bg-[#121520] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-rose-400" /> Active Initiatives
            </span>
            <div className="text-3xl font-black text-white tracking-tight mt-2">
              {activeProjects} <span className="text-slate-500 text-sm font-normal">Active</span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              {highPriorityCount} High Priority
            </span>
            <span>•</span>
            <span className="text-slate-500">{totalProjects - highPriorityCount} Standard</span>
          </div>
        </div>

        {/* Telemetry Tile 3: Knowledge Base Link */}
        <Link
          to="/knowledge-base"
          className="md:col-span-3 p-5 bg-[#121520] hover:bg-[#181d2c] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col justify-between transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Second Brain
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-black text-white tracking-tight mt-2">
              {learnings.length}
            </div>
            <div className="text-[11px] font-mono text-emerald-400/90 mt-1">
              Cross-project learnings cataloged
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-white/[0.06] text-[10px] font-mono text-slate-500">
            Obsidian-grade reader ready →
          </div>
        </Link>
      </div>

      {/* 3. Filter Bar & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Search & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, scope, PRJ-..."
              className="pl-8 pr-3 py-1.5 bg-[#121520] border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors w-52 md:w-64 font-mono"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-0.5 bg-[#121520] border border-white/[0.08] rounded-xl">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#121520] border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">All Priorities</option>
            <option value="PRIO_HIGH">High Priority</option>
            <option value="PRIO_MEDIUM">Medium Priority</option>
            <option value="PRIO_LOW">Low Priority</option>
          </select>
        </div>

        {/* Right: Grid / Table View Switcher */}
        <div className="flex items-center self-end sm:self-auto p-0.5 bg-[#121520] border border-white/[0.08] rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Bento Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dense Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Main Content Area (4-State) */}
      {/* 1. Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-[#121520] border border-white/[0.06] rounded-2xl animate-pulse p-6"
            />
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#121520]/50">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No projects match your current filters.'
              : 'Create your first project to start tracking engineering sprints and tickets.'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Project
          </button>
        </div>
      )}

      {/* 4. Data State */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={setViewingProject}
                  onEdit={setEditingProject}
                  onDelete={setDeletingProject}
                />
              ))}
            </div>
          ) : (
            <ProjectTableView
              projects={filteredProjects}
              onView={setViewingProject}
              onEdit={setEditingProject}
              onDelete={setDeletingProject}
            />
          )}
        </>
      )}

      {/* Modals Suite */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createProject}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSubmit={async (id, updates) => {
          const res = await updateProject(id, updates);
          if (res.success) {
            setEditingProject(null);
          }
          return res;
        }}
      />

      <ProjectDetailsModal
        isOpen={!!viewingProject}
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onEdit={() => {
          setEditingProject(viewingProject);
          setViewingProject(null);
        }}
        onDelete={() => {
          setDeletingProject(viewingProject);
          setViewingProject(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProject}
        title="Delete Project"
        itemName={deletingProject?.title || ''}
        itemType="Project"
        description="will be soft-deleted. Attached tasks will remain in the database."
        onClose={() => setDeletingProject(null)}
        onConfirm={async () => {
          if (!deletingProject) return { success: false };
          return await deleteProject(deletingProject.id);
        }}
      />
    </div>
  );
};
