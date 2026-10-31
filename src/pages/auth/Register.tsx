import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';
import { Loader2, ArrowRight, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { AppLogo } from '../../components/shared/AppLogo';
import type { SafeUser } from '../../../shared/types';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiFetch<SafeUser>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    setLoading(false);
    if (res.success && res.data) {
      login(res.data);
      navigate('/');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-4 py-8 select-none">
      <div className="max-w-md w-full bg-white p-7 sm:p-8 rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center mb-6 text-center">
          <AppLogo size="xl" showText={false} className="mb-4" />
          <h2 className="text-xl font-bold text-[#1D1D1F] tracking-tight font-display">Create DevLog Account</h2>
          <p className="text-xs text-[#6E6E73] mt-1 font-mono">Join your high-velocity engineering workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1D1D1F]">Password *</label>
              <span className="text-[10px] text-[#86868B] font-mono">Min 6 characters</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 bg-[#F5F5F7] border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#1D1D1F]">Confirm Password *</label>
              {isPasswordMatch && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 font-mono">
                  <Check className="w-3 h-3" /> Matched
                </span>
              )}
              {isPasswordMismatch && (
                <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1 font-mono">
                  Does not match
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 bg-[#F5F5F7] border rounded-xl text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:bg-white transition-all ${
                  isPasswordMismatch
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
                    : isPasswordMatch
                    ? 'border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15'
                    : 'border-black/[0.08] focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors p-1"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isPasswordMismatch}
            className="w-full py-2.5 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 mt-3 shadow-[0_1px_3px_rgba(0,113,227,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6E6E73]">
          Already registered?{' '}
          <Link to="/login" className="text-[#0071E3] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
