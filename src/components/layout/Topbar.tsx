import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Enterprise DevLog Platform
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
          {user?.name || user?.email || 'User'}
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-xs">
          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
