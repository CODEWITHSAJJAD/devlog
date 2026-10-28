import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#0b0c10] text-slate-300 flex flex-col min-h-screen border-r border-white/[0.06] select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 gap-3 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white">DevLog</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.08]">
            Pro
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
          Platform
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-semibold border border-white/[0.08]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mr-2.5 text-indigo-400" />
          Projects
        </NavLink>

        <NavLink
          to="/knowledge-base"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-semibold border border-white/[0.08]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`
          }
        >
          <BookOpen className="w-4 h-4 mr-2.5 text-emerald-400" />
          Knowledge Base
        </NavLink>
      </nav>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#101217] rounded-xl border border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-semibold text-xs">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Developer'}</p>
            <p className="text-[10px] font-mono text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
