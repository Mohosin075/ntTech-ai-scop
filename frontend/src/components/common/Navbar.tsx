'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, ClipboardList, House, Layers3, LogOut, UserRound } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const profileIsActive = pathname === '/profile';

  return (
    <header className="sticky top-0 z-50 border-b border-[#d5deda] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3" aria-label="ScopeAI dashboard">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173f52] text-[#a4ddd2] shadow-sm shadow-[#173f52]/20">
            <Layers3 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-5 tracking-tight text-[#182b39]">ScopeAI</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65717a] sm:block">Project studio</span>
          </div>
        </Link>

        {user ? (
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/dashboard"
              aria-label="Home"
              aria-current={pathname === '/dashboard' ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3 ${
                pathname === '/dashboard'
                  ? 'bg-[#e6f1ee] text-[#126b67]'
                  : 'text-[#526270] hover:bg-[#f2f5f3] hover:text-[#173f52]'
              }`}
            >
              <House className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              href="/estimates"
              aria-label="Estimates"
              aria-current={pathname === '/estimates' ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3 ${
                pathname === '/estimates'
                  ? 'bg-[#e6f1ee] text-[#126b67]'
                  : 'text-[#526270] hover:bg-[#f2f5f3] hover:text-[#173f52]'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Estimates</span>
            </Link>
            <Link
              href="/analysis"
              aria-current={pathname === '/analysis' ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3 ${
                pathname === '/analysis'
                  ? 'bg-[#e6f1ee] text-[#126b67]'
                  : 'text-[#526270] hover:bg-[#f2f5f3] hover:text-[#173f52]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analysis</span>
            </Link>

            <Link
              href="/profile"
              aria-current={profileIsActive ? 'page' : undefined}
              className={`group flex min-w-0 items-center gap-2 rounded-xl border px-2 py-1.5 transition-all sm:gap-2.5 sm:px-2.5 ${
                profileIsActive
                  ? 'border-[#b8d7d0] bg-[#edf6f3] shadow-sm shadow-[#173f52]/5'
                  : 'border-transparent bg-white hover:border-[#d5deda] hover:bg-[#f8faf9]'
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#173f52] text-sm font-bold text-white ring-2 ring-[#e5efec]">
                {user.name.trim().charAt(0).toUpperCase() || <UserRound className="h-4 w-4" />}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-36 truncate text-sm font-semibold leading-5 text-[#203746]">{user.name}</span>
                <span className="block text-[11px] leading-4 text-[#65717a]">{user.role === 'ADMIN' ? 'Administrator' : 'Estimator'}</span>
              </span>
              <span className={`hidden rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide sm:inline-flex ${
                user.role === 'ADMIN' ? 'bg-[#edf1ff] text-[#4253a4]' : 'bg-[#e7f5f0] text-[#176c56]'
              }`}>
                {user.role === 'ADMIN' ? 'Admin' : 'Estimator'}
              </span>
            </Link>

            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d5deda] text-[#526270] transition hover:border-[#c7d4d0] hover:bg-[#f2f5f3] hover:text-[#173f52]"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="rounded-xl bg-[#173f52] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#102f3e]">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
