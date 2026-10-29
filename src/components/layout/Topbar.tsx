import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface TopbarProps {
  breadcrumb?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ breadcrumb }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between px-6 select-none flex-shrink-0">
      <div className="flex items-center gap-2.5 text-xs">
        <span className="font-mono text-[#86868B]">workspace</span>
        <span className="text-[#86868B]/50">/</span>
        <span className="font-semibold text-[#1D1D1F]">
          {breadcrumb || 'Engineering Workspace'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Multi-Tenant Isolated
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-black/[0.06]">
          <div className="w-6 h-6 rounded-md bg-[#E8F2FE] border border-[#0071E3]/20 text-[#0071E3] flex items-center justify-center font-mono font-bold text-[10px]">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-[#1D1D1F] font-medium">
            {user?.name || user?.email || 'Developer'}
          </span>
        </div>
      </div>
    </header>
  );
};
