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
      // Edit mode
      return await updateLearning(id, {
        title: payload.title,
        content: payload.content,
        tags: payload.tags,
      });
    } else {
      // Create mode
      return await createLearning(payload);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-7 select-none">
      {/* Header & Record CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Repository
            </span>
            <span className="text-slate-500 text-xs font-mono">• Global Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Technical Learnings
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Central repository of architectural patterns, post-mortems, and technical resolutions recorded against tasks across all projects.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveLearning(null);
            setModalMode('create');
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Record Learning
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keyword, architectural concept, error code, or tag..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#101217] border border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
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

      {/* Tag Filter Strip */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            Filter by Tag:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
              selectedTag === null
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                : 'bg-[#101217] text-slate-400 hover:text-white border border-white/[0.06]'
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'bg-[#101217] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              #{tag} <span className="opacity-60 text-[10px]">({tagCounts[tag]})</span>
            </button>
          ))}
        </div>
      )}

      {/* 4-State UI */}
      {/* 1. Loading State */}
      {isLoading && (
        <div className="py-20 text-center text-xs font-mono text-slate-500">
          Loading technical learnings from database...
        </div>
      )}

      {/* 2. Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded text-xs font-medium hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-24 text-center border border-dashed border-white/[0.08] rounded-2xl bg-[#0c0d12]/50">
          <Sparkles className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No learnings found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {searchQuery || selectedTag
              ? 'No technical learnings match your current search criteria or tag filters.'
              : 'Record technical insights, architectural decisions, and bug resolutions directly against closed tasks.'}
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

      {/* 4. Success State: List of Learnings */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveLearning(item);
                setModalMode('view');
              }}
              className="group relative p-5 bg-[#101217] hover:bg-[#14161c] border border-white/[0.06] hover:border-white/[0.14] rounded-2xl transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer space-y-3.5"
            >
              {/* Header: Title, Provenance, Date, and Actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                    <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 text-[10px]">
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
                    title="Copy markdown"
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

              {/* Markdown Content Preview */}
              <div className="max-h-24 overflow-hidden relative">
                <MarkdownViewer
                  content={item.content}
                  className="text-xs text-slate-300 leading-relaxed"
                />
                <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-[#101217] group-hover:from-[#14161c] to-transparent pointer-events-none" />
              </div>

              {/* Tag Badges Strip */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-white/[0.05]">
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

      {/* View / Edit / Create Learning Modal */}
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

      {/* Delete Learning Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingLearning}
        title="Delete Technical Learning"
        itemName={deletingLearning?.title || ''}
        itemType="Learning"
        description="will be soft-deleted. It will no longer appear in the knowledge base, but audit records are retained."
        onClose={() => setDeletingLearning(null)}
        onConfirm={async () => {
          if (!deletingLearning) return { success: false };
          return await deleteLearning(deletingLearning.id);
        }}
      />
    </div>
  );
};
