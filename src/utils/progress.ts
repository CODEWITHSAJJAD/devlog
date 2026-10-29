/**
 * Shared utility for calculating realistic, weighted engineering progress
 * for Tasks and Projects.
 */

export const getTaskProgress = (statusId: string): number => {
  const s = statusId.toUpperCase();
  if (s.includes('DONE') || s.includes('COMPLETED')) return 100;
  if (s.includes('TESTING') || s.includes('QA') || s.includes('REVIEW')) return 80;
  if (s.includes('IN_PROGRESS') || s.includes('PROGRESS')) return 50;
  if (s.includes('TODO') || s.includes('TO_DO')) return 20;
  if (s.includes('BLOCKED')) return 20;
  if (s.includes('BACKLOG')) return 0;
  return 0;
};

export const getTaskProgressColor = (progress: number): string => {
  if (progress >= 100) return 'text-[#34C759] bg-[#34C759]';
  if (progress >= 75) return 'text-[#0071E3] bg-[#0071E3]';
  if (progress >= 45) return 'text-[#5856D6] bg-[#5856D6]';
  if (progress >= 20) return 'text-[#FF9500] bg-[#FF9500]';
  return 'text-[#86868B] bg-black/10';
};

export const calculateProjectProgress = (
  tasks: Array<{ statusId: string }>,
  projectStatusId?: string
): number => {
  if (tasks.length === 0) {
    if (projectStatusId === 'PROJ_STAT_COMPLETED') return 100;
    if (projectStatusId === 'PROJ_STAT_ACTIVE') return 15;
    return 0;
  }

  const sumProgress = tasks.reduce((acc, t) => acc + getTaskProgress(t.statusId), 0);
  return Math.round(sumProgress / tasks.length);
};
