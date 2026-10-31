import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  TrendingUp,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useFetchProjects } from '../hooks/useFetchProjects';
import { useLearnings } from '../hooks/useLearnings';
import { CreateProjectModal } from '../components/shared/CreateProjectModal';
import { EditProjectModal } from '../components/shared/EditProjectModal';
import { ProjectDetailsModal } from '../components/shared/ProjectDetailsModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { ProjectTableView } from '../components/dashboard/ProjectTableView';
import { getProjectCode } from '../utils/projectCode';
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

  // View & Filter states (Default to Grid view for Apple-grade card showcase)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Weighted engineering progress metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.statusId === 'PROJ_STAT_COMPLETED').length;
  const activeProjects = totalProjects - completedProjects;
  const highPriorityCount = projects.filter((p) => p.priorityId === 'PRIO_HIGH').length;

  const totalProgressSum = projects.reduce(
    (sum, p) => sum + (p.progress !== undefined ? p.progress : p.statusId === 'PROJ_STAT_COMPLETED' ? 100 : 0),
    0
  );
  const aggregateProgress = totalProjects > 0 ? Math.round(totalProgressSum / totalProjects) : 0;

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
      const projectCode = (p.code || getProjectCode(p.title)).toLowerCase();
      const matchesCode = projectCode.includes(q);
      if (!matchesTitle && !matchesDesc && !matchesKey && !matchesCode) return false;
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[96rem] mx-auto space-y-7 select-none">
      {/* 1. Apple Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Projects
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-xl">
            Workspace initiatives, sprint milestones, and continuous technical learnings.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* 2. Restored Executive Telemetry Bento (Apple Light Architecture) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Hero Tile: Sprint Completion Gauge */}
        <div className="md:col-span-5 p-5 bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] flex items-center gap-1.5 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-[#0071E3]" /> Sprint Delivery Rate
              </span>
              <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-2 font-display">
                {aggregateProgress}%
              </div>
              <p className="text-xs text-[#86868B] mt-1 font-mono">
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
                  className="text-black/[0.05]"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * aggregateProgress) / 100}
                  className="text-[#0071E3] transition-all duration-700 ease-out"
                  fill="transparent"
                />
              </svg>
              <CheckCircle2 className="w-5 h-5 text-[#0071E3] absolute" />
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-black/[0.06] flex items-center justify-between text-[11px] font-mono text-[#6E6E73]">
            <span>{activeProjects} in development</span>
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> High Reliability
            </span>
          </div>
        </div>

        {/* Telemetry Tile 2: Active Initiatives & Priority */}
        <div className="md:col-span-4 p-5 bg-white border border-black/[0.06] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-[#FF3B30]" /> Active Initiatives
            </span>
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-2 font-display">
              {activeProjects} <span className="text-[#86868B] text-sm font-normal">Active</span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-black/[0.06] flex items-center gap-3 text-[11px] font-mono text-[#6E6E73]">
            <span className="flex items-center gap-1.5 font-medium text-[#FF3B30]">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
              {highPriorityCount} High Priority
            </span>
            <span className="text-[#86868B]/40">•</span>
            <span className="text-[#86868B]">{totalProjects - highPriorityCount} Standard</span>
          </div>
        </div>

        {/* Telemetry Tile 3: Second Brain / Knowledge Base Link */}
        <Link
          to="/knowledge-base"
          className="md:col-span-3 p-5 bg-white hover:bg-[#FAFBFD] border border-black/[0.06] hover:border-[#0071E3]/30 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6E6E73] flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Second Brain
            </span>
            <ArrowUpRight className="w-4 h-4 text-[#86868B] group-hover:text-[#0071E3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-2 font-display">
              {learnings.length}
            </div>
            <div className="text-[11px] font-mono text-emerald-700 mt-1 font-medium">
              Cross-project learnings cataloged
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-black/[0.06] text-[10px] font-mono text-[#86868B] group-hover:text-[#0071E3] transition-colors flex items-center justify-between">
            <span>Obsidian-grade reader ready</span>
            <span>&rarr;</span>
          </div>
        </Link>
      </div>

      {/* 3. Filter & View Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 pr-3 py-2 bg-white border border-black/[0.08] hover:border-black/[0.16] focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all w-52 sm:w-64 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#86868B] hover:text-[#1D1D1F] text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/40'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Priority Filter Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-black/[0.08] hover:border-black/[0.16] focus:border-[#0071E3] rounded-xl text-xs text-[#1D1D1F] shadow-2xs transition-all"
          >
            <option value="ALL">All Priorities</option>
            <option value="PRIO_CRITICAL">Critical Priority</option>
            <option value="PRIO_HIGH">High Priority</option>
            <option value="PRIO_MEDIUM">Medium Priority</option>
            <option value="PRIO_LOW">Low Priority</option>
          </select>
        </div>

        {/* Right: Grid vs Table Toggle */}
        <div className="flex items-center self-end sm:self-auto bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/40'
            }`}
            title="Card Grid View (Default)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/40'
            }`}
            title="Dense Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Main Content: Cards Grid (Default) or Table */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 bg-white border border-black/[0.05] rounded-2xl animate-pulse p-6 shadow-sm"
            />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded-xl text-xs font-medium hover:bg-rose-500 shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && filteredProjects.length === 0 && (
        <div className="py-24 text-center border border-dashed border-black/[0.1] rounded-2xl bg-white shadow-xs">
          <FolderKanban className="w-12 h-12 mx-auto text-[#86868B] mb-3" />
          <h3 className="text-base font-semibold text-[#1D1D1F]">No projects found</h3>
          <p className="text-xs text-[#6E6E73] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No projects match your current filter criteria.'
              : 'Create a new project to start tracking tickets and technical progress.'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      )}

      {!isLoading && !error && filteredProjects.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xs overflow-hidden">
              <ProjectTableView
                projects={filteredProjects}
                onView={setViewingProject}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
              />
            </div>
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
