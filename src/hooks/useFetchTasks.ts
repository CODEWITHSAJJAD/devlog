import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../../shared/types';
import { apiFetch } from '../utils/api';

export const useFetchTasks = (projectId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    const res = await apiFetch<Task[]>(`/api/tasks?projectId=${encodeURIComponent(projectId)}`);
    if (res.success && res.data) {
      setTasks(res.data);
    } else {
      setError(res.error || 'Failed to fetch tasks');
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, isLoading, error, refetch: fetchTasks };
};
