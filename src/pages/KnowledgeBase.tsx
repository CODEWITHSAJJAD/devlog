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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* 1. Header & Primary Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold">
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

        <button
          onClick={() => {
            setActiveLearning(null);
            setModalMode('create');
          }}
          className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-[0_2px_12px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Record New Learning
        </button>
      </div>

      {/* 2. Search & Tag Filter HUD */}
      <div className="p-4 bg-[#0e1015] border border-white/[0.08] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-3.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all architectural notes, code snippets, error codes, and tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
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
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              Tag Filter:
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

      {/* 3. Main Stream / Grid (4-State) */}
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
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0c0d12]/50">
          <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No technical notes found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedTag
              ? 'No technical learnings match your active search filter.'
              : 'Close tickets or click "Record New Learning" to build your engineering knowledge repository.'}
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

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveLearning(item);
                setModalMode('view');
              }}
              className="group relative p-5 bg-[#0e1015] hover:bg-[#12141b] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Title, Provenance, Date, Actions */}
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

                {/* Markdown Preview */}
                <div className="max-h-24 overflow-hidden relative text-xs text-slate-300 leading-relaxed font-sans">
                  <MarkdownViewer content={item.content} />
                  <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#0e1015] group-hover:from-[#12141b] to-transparent pointer-events-none" />
                </div>
              </div>

                {/* Footer Tag Badges */}
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

      {/* Learning View / Edit / Create Modal */}
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
