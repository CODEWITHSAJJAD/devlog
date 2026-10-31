import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  FolderKanban,
  LogOut,
  Command,
  ChevronDown,
  Layers,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DropdownMenu } from '../shared/DropdownMenu';
import { AppLogo } from '../shared/AppLogo';

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onNewProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette, onNewProject }) => {
  const { user, logout } = useAuth();
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'D';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.06] select-none shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Segmented Navigation */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <AppLogo size="sm" showText={true} />
            <span className="hidden md:inline-flex items-center text-[#86868B]/60 text-xs pl-1">/</span>
            <span className="hidden md:inline-flex text-xs text-[#6E6E73] font-medium group-hover:text-[#1D1D1F] transition-colors">Workspace</span>
          </Link>

          {/* Apple Segmented Navigation Tabs */}
          <nav className="flex items-center p-0.5 sm:p-1 bg-black/[0.04] rounded-xl ml-1 sm:ml-2 gap-0.5 sm:gap-1 border border-black/[0.03]">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all ${
                  isActive
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/50 font-medium'
                }`
              }
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Projects</span>
            </NavLink>

            <NavLink
              to="/knowledge-base"
              className={({ isActive }) =>
                `flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs transition-all ${
                  isActive
                    ? 'bg-white text-[#1D1D1F] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-white/50 font-medium'
                }`
              }
            >
              <BookOpen className="w-3.5 h-3.5 text-[#34C759]" />
              <span className="hidden sm:inline">Knowledge Base</span>
              <span className="sm:hidden">Notes</span>
            </NavLink>
          </nav>
        </div>

        {/* Right: Search, Quick Action, and Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-black/[0.03] hover:bg-black/[0.06] border border-black/[0.05] rounded-xl text-xs text-[#6E6E73] hover:text-[#1D1D1F] transition-all shadow-xs"
            title="Search workspace... (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#86868B]" />
            <span className="hidden sm:inline text-xs">Search workspace...</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-black/[0.08] text-[10px] font-mono text-[#6E6E73] font-medium shadow-2xs">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Quick Create Project Button */}
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}

          {/* User Profile Dropdown */}
          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 p-1 hover:bg-black/[0.04] border border-transparent hover:border-black/[0.05] rounded-xl transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8F2FE] border border-[#0071E3]/25 flex items-center justify-center text-xs font-bold text-[#0071E3] shadow-xs">
                  {userInitial}
                </div>
                <ChevronDown className="w-3 h-3 text-[#86868B]" />
              </button>
            }
            items={[
              {
                label: user?.email || 'Logged In',
                icon: <Layers className="w-3.5 h-3.5 text-[#0071E3]" />,
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
