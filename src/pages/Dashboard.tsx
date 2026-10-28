import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
import { useFetchProjects } from '../hooks/useFetchProjects';
import { formatDate } from '../utils/api';

export const Dashboard: React.FC = () => {
  const { projects, isLoading, error } = useFetchProjects();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-sm text-slate-500">Manage and monitor active client and team projects</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-slate-500">Loading projects...</div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
          <Folder className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">No projects yet</h3>
          <p className="text-sm text-slate-500 mt-1">Get started by creating your first project.</p>
        </div>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-4 flex justify-between">
                <span>Due: {formatDate(project.dueDate)}</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">View Board &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
