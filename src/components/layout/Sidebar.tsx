import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="w-60 bg-[#0d0e14] text-slate-300 flex flex-col min-h-screen border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 gap-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm tracking-tight text-white">DevLog</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
            v0.1
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mr-2.5 text-indigo-400" />
          Projects
        </NavLink>
        <NavLink
          to="/knowledge-base"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`
          }
        >
          <BookOpen className="w-4 h-4 mr-2.5 text-emerald-400" />
          Knowledge Base
        </NavLink>
      </nav>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
