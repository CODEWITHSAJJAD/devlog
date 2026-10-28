import React from 'react';

export type BadgeVariant =
  | 'critical'
  | 'feature'
  | 'bug'
  | 'rd'
  | 'low'
  | 'medium'
  | 'high'
  | 'neutral'
  | 'tag'
  | 'success';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, { bg: string; dot: string; glow?: string }> = {
  critical: {
    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold shadow-[0_0_8px_rgba(244,63,94,0.15)]',
    dot: 'bg-rose-400 animate-pulse',
  },
  feature: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  bug: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
  },
  rd: {
    bg: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    dot: 'bg-violet-400',
  },
  low: {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
  },
  medium: {
    bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  high: {
    bg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    dot: 'bg-orange-400',
  },
  success: {
    bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  neutral: {
    bg: 'bg-white/[0.04] text-slate-300 border-white/[0.08]',
    dot: 'bg-slate-400',
  },
  tag: {
    bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer',
    dot: 'bg-indigo-400',
  },
};

export const resolveBadgeVariant = (code: string): BadgeVariant => {
  const c = code.toUpperCase();
  if (c.includes('CRITICAL') || c.includes('URGENT')) return 'critical';
  if (c.includes('FEATURE')) return 'feature';
  if (c.includes('BUG')) return 'bug';
  if (c.includes('RD') || c.includes('R&D')) return 'rd';
  if (c.includes('COMPLETED') || c.includes('DONE')) return 'success';
  if (c.includes('HIGH')) return 'high';
  if (c.includes('MEDIUM') || c.includes('MED')) return 'medium';
  if (c.includes('LOW')) return 'low';
  return 'neutral';
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  className = '',
  dot = false,
  onClick,
}) => {
  const style = variantStyles[variant] || variantStyles.neutral;
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-tight border transition-colors ${style.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${style.dot}`} />}
      {label}
    </span>
  );
};
