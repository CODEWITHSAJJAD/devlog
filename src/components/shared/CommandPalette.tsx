import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Project, Learning, Task } from '../../../shared/types';
import { apiFetch } from '../../utils/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewProject: () => void;
  onNewLearning: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewProject,
  onNewLearning,
}) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load searchable data when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIsLoading(true);

      Promise.all([
        apiFetch<Project[]>('/api/projects'),
        apiFetch<Learning[]>('/api/learnings'),
        apiFetch<Task[]>('/api/tasks'),
      ]).then(([projRes, learnRes, taskRes]) => {
        if (projRes.success && projRes.data) setProjects(projRes.data);
        if (learnRes.success && learnRes.data) setLearnings(learnRes.data);
        if (taskRes.success && taskRes.data) setTasks(taskRes.data);
        setIsLoading(false);
      });

      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter items
  const filteredProjects = projects.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
  );

  const filteredTasks = tasks.filter(
    (t) => !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
  );

  const filteredLearnings = learnings.filter(
    (l) =>
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      l.tags?.some((tag) => tag.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-[#0e1015] border border-white/[0.1] rounded-2xl shadow-[0_32px_96px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search projects, tasks, learnings..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-white/[0.06] border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Quick Actions
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  onNewProject();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Create New Project</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                  New initiative &rarr;
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNewLearning();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">Record Technical Learning</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                  Document lesson &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Projects ({filteredProjects.length})
              </div>
              <div className="space-y-0.5">
                {filteredProjects.slice(0, 5).map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onClose();
                      navigate(`/projects/${proj.id}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                        PRJ-{proj.id.slice(0, 4).toUpperCase()}
                      </span>
                      <span className="font-medium truncate max-w-sm">{proj.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                      Open Board <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Kanban Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-0.5">
                {filteredTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      onClose();
                      navigate(`/projects/${task.projectId}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        TSK-{task.id.slice(0, 4).toUpperCase()}
                      </span>
                      <span className="font-medium truncate max-w-sm">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                      View Lane <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Learnings Results */}
          {filteredLearnings.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Technical Learnings ({filteredLearnings.length})
              </div>
              <div className="space-y-0.5">
                {filteredLearnings.slice(0, 5).map((learning) => (
                  <button
                    key={learning.id}
                    onClick={() => {
                      onClose();
                      navigate('/knowledge-base');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium truncate max-w-sm">{learning.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300 flex items-center gap-1">
                      Read Note <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading &&
            filteredProjects.length === 0 &&
            filteredTasks.length === 0 &&
            filteredLearnings.length === 0 && (
              <div className="py-12 text-center text-xs font-mono text-slate-500">
                No commands or items matching "{query}"
              </div>
            )}
        </div>

        {/* Footer Ribbon */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-slate-600">DevLog Universal Command Engine</span>
        </div>
      </div>
    </div>
  );
};
