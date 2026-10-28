import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { CommandPalette } from './components/shared/CommandPalette';
import { CreateProjectModal } from './components/shared/CreateProjectModal';
import { LearningModal } from './components/shared/LearningModal';
import { useFetchProjects } from './hooks/useFetchProjects';
import { useLearnings } from './hooks/useLearnings';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { ProjectBoard } from './pages/ProjectBoard';
import { KnowledgeBase } from './pages/KnowledgeBase';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewLearningOpen, setIsNewLearningOpen] = useState(false);

  const { createProject } = useFetchProjects();
  const { createLearning } = useLearnings();

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060709] text-slate-500 font-mono text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.06),transparent)] flex flex-col">
      <Navbar
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onNewProject={() => setIsNewProjectOpen(true)}
      />

      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectBoard />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewProject={() => setIsNewProjectOpen(true)}
        onNewLearning={() => setIsNewLearningOpen(true)}
      />

      {/* Global Quick Create Project Modal */}
      <CreateProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onSubmit={createProject}
      />

      {/* Global Quick Record Learning Modal */}
      <LearningModal
        isOpen={isNewLearningOpen}
        mode="create"
        learning={null}
        onClose={() => setIsNewLearningOpen(false)}
        onSave={async (payload) => createLearning(payload)}
      />
    </div>
  );
};

const PublicRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/" replace />;
  return element;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/register" element={<PublicRoute element={<Register />} />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
