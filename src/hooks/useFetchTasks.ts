import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../../shared/types';
import { apiFetch } from '../utils/api';

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  typeId?: string;
  statusId?: string;
  priorityId?: string;
  position?: number;
  dueDate?: number;
  completedAt?: number | null;
}

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

  const createTask = async (payload: {
    title: string;
    description?: string;
    typeId: string;
    statusId?: string;
    priorityId?: string;
    dueDate?: number;
  }) => {
    if (!projectId) return { success: false, error: 'No project selected' };
    const res = await apiFetch<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...payload, projectId }),
    });
    if (res.success && res.data) {
      setTasks((prev) => [...prev, res.data!]);
      return { success: true, task: res.data };
    }
    return { success: false, error: res.error || 'Failed to create task' };
  };

  const updateTask = async (id: string, updates: UpdateTaskPayload) => {
    const res = await apiFetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (res.success) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            ...updates,
            dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate * 1000) : null) : t.dueDate,
            completedAt: updates.completedAt !== undefined ? (updates.completedAt ? new Date(updates.completedAt * 1000) : null) : t.completedAt,
          };
        })
      );
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to update task' };
  };

  const moveTask = async (taskId: string, targetStatusId: string, newPosition: number) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              statusId: targetStatusId,
              position: newPosition,
              completedAt: targetStatusId === 'TASK_STAT_DONE' ? new Date() : null,
            }
          : t
      )
    );

    const res = await apiFetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ statusId: targetStatusId, position: newPosition }),
    });

    if (!res.success) {
      fetchTasks();
      return { success: false, error: res.error || 'Failed to move task' };
    }
    return { success: true };
  };

  const deleteTask = async (id: string) => {
    const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete task' };
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
  };
};
