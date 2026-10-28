import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      <div className="h-16 flex items-center px-6 font-bold text-lg tracking-wide border-b border-slate-800">
        DevLog
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/knowledge-base"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`
          }
        >
          <BookOpen className="w-5 h-5 mr-3" />
          Knowledge Base
        </NavLink>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
