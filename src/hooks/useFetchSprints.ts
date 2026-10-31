import { useState, useEffect, useCallback } from 'react';
import type { Sprint } from '../../shared/types';
import { apiFetch } from '../utils/api';

export interface CreateSprintPayload {
  name: string;
  version?: string;
  goal?: string;
  status?: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
  startDate?: number;
  endDate?: number;
}

export interface UpdateSprintPayload {
  name?: string;
  version?: string | null;
  goal?: string | null;
  status?: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
  startDate?: number | null;
  endDate?: number | null;
}

export const useFetchSprints = (projectId?: string) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSprints = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    const res = await apiFetch<Sprint[]>(`/api/sprints?projectId=${encodeURIComponent(projectId)}`);
    if (res.success && res.data) {
      setSprints(res.data);
    } else {
      setError(res.error || 'Failed to fetch sprints');
    }
    setIsLoading(false);
  }, [projectId]);

  const createSprint = async (payload: CreateSprintPayload) => {
    if (!projectId) return { success: false, error: 'No project selected' };
    const res = await apiFetch<Sprint>('/api/sprints', {
      method: 'POST',
      body: JSON.stringify({ ...payload, projectId }),
    });
    if (res.success && res.data) {
      setSprints((prev) => [...prev, res.data!]);
      return { success: true, sprint: res.data };
    }
    return { success: false, error: res.error || 'Failed to create sprint' };
  };

  const updateSprint = async (id: string, updates: UpdateSprintPayload) => {
    const res = await apiFetch(`/api/sprints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res.success) {
      setSprints((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          return {
            ...s,
            ...updates,
            startDate: updates.startDate !== undefined ? (updates.startDate ? new Date(updates.startDate * 1000) : null) : s.startDate,
            endDate: updates.endDate !== undefined ? (updates.endDate ? new Date(updates.endDate * 1000) : null) : s.endDate,
          };
        })
      );
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update sprint' };
  };

  const deleteSprint = async (id: string) => {
    const res = await apiFetch(`/api/sprints/${id}`, { method: 'DELETE' });
    if (res.success) {
      setSprints((prev) => prev.filter((s) => s.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete sprint' };
  };

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  return {
    sprints,
    isLoading,
    error,
    refetch: fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint,
  };
};
