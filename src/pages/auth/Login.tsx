import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { Loader2, ArrowRight } from 'lucide-react';
import { AppLogo } from '../../components/shared/AppLogo';
import type { SafeUser } from '../../../shared/types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await apiFetch<SafeUser>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.success && res.data) {
      login(res.data);
      navigate('/');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-4 select-none">
      <div className="max-w-sm w-full bg-white p-8 rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center mb-6 text-center">
          <AppLogo size="xl" showText={false} className="mb-4" />
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight font-display">Sign in to DevLog</h2>
          <p className="text-xs text-[#6E6E73] mt-1 font-mono">Multi-tenant engineering workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              className="w-full px-3 py-2.5 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2.5 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 mt-2 shadow-[0_1px_3px_rgba(0,113,227,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6E6E73]">
          New to DevLog?{' '}
          <Link to="/register" className="text-[#0071E3] hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
