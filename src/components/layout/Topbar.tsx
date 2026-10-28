import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ breadcrumb }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-[#090a0f] border-b border-white/5 flex items-center justify-between px-6 select-none">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500">workspace</span>
        <span className="text-slate-600">/</span>
        <span className="text-xs font-medium text-slate-200">
          {breadcrumb || 'Engineering Workspace'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/5">
          <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-semibold text-[11px]">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-slate-300 font-medium">
            {user?.name || user?.email || 'Developer'}
          </span>
        </div>
      </div>
    </header>
  );
};
