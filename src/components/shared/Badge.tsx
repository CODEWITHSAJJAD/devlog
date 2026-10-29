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
  | 'success'
  | 'testing'
  | 'progress'
  | 'todo';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
  critical: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  feature: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  bug: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  rd: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  low: {
    bg: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  medium: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  high: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  success: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  testing: {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500',
  },
  progress: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  todo: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  neutral: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  tag: {
    bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer',
    dot: 'bg-slate-400',
  },
};

export const resolveBadgeVariant = (code: string): BadgeVariant => {
  const c = code.toUpperCase();
  if (c.includes('CRITICAL') || c.includes('URGENT') || c.includes('BLOCKED')) return 'critical';
  if (c.includes('TESTING') || c.includes('QA') || c.includes('REVIEW')) return 'testing';
  if (c.includes('PROGRESS')) return 'progress';
  if (c.includes('TODO') || c.includes('TO_DO')) return 'todo';
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
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${style.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${style.dot}`} />}
      {label}
    </span>
  );
};
