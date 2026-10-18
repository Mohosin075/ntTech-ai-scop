'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Shield, UserCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'ESTIMATOR' | 'ADMIN' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'ESTIMATOR' | 'ADMIN') => {
    setError(null);
    setDemoLoading(role);
    try {
      await demoLogin(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 items-center justify-center font-bold text-white shadow-xl shadow-indigo-500/25 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-50">ScopeAI Engine</h1>
          <p className="text-xs text-gray-400">Intelligent Software Scoping, Costing &amp; Milestone Engine</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#111827]/90 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
            <h2 className="text-lg font-semibold text-gray-50">
              {isRegister ? 'Create New Account' : 'Sign In to Your Workspace'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
            >
              {isRegister ? 'Have an account? Sign In' : 'New here? Register'}
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mohosin Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading !== null}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Complete Registration' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access - Critical for Examiner evaluation */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                ⚡ Quick Demo Access (1-Click)
              </span>
              <span className="text-[10px] text-indigo-400 font-mono">No typing required</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemo('ESTIMATOR')}
                disabled={demoLoading !== null || loading}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-gray-600 text-xs font-semibold text-gray-200 transition shadow-sm disabled:opacity-50 group"
              >
                {demoLoading === 'ESTIMATOR' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                )}
                <span>As Estimator</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('ADMIN')}
                disabled={demoLoading !== null || loading}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-gray-600 text-xs font-semibold text-gray-200 transition shadow-sm disabled:opacity-50 group"
              >
                {demoLoading === 'ADMIN' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                )}
                <span>As Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-gray-500">
          ScopeAI • Powered by Next.js, Express, Prisma &amp; PostgreSQL
        </p>
      </div>
    </div>
  );
}
