import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../../shared/types';
import { apiFetch } from '../utils/api';

export const useFetchProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiFetch<Project[]>('/api/projects');
    if (res.success && res.data) {
      setProjects(res.data);
    } else {
      setError(res.error || 'Failed to fetch projects');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refetch: fetchProjects };
};
