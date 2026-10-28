import { useState, useEffect, useCallback } from 'react';
import type { Learning } from '../../shared/types';
import { apiFetch } from '../utils/api';

export const useLearnings = (taskId?: string) => {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLearnings = useCallback(
    async (params?: { search?: string; tag?: string }) => {
      setIsLoading(true);
      setError(null);
      const query = new URLSearchParams();
      if (taskId) query.set('taskId', taskId);
      if (params?.search) query.set('search', params.search);
      if (params?.tag) query.set('tag', params.tag);

      const qs = query.toString();
      const res = await apiFetch<Learning[]>(`/api/learnings${qs ? `?${qs}` : ''}`);
      if (res.success && res.data) {
        setLearnings(res.data);
      } else {
        setError(res.error || 'Failed to fetch learnings');
      }
      setIsLoading(false);
    },
    [taskId]
  );

  const createLearning = async (payload: { taskId: string; title: string; content: string; tags?: string[] }) => {
    const res = await apiFetch<Learning>('/api/learnings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      setLearnings((prev) => [res.data!, ...prev]);
      return { success: true, learning: res.data };
    }
    return { success: false, error: res.error || 'Failed to record learning' };
  };

  const updateLearning = async (
    id: string,
    updates: { title?: string; content?: string; tags?: string[] }
  ) => {
    const res = await apiFetch(`/api/learnings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res.success) {
      setLearnings((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update learning' };
  };

  const deleteLearning = async (id: string) => {
    const res = await apiFetch(`/api/learnings/${id}`, { method: 'DELETE' });
    if (res.success) {
      setLearnings((prev) => prev.filter((l) => l.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete learning' };
  };

  useEffect(() => {
    fetchLearnings();
  }, [fetchLearnings]);

  return {
    learnings,
    isLoading,
    error,
    refetch: fetchLearnings,
    createLearning,
    updateLearning,
    deleteLearning,
  };
};
