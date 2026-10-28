import React, { useState } from 'react';
import { Search, Tag, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import { useLearnings } from '../hooks/useLearnings';
import { MarkdownViewer } from '../components/shared/MarkdownViewer';
import { formatDate } from '../utils/api';

export const KnowledgeBase: React.FC = () => {
  const { learnings, isLoading, error, refetch } = useLearnings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(learnings.flatMap((l) => l.tags || []).map((t) => t.toLowerCase()))
  );

  const filtered = learnings.filter((l) => {
    const q = searchQuery.toLowerCase();
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Technical Knowledge Base
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Architectural decisions, bug post-mortems, and engineering insights recorded against tasks.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keyword, architectural concept, error message, or tag..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#11131a] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
        />
      </div>

      {/* Tag Cloud Filter Strip */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            Tags:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
              selectedTag === null
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 4-State UI */}
      {isLoading && (
        <div className="py-20 text-center text-xs font-mono text-slate-500">
          Loading technical learnings...
        </div>
      )}

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

      {!isLoading && !error && filtered.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0d0e14]/50">
          <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No learnings recorded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Close tickets on your Kanban boards and record technical learnings to populate your team's knowledge base.
          </p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#11131a] hover:bg-[#151722] border border-white/5 hover:border-white/10 rounded-xl transition-all shadow-sm space-y-3"
            >
              {/* Card Header: Title + Task Provenance + Date */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500">
                    <span>Task: TSK-{item.taskId.slice(0, 4).toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(item.id, `${item.title}\n\n${item.content}`)}
                  className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-white/5 transition-colors"
                  title="Copy learning"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Markdown Content */}
              <MarkdownViewer content={item.content} className="text-xs text-slate-300" />

              {/* Tag Badges */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setSelectedTag(tag.toLowerCase())}
                      className="inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded cursor-pointer transition-colors"
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
    </div>
  );
};
