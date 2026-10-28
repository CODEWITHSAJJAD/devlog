import React, { useState, useEffect } from 'react';
import { Search, Tag, BookOpen } from 'lucide-react';
import { apiFetch, formatDate } from '../utils/api';
import type { Learning } from '../../shared/types';

export const KnowledgeBase: React.FC = () => {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearnings = async () => {
      setIsLoading(true);
      const res = await apiFetch<Learning[]>('/api/learnings');
      if (res.success && res.data) {
        setLearnings(res.data);
      } else {
        setError(res.error || 'Failed to load learnings');
      }
      setIsLoading(false);
    };
    fetchLearnings();
  }, []);

  const filtered = learnings.filter((l) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = l.title.toLowerCase().includes(query);
    const matchesContent = l.content.toLowerCase().includes(query);
    const matchesTag = l.tags?.some((t) => t.toLowerCase().includes(query));
    return matchesTitle || matchesContent || matchesTag;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
        <p className="text-sm text-slate-500">Search technical insights, bugs, and learnings across all projects</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, keyword, or tag (e.g. React, D1)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading && (
        <div className="text-center py-16 text-slate-500">Loading knowledge base...</div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No learnings recorded</h3>
          <p className="text-sm text-slate-500 mt-1">Attach learnings to completed tasks to build your knowledge base.</p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-wrap">
                {item.content}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
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
