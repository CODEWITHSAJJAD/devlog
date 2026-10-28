import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Board } from '../components/kanban/Board';
import { useFetchTasks } from '../hooks/useFetchTasks';
import { apiFetch } from '../utils/api';
import type { Lookup, Task } from '../../shared/types';

export const ProjectBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { tasks, isLoading, error } = useFetchTasks(id);
  const [statuses, setStatuses] = useState<Lookup[]>([]);

  useEffect(() => {
    const loadLookups = async () => {
      const res = await apiFetch<Lookup[]>('/api/lookups?category=TASK_STATUS');
      if (res.success && res.data) {
        setStatuses(res.data);
      }
    };
    loadLookups();
  }, []);

  return (
    <div className="p-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Project Board</h1>
            <p className="text-xs text-slate-500">Track and manage tasks across status columns</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-slate-500">Loading board...</div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex-1 overflow-hidden">
          <Board
            statuses={statuses}
            tasks={tasks}
            onTaskClick={(task: Task) => console.log('Task clicked:', task.id)}
          />
        </div>
      )}
    </div>
  );
};
