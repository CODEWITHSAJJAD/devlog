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

  const createProject = async (payload: { title: string; description?: string; statusId?: string; priorityId?: string; dueDate?: number }) => {
    const res = await apiFetch<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      setProjects((prev) => [res.data!, ...prev]);
      return { success: true, project: res.data };
    }
    return { success: false, error: res.error || 'Failed to create project' };
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const res = await apiFetch(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res.success) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update project' };
  };

  const deleteProject = async (id: string) => {
    const res = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete project' };
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, isLoading, error, refetch: fetchProjects, createProject, updateProject, deleteProject };
};
