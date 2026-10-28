import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Terminal,
  Search,
  BookOpen,
  FolderKanban,
  LogOut,
  Command,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DropdownMenu } from '../shared/DropdownMenu';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onNewProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'D';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d1017]/90 backdrop-blur-xl border-b border-white/[0.08] select-none shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Monogram & Workspace Indicator */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_2px_10px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform group-hover:scale-105 active:scale-95">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white block">
                DevLog
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded font-semibold hidden sm:inline-block">
                Studio
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400 font-medium">Edge Workspace</span>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center p-1 bg-[#131622] border border-white/[0.06] rounded-xl shadow-inner">
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
            <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
            <span>Projects & Board</span>
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

        {/* Right: Command Search Trigger & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search / Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-[#131622] hover:bg-[#181c2a] border border-white/[0.08] hover:border-white/[0.16] rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner active:scale-95"
            title="Open Command Palette (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline text-slate-400">Search workspace...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400 font-semibold">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* User Profile Pill with Dropdown */}
          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1 pr-2 bg-[#131622] hover:bg-[#181c2a] border border-white/[0.08] hover:border-white/[0.16] rounded-xl transition-all active:scale-95"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user?.name || 'Engineer'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
            }
            items={[
              {
                label: user?.email || 'Logged In',
                icon: <Layers className="w-3.5 h-3.5 text-sky-400" />,
                disabled: true,
              },
              'divider',
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
