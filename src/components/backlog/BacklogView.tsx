import React, { useState } from 'react';
import type { Task, Sprint, Lookup } from '../../../shared/types';
import { Badge, resolveBadgeVariant } from '../shared/Badge';
import { formatDate, parseToDate } from '../../utils/api';
import { DropdownMenu } from '../shared/DropdownMenu';
import {
  Layers,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Play,
  CheckCircle2,
  Calendar,
  Flame,
  ChevronsUp,
  ChevronUp,
  GripVertical,
  ArrowRight,
  Tag,
} from 'lucide-react';

interface BacklogViewProps {
  tasks: Task[];
  sprints: Sprint[];
  taskStatuses: Lookup[];
  taskTypes: Lookup[];
  priorities: Lookup[];
  onTaskClick: (task: Task) => void;
  onAddTaskToSprint: (sprintId: string | null) => void;
  onQuickCreateTask: (title: string, sprintId: string | null) => Promise<boolean>;
  onMoveTaskToSprint: (taskId: string, targetSprintId: string | null) => void;
  onOpenCreateSprint: () => void;
  onEditSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprintId: string) => void;
  onUpdateSprintStatus: (sprintId: string, status: 'ACTIVE' | 'PLANNED' | 'COMPLETED') => void;
  onDeleteTask: (taskId: string) => void;
  onRecordLearning: (task: Task) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  tasks,
  sprints,
  taskStatuses,
  taskTypes,
  priorities,
  onTaskClick,
  onAddTaskToSprint,
  onQuickCreateTask,
  onMoveTaskToSprint,
  onOpenCreateSprint,
  onEditSprint,
  onDeleteSprint,
  onUpdateSprintStatus,
  onDeleteTask,
  onRecordLearning,
}) => {
  // Collapsed sections tracking
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
  const [isBacklogCollapsed, setIsBacklogCollapsed] = useState(false);

  // Quick inline creation state per section
  const [quickInputSection, setQuickInputSection] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  // Drag over tracking
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);

  const toggleSprintCollapse = (sprintId: string) => {
    setCollapsedSprints((prev) => ({ ...prev, [sprintId]: !prev[sprintId] }));
  };

  const handleQuickSubmit = async (sprintId: string | null) => {
    if (!quickTitle.trim()) return;
    setIsQuickSubmitting(true);
    const success = await onQuickCreateTask(quickTitle.trim(), sprintId);
    setIsQuickSubmitting(false);
    if (success) {
      setQuickTitle('');
      setQuickInputSection(null);
    }
  };

  // Render Priority Icon
  const renderPriorityIcon = (priorityId: string) => {
    const prio = priorityId.toUpperCase();
    if (prio.includes('CRITICAL')) {
      return (
        <span title="Critical Priority">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
        </span>
      );
    }
    if (prio.includes('HIGH')) {
      return (
        <span title="High Priority">
          <ChevronsUp className="w-3.5 h-3.5 text-orange-500" />
        </span>
      );
    }
    if (prio.includes('MED')) {
      return (
        <span title="Medium Priority">
          <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
        </span>
      );
    }
    return (
      <span title="Low Priority">
        <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
      </span>
    );
  };

  // Due date status badge
  const renderDueBadge = (task: Task) => {
    const isDone = task.statusId === 'TASK_STAT_DONE';
    const dueDateObj = parseToDate(task.dueDate);
    if (!dueDateObj) return null;
    const now = Date.now();
    const diffDays = Math.ceil((dueDateObj.getTime() - now) / (1000 * 60 * 60 * 24));

    if (!isDone && diffDays < 0) {
      return (
        <span className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-medium">
          Overdue
        </span>
      );
    }
    if (!isDone && diffDays <= 2) {
      return (
        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
          Due soon
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono text-[#6E6E73] flex items-center gap-1">
        <Calendar className="w-2.5 h-2.5 text-[#86868B]" />
        {formatDate(task.dueDate)}
      </span>
    );
  };

  // Tasks partitioned by sprint
  const unassignedTasks = tasks.filter((t) => !t.sprintId);

  // Sprints sorted: ACTIVE first, PLANNED second, COMPLETED last
  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { ACTIVE: 1, PLANNED: 2, COMPLETED: 3 };
    return (order[a.status as keyof typeof order] || 2) - (order[b.status as keyof typeof order] || 2);
  });

  // Reusable Task Row Component
  const renderTaskRow = (task: Task) => {
    const shortId = `TSK-${task.id.slice(0, 4).toUpperCase()}`;
    const isDone = task.statusId === 'TASK_STAT_DONE';

    // Available target sprints to move to
    const targetMoveOptions = sprints
      .filter((s) => s.id !== task.sprintId)
      .map((s) => ({
        label: `Move to ${s.name}`,
        icon: <ArrowRight className="w-3.5 h-3.5" />,
        onClick: () => onMoveTaskToSprint(task.id, s.id),
      }));

    if (task.sprintId) {
      targetMoveOptions.unshift({
        label: 'Move to Backlog',
        icon: <ArrowRight className="w-3.5 h-3.5 text-[#86868B]" />,
        onClick: () => onMoveTaskToSprint(task.id, null),
      });
    }

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', task.id);
        }}
        onClick={() => onTaskClick(task)}
        className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 bg-white hover:bg-[#FAFBFD] border border-black/[0.05] hover:border-[#0071E3]/30 rounded-xl transition-all cursor-pointer shadow-2xs hover:shadow-xs gap-2 sm:gap-3 select-none"
      >
        {/* Left: Drag Handle, Key, Type, Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="text-[#86868B]/40 group-hover:text-[#86868B] cursor-grab active:cursor-grabbing flex-shrink-0 hidden sm:block">
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Type Badge */}
          <Badge
            label={task.typeId.replace('TASK_TYPE_', '')}
            variant={resolveBadgeVariant(task.typeId)}
            dot
          />

          {/* Task Key */}
          <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-1.5 py-0.2 rounded flex-shrink-0">
            {shortId}
          </span>

          {/* Title */}
          <span
            className={`text-xs font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors ${
              isDone ? 'line-through text-[#86868B]' : ''
            }`}
          >
            {task.title}
          </span>

          {/* Version Tag (desktop) */}
          {task.version && (
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-medium text-[#6E6E73] bg-black/[0.03] border border-black/[0.06] flex-shrink-0">
              <Tag className="w-2.5 h-2.5 text-[#86868B]" />
              {task.version}
            </span>
          )}
        </div>

        {/* Right / Bottom on mobile: Dates, Priority, Status Badge, Menu */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-black/[0.03]" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {task.version && (
              <span className="sm:hidden inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-medium text-[#6E6E73] bg-black/[0.03] border border-black/[0.06]">
                <Tag className="w-2.5 h-2.5 text-[#86868B]" />
                {task.version}
              </span>
            )}
            <div>{renderDueBadge(task)}</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Priority Icon */}
            <div className="flex items-center font-mono text-[10px] text-[#86868B]">
              {renderPriorityIcon(task.priorityId)}
            </div>

            {/* Status Badge */}
            <Badge
              label={task.statusId.replace('TASK_STAT_', '')}
              variant={resolveBadgeVariant(task.statusId)}
            />

            {/* Action Dropdown Menu */}
            <DropdownMenu
              trigger={
                <button
                  type="button"
                  className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors cursor-pointer"
                  title="Task options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              }
              items={[
                {
                  label: 'View Details',
                  icon: <ArrowRight className="w-3.5 h-3.5" />,
                  onClick: () => onTaskClick(task),
                },
                ...targetMoveOptions,
                'divider',
                {
                  label: 'Delete Task',
                  icon: <Trash2 className="w-3.5 h-3.5" />,
                  danger: true,
                  onClick: () => onDeleteTask(task.id),
                },
              ]}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 overflow-y-auto max-h-full pr-1">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white border border-black/[0.06] rounded-2xl shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0071E3]" />
            <span>Sprint Versions & Product Backlog</span>
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Organize engineering iterations, release versions, and unassigned backlog items.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenCreateSprint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sprint / Version</span>
          </button>
        </div>
      </div>

      {/* 2. Sprints / Versions List */}
      <div className="space-y-4">
        {sortedSprints.map((sprint) => {
          const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
          const doneTasks = sprintTasks.filter((t) => t.statusId === 'TASK_STAT_DONE').length;
          const isCollapsed = collapsedSprints[sprint.id] || false;
          const isDragTarget = dragOverSection === sprint.id;

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSection(sprint.id);
              }}
              onDragLeave={() => setDragOverSection(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSection(null);
                const taskId = e.dataTransfer.getData('text/plain');
                if (taskId) {
                  onMoveTaskToSprint(taskId, sprint.id);
                }
              }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isDragTarget
                  ? 'border-[#0071E3] bg-[#E8F2FE]/40 ring-2 ring-[#0071E3]/20 shadow-md'
                  : 'bg-[#F9F9FB] border-black/[0.06]'
              }`}
            >
              {/* Sprint Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-white border-b border-black/[0.05] gap-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => toggleSprintCollapse(sprint.id)}
                    className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <h3 className="font-bold text-xs text-[#1D1D1F] tracking-tight flex items-center gap-1.5">
                    <span>{sprint.name}</span>
                    {sprint.version && (
                      <span className="font-mono text-[10px] font-semibold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.2 rounded-md">
                        {sprint.version}
                      </span>
                    )}
                  </h3>

                  {/* Status Badge */}
                  {sprint.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE SPRINT
                    </span>
                  )}
                  {sprint.status === 'PLANNED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      PLANNED
                    </span>
                  )}
                  {sprint.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      CLOSED
                    </span>
                  )}

                  {/* Dates */}
                  {(sprint.startDate || sprint.endDate) && (
                    <span className="text-[10px] font-mono text-[#86868B] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#86868B]" />
                      {sprint.startDate ? formatDate(sprint.startDate) : 'Start'} &ndash;{' '}
                      {sprint.endDate ? formatDate(sprint.endDate) : 'End'}
                    </span>
                  )}

                  {/* Task counts pill */}
                  <span className="text-[10px] font-mono text-[#6E6E73] bg-black/[0.03] px-2 py-0.5 rounded-md border border-black/[0.05]">
                    {doneTasks}/{sprintTasks.length} done
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto flex-wrap">
                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => onUpdateSprintStatus(sprint.id, 'ACTIVE')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Sprint</span>
                    </button>
                  )}

                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => onUpdateSprintStatus(sprint.id, 'COMPLETED')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0071E3] hover:bg-[#0077ED] rounded-lg transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Complete Sprint</span>
                    </button>
                  )}

                  <button
                    onClick={() => onAddTaskToSprint(sprint.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#1D1D1F] hover:bg-black/[0.05] border border-black/[0.08] rounded-lg transition-colors bg-white shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>

                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    }
                    items={[
                      {
                        label: 'Edit Sprint Details',
                        icon: <Edit2 className="w-3.5 h-3.5" />,
                        onClick: () => onEditSprint(sprint),
                      },
                      'divider',
                      {
                        label: 'Delete Sprint',
                        icon: <Trash2 className="w-3.5 h-3.5" />,
                        danger: true,
                        onClick: () => onDeleteSprint(sprint.id),
                      },
                    ]}
                  />
                </div>
              </div>

              {/* Sprint Goal (if any) */}
              {sprint.goal && !isCollapsed && (
                <div className="px-4 py-2 bg-[#F5F5F7] border-b border-black/[0.04] text-[11px] text-[#6E6E73] font-sans flex items-center gap-1.5">
                  <span className="font-semibold text-[#1D1D1F]">Sprint Goal:</span>
                  <span>{sprint.goal}</span>
                </div>
              )}

              {/* Sprint Tasks Body */}
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {sprintTasks.map(renderTaskRow)}

                  {sprintTasks.length === 0 && (
                    <div className="py-6 text-center text-xs font-mono text-[#86868B] border border-dashed border-black/[0.08] rounded-xl bg-white/60">
                      No tasks assigned to {sprint.name} yet. Drag issues here or use the button below.
                    </div>
                  )}

                  {/* Inline quick task creation */}
                  {quickInputSection === sprint.id ? (
                    <div className="flex items-center gap-2 p-2 bg-white border border-[#0071E3]/40 rounded-xl shadow-xs animate-in fade-in">
                      <input
                        type="text"
                        autoFocus
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleQuickSubmit(sprint.id);
                          if (e.key === 'Escape') setQuickInputSection(null);
                        }}
                        placeholder={`What needs to be done in ${sprint.name}? (Press Enter to add)`}
                        className="flex-1 bg-transparent text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none"
                      />
                      <button
                        onClick={() => handleQuickSubmit(sprint.id)}
                        disabled={isQuickSubmitting || !quickTitle.trim()}
                        className="px-3 py-1 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setQuickInputSection(null)}
                        className="px-2 py-1 text-xs text-[#86868B] hover:text-[#1D1D1F]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQuickTitle('');
                        setQuickInputSection(sprint.id);
                      }}
                      className="w-full py-2 px-3 text-left text-xs font-medium text-[#6E6E73] hover:text-[#0071E3] hover:bg-white/80 rounded-xl border border-dashed border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create issue in {sprint.name}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Product Backlog Container (Tasks without Sprint) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverSection('BACKLOG');
        }}
        onDragLeave={() => setDragOverSection(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverSection(null);
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) {
            onMoveTaskToSprint(taskId, null);
          }
        }}
        className={`rounded-2xl border transition-all overflow-hidden ${
          dragOverSection === 'BACKLOG'
            ? 'border-[#0071E3] bg-[#E8F2FE]/40 ring-2 ring-[#0071E3]/20 shadow-md'
            : 'bg-[#F9F9FB] border-black/[0.06]'
        }`}
      >
        {/* Backlog Header */}
        <div className="flex items-center justify-between p-3.5 bg-white border-b border-black/[0.05]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsBacklogCollapsed((prev) => !prev)}
              className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
            >
              {isBacklogCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <h3 className="font-bold text-xs text-[#1D1D1F] tracking-tight">
              Product Backlog
            </h3>
            <span className="text-[10px] font-mono text-[#6E6E73] bg-black/[0.03] px-2 py-0.5 rounded-full border border-black/[0.05]">
              {unassignedTasks.length} unassigned issues
            </span>
          </div>

          <button
            onClick={() => onAddTaskToSprint(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#1D1D1F] hover:bg-black/[0.05] border border-black/[0.08] rounded-lg transition-colors bg-white shadow-2xs cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add to Backlog</span>
          </button>
        </div>

        {/* Backlog Tasks Body */}
        {!isBacklogCollapsed && (
          <div className="p-3 space-y-2">
            {unassignedTasks.map(renderTaskRow)}

            {unassignedTasks.length === 0 && (
              <div className="py-6 text-center text-xs font-mono text-[#86868B] border border-dashed border-black/[0.08] rounded-xl bg-white/60">
                Backlog is clear. All tasks are currently assigned to active or planned sprints.
              </div>
            )}

            {/* Inline quick task creation for Backlog */}
            {quickInputSection === 'BACKLOG' ? (
              <div className="flex items-center gap-2 p-2 bg-white border border-[#0071E3]/40 rounded-xl shadow-xs animate-in fade-in">
                <input
                  type="text"
                  autoFocus
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickSubmit(null);
                    if (e.key === 'Escape') setQuickInputSection(null);
                  }}
                  placeholder="What needs to be added to the backlog? (Press Enter to add)"
                  className="flex-1 bg-transparent text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none"
                />
                <button
                  onClick={() => handleQuickSubmit(null)}
                  disabled={isQuickSubmitting || !quickTitle.trim()}
                  className="px-3 py-1 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  Add
                </button>
                <button
                  onClick={() => setQuickInputSection(null)}
                  className="px-2 py-1 text-xs text-[#86868B] hover:text-[#1D1D1F]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setQuickTitle('');
                  setQuickInputSection('BACKLOG');
                }}
                className="w-full py-2 px-3 text-left text-xs font-medium text-[#6E6E73] hover:text-[#0071E3] hover:bg-white/80 rounded-xl border border-dashed border-black/[0.08] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create issue in Backlog</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
