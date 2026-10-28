import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface TopbarProps {
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ breadcrumb }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-[#08090b] border-b border-white/[0.06] flex items-center justify-between px-6 select-none flex-shrink-0">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="font-mono text-slate-500">workspace</span>
        <span className="text-slate-600">/</span>
        <span className="font-medium text-slate-200">
          {breadcrumb || 'Engineering Workspace'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
          <ShieldCheck className="w-3 h-3" />
          Multi-Tenant Isolated
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/[0.06]">
          <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-mono font-semibold text-[10px]">
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
