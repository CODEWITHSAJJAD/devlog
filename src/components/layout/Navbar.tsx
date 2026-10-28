import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Terminal,
  Search,
  BookOpen,
  FolderKanban,
  LogOut,
  Command,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DropdownMenu } from '../shared/DropdownMenu';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onNewProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 pb-1 select-none pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-2 bg-[#0e1015]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] rounded-2xl pointer-events-auto">
        {/* Left: Brand Monogram & Status */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform group-hover:scale-105 active:scale-95">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                DevLog
              </span>
              <span className="text-[10px] font-mono text-slate-500 block leading-none">
                Engineering Studio
              </span>
            </div>
          </NavLink>

          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400/90 font-medium">Edge Isolated</span>
          </div>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="flex items-center p-1 bg-black/40 border border-white/[0.06] rounded-xl shadow-inner">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/knowledge-base"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`
            }
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Knowledge Base</span>
          </NavLink>
        </nav>

        {/* Right: Command Search, Quick Action & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search / Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-inner"
            title="Open Command Palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">Search...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* User Profile Pill with Dropdown */}
          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-bold text-[10px]">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user?.name || 'Developer'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            }
            items={[
              {
                label: user?.email || 'User Session',
                disabled: true,
              },
              'divider',
              {
                label: 'Command Palette (⌘K)',
                icon: <Command className="w-3.5 h-3.5" />,
                onClick: onOpenCommandPalette,
              },
              {
                label: 'Sign Out',
                icon: <LogOut className="w-3.5 h-3.5" />,
                danger: true,
                onClick: logout,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
};
