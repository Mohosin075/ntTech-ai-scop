'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserCheck, Loader2, AlertCircle, Layers3 } from 'lucide-react';

export default function LoginPage() {
  const { login, register, demoLogin, user, isLoading } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'ESTIMATOR' | 'ADMIN' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

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
    <div className="min-h-screen flex justify-center items-center px-4 py-10 sm:px-8">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_440px] rounded-2xl overflow-hidden border border-[#d5deda] bg-white shadow-xl shadow-slate-900/5">
        <aside className="hidden lg:flex flex-col justify-between min-h-[620px] p-12 bg-[#e3ebe8] border-r border-[#d5deda]">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#173f52] flex items-center justify-center text-[#8ed0c5]"><Layers3 className="h-5 w-5" strokeWidth={1.8} /></div>
              <span className="text-lg font-semibold tracking-tight text-[#182b39]">ScopeAI</span>
            </div>
            <div className="mt-28 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#126b67]">Project planning workspace</p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[#182b39]">Plan the work.<br /><span className="text-[#126b67]">Price it clearly.</span></h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#526270]">Turn a project brief into an editable feature scope, delivery estimate, and milestone plan.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[["01", "Scope"], ["02", "Estimate"], ["03", "Review"]].map(([number, label]) => <div key={number} className="rounded-lg border border-[#d5deda] bg-white p-4"><div className="text-xs text-[#126b67]">{number}</div><div className="mt-2 text-sm font-medium text-[#304756]">{label}</div></div>)}
          </div>
        </aside>
        <div className="w-full max-w-md mx-auto px-6 py-9 sm:px-10 sm:py-12">
        <div className="text-center mb-8 space-y-2 lg:hidden">
          <div className="inline-flex h-10 w-10 rounded-xl bg-[#173f52] items-center justify-center text-[#8ed0c5] mb-1"><Layers3 className="h-5 w-5" strokeWidth={1.8} /></div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#182b39]">ScopeAI</h1>
          <p className="text-sm text-[#526270]">Project scoping &amp; milestone estimates</p>
        </div>

        <div className="mb-7 hidden lg:block">
          <p className="text-sm text-[#126b67] font-medium">Welcome back</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#182b39]">{isRegister ? 'Create your account' : 'Sign in to ScopeAI'}</h2>
          <p className="mt-2 text-sm text-[#526270]">Continue to your project estimates and reviews.</p>
        </div>

        <div className="rounded-2xl border border-[#d5deda] bg-[#ffffff] p-6 sm:p-7 space-y-5 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between pb-3 border-b border-[#d5deda]">
            <h2 className="text-sm font-semibold text-[#182b39]">
              {isRegister ? 'Create account' : 'Sign in'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-[#126b67] hover:text-[#126b67] font-medium transition-colors"
            >
              {isRegister ? 'Have an account? Sign in' : 'New here? Register'}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-100 border border-rose-300 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-900" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-[#304756] mb-1">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tanvir Hasan"
                  className="w-full px-3.5 py-3 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-sm focus:outline-none focus:border-[#168780]/60 transition-colors placeholder:text-[#65717a]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#304756] mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanvir@scopeai.dev"
                className="w-full px-3.5 py-3 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-sm focus:outline-none focus:border-[#168780]/60 transition-colors placeholder:text-[#65717a]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#304756] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-sm focus:outline-none focus:border-[#168780]/60 transition-colors placeholder:text-[#65717a]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-sm bg-[#173f52] hover:bg-[#102f3e] text-white shadow-sm shadow-emerald-800/15 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isRegister ? 'Register & continue' : 'Sign in'}</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-[#d5deda]">
            <span className="block text-xs text-[#65717a] mb-2 text-center font-sans">
              Quick demo access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ESTIMATOR')}
                className="py-2.5 px-2 rounded-lg bg-[#f7f7f4] hover:bg-[#e3ebe8] border border-[#d5deda] text-[#263d4a] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {demoLoading === 'ESTIMATOR' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-900" />
                )}
                <span>As Estimator</span>
              </button>

              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ADMIN')}
                className="py-2.5 px-2 rounded-lg bg-[#f7f7f4] hover:bg-[#e3ebe8] border border-[#d5deda] text-[#263d4a] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {demoLoading === 'ADMIN' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-rose-900" />
                )}
                <span>As Admin</span>
              </button>
            </div>
            <p className="text-xs text-[#65717a] text-center mt-2">
              Tanvir Hasan (Estimator) • Farhan Ahmed (Admin)
            </p>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-[#65717a]">Secure access for project estimators and reviewers</p>
        </div>
      </div>
    </div>
  );
}
