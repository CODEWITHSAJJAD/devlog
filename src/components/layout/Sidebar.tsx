import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppLogo } from '../shared/AppLogo';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white text-[#1D1D1F] flex flex-col min-h-screen border-r border-black/[0.06] select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-black/[0.06]">
        <AppLogo size="sm" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#86868B] font-semibold">
          Platform
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.03]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mr-2.5 text-[#0071E3]" />
          Projects
        </NavLink>

        <NavLink
          to="/knowledge-base"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold shadow-xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.03]'
            }`
          }
        >
          <BookOpen className="w-4 h-4 mr-2.5 text-emerald-600" />
          Knowledge Base
        </NavLink>
      </nav>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-black/[0.06] space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#F5F5F7] rounded-xl border border-black/[0.04]">
          <div className="w-7 h-7 rounded-lg bg-[#E8F2FE] border border-[#0071E3]/20 text-[#0071E3] flex items-center justify-center font-mono font-semibold text-xs">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#1D1D1F] truncate">{user?.name || 'Developer'}</p>
            <p className="text-[10px] font-mono text-[#86868B] truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-xs font-medium text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
