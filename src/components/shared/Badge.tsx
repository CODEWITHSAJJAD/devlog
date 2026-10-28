import React from 'react';

type BadgeVariant = 'feature' | 'bug' | 'rd' | 'low' | 'medium' | 'high' | 'neutral' | 'tag';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, string> = {
  feature: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  bug: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  rd: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  tag: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer',
};

export const resolveBadgeVariant = (code: string): BadgeVariant => {
  const c = code.toUpperCase();
  if (c.includes('FEATURE')) return 'feature';
  if (c.includes('BUG')) return 'bug';
  if (c.includes('RD') || c.includes('R&D')) return 'rd';
  if (c.includes('HIGH')) return 'high';
  if (c.includes('MEDIUM')) return 'medium';
  if (c.includes('LOW')) return 'low';
  return 'neutral';
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', className = '', onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
