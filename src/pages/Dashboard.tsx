import React, { useState } from 'react';
import {
  Plus,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  TrendingUp,
  Layers,
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

  // Metrics calculations
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.statusId === 'PROJ_STAT_COMPLETED').length;
  const activeProjects = totalProjects - completedProjects;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* 1. Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 font-semibold">
              Mission Control
            </span>
            <span className="text-slate-500 text-xs font-mono">• Multi-Tenant Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Engineering Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Architectural initiatives, sprint velocity, and continuous technical learnings.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Project
        </button>
      </div>

      {/* 2. Executive Hardware Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Sprint Velocity & Completion */}
        <div className="p-4 bg-[#0e1015] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Sprint Completion
            </span>
            <span className="font-mono font-bold text-white">{completionRate}%</span>
          </div>

          <div className="text-2xl font-black text-white tracking-tight mb-2">
            {completedProjects} <span className="text-slate-500 text-sm font-normal">/ {totalProjects} Projects</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Priority Health */}
        <div className="p-4 bg-[#0e1015] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-400" /> Active Initiatives
          </div>

          <div className="text-2xl font-black text-white tracking-tight mb-1">
            {activeProjects} <span className="text-slate-500 text-sm font-normal">In Progress</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> {highPriorityCount} High Priority
            </span>
            <span>•</span>
            <span className="text-slate-500">{totalProjects - highPriorityCount} Standard</span>
          </div>
        </div>

        {/* Metric 3: Technical Knowledge Base */}
        <div className="p-4 bg-[#0e1015] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Knowledge Engine
          </div>

          <div className="text-2xl font-black text-white tracking-tight mb-1">
            {learnings.length} <span className="text-slate-500 text-sm font-normal">Learnings Recorded</span>
          </div>

          <div className="text-[11px] font-mono text-emerald-400/90 mt-2">
            Cross-project architectural archive active
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
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
              className="pl-8 pr-3 py-1.5 bg-[#0e1015] border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors w-52 md:w-64"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center p-0.5 bg-[#0e1015] border border-white/[0.08] rounded-xl">
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
            className="px-2.5 py-1.5 bg-[#0e1015] border border-white/[0.08] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="PRIO_HIGH">High Priority</option>
            <option value="PRIO_MEDIUM">Medium Priority</option>
            <option value="PRIO_LOW">Low Priority</option>
          </select>
        </div>

        {/* Right: Grid / Table View Switcher */}
        <div className="flex items-center self-end sm:self-auto p-0.5 bg-[#0e1015] border border-white/[0.08] rounded-xl">
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
              className="h-48 bg-[#0e1015] border border-white/[0.06] rounded-2xl animate-pulse p-6"
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
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0c0d12]/50">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No projects match criteria</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try relaxing your search query or status/priority filters.'
              : 'Initialize your first engineering initiative to track Kanban tickets and attached learnings.'}
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

      {/* 4. Success State: Grid or Table */}
      {!isLoading && !error && filteredProjects.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={(p) => setViewingProject(p)}
                  onEdit={(p) => setEditingProject(p)}
                  onDelete={(p) => setDeletingProject(p)}
                />
              ))}
            </div>
          ) : (
            <ProjectTableView
              projects={filteredProjects}
              onView={(p) => setViewingProject(p)}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          )}
        </>
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

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProject}
        title="Delete Project"
        itemName={deletingProject?.title || ''}
        itemType="Project"
        description="will be soft-deleted. Historical audit records remain intact."
        onClose={() => setDeletingProject(null)}
        onConfirm={async () => {
          if (!deletingProject) return { success: false };
          return await deleteProject(deletingProject.id);
        }}
      />
    </div>
  );
};
