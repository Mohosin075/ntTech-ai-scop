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
    <main className="min-h-screen flex justify-center items-center px-3 py-0 sm:px-8 sm:py-6 bg-[#f7f7f4]">
      <section className="w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] rounded-[28px] overflow-hidden border border-[#d5deda] bg-white shadow-2xl shadow-[#173f52]/10 lg:min-h-[min(700px,calc(100svh-3rem))]">
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 sm:p-12 bg-[#173f52] text-white">
          <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center text-[#9bd8cd]"><Layers3 className="h-5 w-5" strokeWidth={1.8} /></div>
              <div><span className="block text-lg font-bold tracking-tight text-white">ScopeAI</span><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Project studio</span></div>
            </div>
            <div className="mt-24 max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9bd8cd]">From brief to delivery plan</p>
              <h1 className="mt-5 text-4xl xl:text-5xl font-semibold leading-[1.12] tracking-tight text-white">Make every<br />project estimate<br /><span className="text-[#9bd8cd]">clear and confident.</span></h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/75">Turn a project brief into an editable scope, realistic effort estimate, and milestone plan.</p>
            </div>
          </div>
        </aside>
        <div className="w-full max-w-xl mx-auto flex flex-col justify-center px-4 py-3 sm:px-10 sm:py-6 lg:px-14">
          <div className="mb-2 flex items-center gap-3 lg:hidden">
          <div className="inline-flex h-10 w-10 rounded-xl bg-[#173f52] items-center justify-center text-[#8ed0c5] mb-1"><Layers3 className="h-5 w-5" strokeWidth={1.8} /></div>
          <div className="text-left"><h1 className="text-lg font-bold leading-5 tracking-tight text-[#182b39]">ScopeAI</h1><p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65717a]">Project studio</p></div>
        </div>

        <div className="mb-2 sm:mb-4">
          <p className="text-sm font-semibold text-[#126b67]">{isRegister ? 'Get started' : 'Welcome back'}</p>
          <h2 className="mt-1 sm:mt-2 text-3xl font-semibold tracking-tight text-[#182b39]">{isRegister ? 'Create your account' : 'Sign in to ScopeAI'}</h2>
          <p className="mt-1 sm:mt-2 text-base text-[#526270]">{isRegister ? 'Set up your workspace access in a moment.' : 'Your project scopes and reviews are waiting.'}</p>
        </div>

        <div className="mb-2 sm:mb-4 grid grid-cols-2 rounded-xl bg-[#f2f5f3] p-1">
          <button type="button" onClick={() => { setIsRegister(false); setError(null); }} aria-pressed={!isRegister} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${!isRegister ? 'bg-white text-[#173f52] shadow-sm' : 'text-[#65717a] hover:text-[#304756]'}`}>Sign in</button>
          <button type="button" onClick={() => { setIsRegister(true); setError(null); }} aria-pressed={isRegister} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isRegister ? 'bg-white text-[#173f52] shadow-sm' : 'text-[#65717a] hover:text-[#304756]'}`}>Create account</button>
        </div>

        <div className="rounded-2xl border border-[#e2e8e4] bg-white p-3 sm:p-4">

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-900">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            {isRegister && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-semibold text-[#304756] mb-1">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-[#d5deda] bg-[#fbfcfb] px-4 py-2.5 sm:py-3 text-base text-[#182b39] transition-colors placeholder:text-[#8a959c] focus:border-[#168780] focus:outline-none focus:ring-4 focus:ring-[#168780]/10"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-[#304756] mb-1">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-[#d5deda] bg-[#fbfcfb] px-4 py-2.5 sm:py-3 text-base text-[#182b39] transition-colors placeholder:text-[#8a959c] focus:border-[#168780] focus:outline-none focus:ring-4 focus:ring-[#168780]/10"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-[#304756] mb-1">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-[#d5deda] bg-[#fbfcfb] px-4 py-2.5 sm:py-3 text-base text-[#182b39] transition-colors placeholder:text-[#8a959c] focus:border-[#168780] focus:outline-none focus:ring-4 focus:ring-[#168780]/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-base bg-[#173f52] hover:bg-[#102f3e] text-white shadow-md shadow-[#173f52]/15 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isRegister ? 'Create account' : 'Sign in'}</span>
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 sm:pt-3 border-t border-[#d5deda]">
            <span className="block text-xs font-medium text-[#65717a] mb-2 text-center font-sans">
              Or explore a demo workspace
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ESTIMATOR')}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-white hover:bg-[#f7f9f8] border border-[#d5deda] hover:border-[#a9c1bb] text-[#263d4a] text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {demoLoading === 'ESTIMATOR' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 text-[#126b67]" />
                )}
                <span>Estimator</span>
              </button>

              <button
                type="button"
                disabled={demoLoading !== null}
                onClick={() => handleDemo('ADMIN')}
                className="py-2.5 sm:py-3 px-2 rounded-xl bg-white hover:bg-[#f7f9f8] border border-[#d5deda] hover:border-[#a9c1bb] text-[#263d4a] text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {demoLoading === 'ADMIN' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 text-[#526270]" />
                )}
                <span>Admin</span>
              </button>
            </div>
            <p className="text-xs text-[#8a959c] text-center mt-2">Demo accounts only — changes are saved to the demo workspace.</p>
          </div>
        </div>
        </div>
      </section>
    </main>
  );
}
