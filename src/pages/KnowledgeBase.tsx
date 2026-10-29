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
      {/* 1. Apple Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            Knowledge Base
          </h1>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-xl">
            Architectural decisions, bug post-mortems, and engineering insights permanently cataloged across tickets.
          </p>
        </div>

        {/* View Mode Switcher & Create Action */}
        <div className="flex items-center gap-3">
          {/* Layout Mode Segmented Control */}
          <div className="flex items-center bg-black/[0.04] rounded-xl p-1 gap-1 border border-black/[0.03]">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="Split Reader Canvas"
            >
              <Columns className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden sm:inline">Split Reader</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title="Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#0071E3]" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          <button
            onClick={() => {
              setActiveLearning(null);
              setModalMode('create');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Learning</span>
          </button>
        </div>
      </div>

      {/* 2. Apple Search & Tag Filter Box */}
      <div className="p-4 bg-white border border-black/[0.06] rounded-2xl shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#86868B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across notes, architecture decisions, code snippets, and tags..."
            className="w-full pl-10 pr-8 py-2 bg-[#F5F5F7] border border-black/[0.06] hover:border-black/[0.12] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2 text-[#86868B] hover:text-[#1D1D1F] text-xs"
            >
              ×
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[11px] font-mono text-[#86868B] mr-1 flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              Filter by Tag:
            </span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                selectedTag === null
                  ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                  : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.06]'
              }`}
            >
              All ({learnings.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  selectedTag === tag
                    ? 'bg-[#0071E3] text-white font-semibold shadow-xs'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.06]'
                }`}
              >
                #{tag} <span className="opacity-70 text-[10px]">({tagCounts[tag]})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main Content: Split Reader vs Grid */}
      {isLoading && (
        <div className="py-24 text-center text-xs font-mono text-[#86868B]">
          Querying technical learnings from database...
        </div>
      )}

      {error && !isLoading && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => refetch()}
            className="text-white bg-rose-600 px-3 py-1 rounded-xl text-xs font-medium hover:bg-rose-500 shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-24 text-center border border-dashed border-black/[0.1] rounded-2xl bg-white shadow-xs">
          <Sparkles className="w-12 h-12 mx-auto text-[#86868B] mb-3" />
          <h3 className="text-base font-semibold text-[#1D1D1F]">No technical notes found</h3>
          <p className="text-xs text-[#6E6E73] mt-1.5 max-w-sm mx-auto leading-relaxed">
            {searchQuery || selectedTag
              ? 'No technical learnings match your active search filter.'
              : 'Close tickets or click "Record Learning" to build your engineering knowledge repository.'}
          </p>
          <button
            onClick={() => {
              setActiveLearning(null);
              setModalMode('create');
            }}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold rounded-xl shadow-[0_1px_3px_rgba(0,113,227,0.3)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Learning</span>
          </button>
        </div>
      )}

      {/* SPLIT READER VIEW */}
      {!isLoading && !error && filtered.length > 0 && viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Stream Index (Apple Notes style) */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-17rem)] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = currentSelectedNote?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNoteId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-white border-[#0071E3] shadow-[0_4px_16px_rgba(0,113,227,0.12)] ring-1 ring-[#0071E3]/30'
                      : 'bg-white/80 hover:bg-white border-black/[0.06] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3
                      className={`text-xs font-semibold tracking-tight line-clamp-1 transition-colors ${
                        isSelected ? 'text-[#0071E3]' : 'text-[#1D1D1F]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <span className="font-mono text-[10px] text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-1.5 py-0.2 rounded font-bold flex-shrink-0">
                      TSK-{item.taskId.slice(0, 4).toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6E6E73] line-clamp-2 leading-relaxed mb-2.5">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#86868B]">
                    <span>{formatDate(item.createdAt)}</span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1">
                        {item.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[#0071E3] font-medium">
                            #{t}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-[#86868B]">+{item.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Reading Canvas */}
          <div className="lg:col-span-7 bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm min-h-[30rem]">
            {currentSelectedNote ? (
              <div className="space-y-5">
                {/* Header: Title, Provenance, Actions */}
                <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-2 py-0.5 rounded-md">
                        TSK-{currentSelectedNote.taskId.slice(0, 4).toUpperCase()}
                      </span>
                      <span className="text-[#86868B] text-xs font-mono">
                        {formatDate(currentSelectedNote.createdAt)}
                      </span>
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-[#1D1D1F] tracking-tight leading-snug">
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBEF] text-xs text-[#1D1D1F] border border-black/[0.06] transition-colors active:scale-95"
                      title="Copy markdown"
                    >
                      {copiedId === currentSelectedNote.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#34C759]" />
                          <span className="text-[11px] font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#6E6E73]" />
                          <span className="text-[11px] font-medium">Copy MD</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveLearning(currentSelectedNote);
                        setModalMode('edit');
                      }}
                      className="p-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06] transition-colors active:scale-95"
                      title="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingLearning(currentSelectedNote)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors active:scale-95"
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
                        className="inline-flex items-center text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] hover:bg-[#D5E8FD] px-2.5 py-0.5 rounded-md border border-[#0071E3]/20 cursor-pointer transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Full Markdown Reading Canvas */}
                <div className="p-5 bg-[#F9F9FB] border border-black/[0.04] rounded-xl overflow-y-auto max-h-[calc(100vh-27rem)]">
                  <MarkdownViewer
                    content={currentSelectedNote.content}
                    className="text-xs text-[#1D1D1F] leading-relaxed font-sans"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {!isLoading && !error && filtered.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveLearning(item);
                setModalMode('view');
              }}
              className="group relative p-5 bg-white hover:bg-[#FAFBFD] border border-black/[0.06] hover:border-[#0071E3]/30 rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-[#86868B]">
                      <span className="text-[#0071E3] bg-[#E8F2FE] border border-[#0071E3]/20 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        TSK-{item.taskId.slice(0, 4).toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopy(item.id, `# ${item.title}\n\n${item.content}`)}
                      className="p-1 text-[#86868B] hover:text-[#1D1D1F] rounded-lg hover:bg-black/[0.05] transition-colors"
                      title="Copy note markdown"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-[#34C759]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <DropdownMenu
                      trigger={
                        <button
                          className="p-1 text-[#86868B] hover:text-[#1D1D1F] rounded-lg hover:bg-black/[0.05] transition-colors"
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

                <div className="max-h-24 overflow-hidden relative text-xs text-[#6E6E73] leading-relaxed font-sans">
                  <MarkdownViewer content={item.content} />
                  <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-white group-hover:from-[#FAFBFD] to-transparent pointer-events-none" />
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-3 border-t border-black/[0.05] mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tag.toLowerCase());
                      }}
                      className="inline-flex items-center text-[10px] font-mono text-[#0071E3] bg-[#E8F2FE] hover:bg-[#D5E8FD] px-2 py-0.5 rounded-md border border-[#0071E3]/20 cursor-pointer transition-colors"
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
        description="will be permanently removed from your active knowledge base."
        onClose={() => setDeletingLearning(null)}
        onConfirm={async () => {
          if (!deletingLearning) return { success: false };
          return await deleteLearning(deletingLearning.id);
        }}
      />
    </div>
  );
};
