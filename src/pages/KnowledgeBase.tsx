import React, { useState } from 'react';
import {
  Search,
  Tag,
  Sparkles,
  Copy,
  Check,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import { useLearnings } from '../hooks/useLearnings';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';
import { LearningModal } from '../components/shared/LearningModal';
import { DeleteConfirmModal } from '../components/shared/DeleteConfirmModal';
import { DropdownMenu } from '../components/shared/DropdownMenu';
import { formatDate } from '../utils/api';
import type { Learning } from '../../shared/types';

export const KnowledgeBase: React.FC = () => {
  const { learnings, isLoading, error, refetch, createLearning, updateLearning, deleteLearning } =
    useLearnings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [activeLearning, setActiveLearning] = useState<Learning | null>(null);
  const [deletingLearning, setDeletingLearning] = useState<Learning | null>(null);

  // Extract all unique tags with count
  const tagCounts = learnings.reduce<Record<string, number>>((acc, item) => {
    (item.tags || []).forEach((t) => {
      const lower = t.toLowerCase();
      acc[lower] = (acc[lower] || 0) + 1;
    });
    return acc;
  }, {});

  const allTags = Object.keys(tagCounts).sort();

  const filtered = learnings.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      l.tags?.some((t) => t.toLowerCase().includes(q));

    const matchesTag =
      !selectedTag || l.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

    return matchesSearch && matchesTag;
  });

  // Effective selected note in split reader mode
  const currentSelectedNote =
    filtered.find((l) => l.id === selectedNoteId) || (filtered.length > 0 ? filtered[0] : null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveLearning = async (
    payload: { taskId: string; title: string; content: string; tags: string[] },
    id?: string
  ) => {
    if (id) {
      return await updateLearning(id, {
        title: payload.title,
        content: payload.content,
        tags: payload.tags,
      });
    } else {
      return await createLearning(payload);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[96rem] mx-auto space-y-6 select-none">
      {/* 1. Header & Primary Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
              Engineering Second Brain
            </span>
            <span className="text-slate-500 text-xs font-mono">• Provenance Linked</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Technical Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Architectural decisions, bug post-mortems, and engineering insights permanently cataloged across tickets.
          </p>
        </div>

        {/* View Mode Switcher & Create Action */}
        <div className="flex items-center gap-3">
          {/* Layout Mode Toggle */}
          <div className="flex items-center bg-[#121520] border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Split Reader Canvas"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split Reader</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bento Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          <button
            onClick={() => {
              setActiveLearning(null);
              setModalMode('create');
            }}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Learning
          </button>
        </div>
      </div>

      {/* 2. Search & Tag Filter HUD */}
      <div className="p-4 bg-[#121520] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across architectural notes, code snippets, error codes, and tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              Filter by Tag:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                selectedTag === null
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              All ({learnings.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                #{tag} <span className="opacity-60 text-[10px]">({tagCounts[tag]})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Content: Split Reader vs Grid */}
      {isLoading && (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Querying technical learnings from database...
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#121520]/50">
          <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No technical notes found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedTag
              ? 'No technical learnings match your active search filter.'
              : 'Close tickets or click "Record Learning" to build your engineering knowledge repository.'}
          </p>
          <button
            onClick={() => {
              setActiveLearning(null);
              setModalMode('create');
            }}
            className="mt-5 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Record Learning
          </button>
        </div>
      )}

      {/* SPLIT READER VIEW */}
      {!isLoading && !error && filtered.length > 0 && viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Stream Index */}
          <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = currentSelectedNote?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNoteId(item.id)}
                  className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-[#181d2c] border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]'
                      : 'bg-[#121520] hover:bg-[#161a27] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3
                      className={`text-xs font-bold tracking-tight line-clamp-1 transition-colors ${
                        isSelected ? 'text-emerald-300' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded flex-shrink-0">
                      TSK-{item.taskId.slice(0, 4).toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-emerald-400/80">
                            #{t}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-slate-500">+{item.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Obsidian-Grade Reading Canvas */}
          <div className="lg:col-span-7 bg-[#121520] border border-white/[0.08] rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] min-h-[28rem]">
            {currentSelectedNote ? (
              <div className="space-y-5">
                {/* Header: Title, Provenance, Actions */}
                <div className="flex items-start justify-between pb-4 border-b border-white/[0.06] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        TSK-{currentSelectedNote.taskId.slice(0, 4).toUpperCase()}
                      </span>
                      <span className="text-slate-500 text-xs font-mono">
                        {formatDate(currentSelectedNote.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                      {currentSelectedNote.title}
                    </h2>
                  </div>

                  {/* Actions Ribbon */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleCopy(
                          currentSelectedNote.id,
                          `# ${currentSelectedNote.title}\n\n${currentSelectedNote.content}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors active:scale-95"
                      title="Copy markdown"
                    >
                      {copiedId === currentSelectedNote.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy MD</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveLearning(currentSelectedNote);
                        setModalMode('edit');
                      }}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/[0.06] transition-colors active:scale-95"
                      title="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingLearning(currentSelectedNote)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors active:scale-95"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tags row */}
                {currentSelectedNote.tags && currentSelectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {currentSelectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSelectedTag(tag.toLowerCase())}
                        className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/20 cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Full Markdown Reading Canvas */}
                <div className="p-5 bg-black/30 border border-white/[0.04] rounded-xl overflow-y-auto max-h-[calc(100vh-26rem)] shadow-inner">
                  <MarkdownViewer
                    content={currentSelectedNote.content}
                    className="text-xs text-slate-200 leading-relaxed font-sans"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* BENTO GRID VIEW */}
      {!isLoading && !error && filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveLearning(item);
                setModalMode('view');
              }}
              className="group relative p-5 bg-[#121520] hover:bg-[#181d2c] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                      <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        TSK-{item.taskId.slice(0, 4).toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopy(item.id, `# ${item.title}\n\n${item.content}`)}
                      className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                      title="Copy note markdown"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <DropdownMenu
                      trigger={
                        <button
                          className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                          title="Learning options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        {
                          label: 'View Full Note',
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setActiveLearning(item);
                            setModalMode('view');
                          },
                        },
                        {
                          label: 'Edit Note',
                          icon: <Edit2 className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setActiveLearning(item);
                            setModalMode('edit');
                          },
                        },
                        'divider',
                        {
                          label: 'Delete Note',
                          icon: <Trash2 className="w-3.5 h-3.5" />,
                          danger: true,
                          onClick: () => setDeletingLearning(item),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="max-h-24 overflow-hidden relative text-xs text-slate-300 leading-relaxed font-sans">
                  <MarkdownViewer content={item.content} />
                  <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#090b10] group-hover:from-[#0e1017] to-transparent pointer-events-none" />
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06] mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag.toLowerCase());
                      }}
                      className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/20 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Learning Modal for Create / Edit / View Full */}
      <LearningModal
        isOpen={modalMode !== null}
        mode={modalMode || 'view'}
        learning={activeLearning}
        onClose={() => {
          setModalMode(null);
          setActiveLearning(null);
        }}
        onSave={handleSaveLearning}
        onDelete={(l) => setDeletingLearning(l)}
        onSwitchToEdit={(l) => {
          setActiveLearning(l);
          setModalMode('edit');
        }}
      />

      {/* Delete Learning Confirmation */}
      <DeleteConfirmModal
        isOpen={!!deletingLearning}
        title="Delete Technical Learning"
        itemName={deletingLearning?.title || ''}
        itemType="Learning"
        description="will be soft-deleted. It will no longer appear in your active knowledge base."
        onClose={() => setDeletingLearning(null)}
        onConfirm={async () => {
          if (!deletingLearning) return { success: false };
          return await deleteLearning(deletingLearning.id);
        }}
      />
    </div>
  );
};
