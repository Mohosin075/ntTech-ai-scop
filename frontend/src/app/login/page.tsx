'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserCheck, Loader2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex h-8 w-8 rounded-md bg-emerald-600 items-center justify-center font-bold text-white text-xs mb-1">
            S
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">ScopeAI</h1>
          <p className="text-xs text-zinc-400">Software scoping &amp; milestone cost engine</p>
        </div>

        <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h2 className="text-sm font-semibold text-zinc-100">
              {isRegister ? 'Create account' : 'Sign in'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              {isRegister ? 'Have an account? Sign in' : 'New here? Register'}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tanvir Hasan"
                  className="w-full px-3 py-2 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanvir@scopeai.dev"
                className="w-full px-3 py-2 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 rounded-md font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isRegister ? 'Register & continue' : 'Sign in'}</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-zinc-800/80">
            <span className="block text-xs text-zinc-500 mb-2 text-center font-sans">
              Quick demo access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ESTIMATOR')}
                className="py-1.5 px-2 rounded-md bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {demoLoading === 'ESTIMATOR' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>As Estimator</span>
              </button>

              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ADMIN')}
                className="py-1.5 px-2 rounded-md bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {demoLoading === 'ADMIN' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>As Admin</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Tanvir Hasan (Estimator) • Farhan Ahmed (Admin)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
