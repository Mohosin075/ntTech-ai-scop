'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, ClipboardList, House, Layers3, LogOut, Menu, UserRound, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const profileIsActive = pathname === '/profile';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[#d5deda] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-3.5 sm:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label="ScopeAI dashboard">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#173f52] text-[#a4ddd2] shadow-sm shadow-[#173f52]/20">
            <Layers3 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold leading-5 tracking-tight text-[#182b39]">ScopeAI</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[#65717a] sm:block">Project studio</span>
          </div>
        </Link>

        {user ? (
          <>
          <div className="hidden min-w-0 items-center gap-1.5 md:flex md:gap-2">
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
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/profile"
              aria-label={`Profile: ${user.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173f52] text-xs font-bold text-white ring-2 ring-[#e5efec]"
            >
              {user.name.trim().charAt(0).toUpperCase() || <UserRound className="h-3.5 w-3.5" />}
            </Link>
            <button
              type="button"
              aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d5deda] bg-white text-[#304756] transition hover:bg-[#f2f5f3]"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
          </>
        ) : (
          <Link href="/login" className="rounded-xl bg-[#173f52] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#102f3e]">
            Sign in
          </Link>
        )}
      </div>
    </header>
    {user && mobileNavOpen && (
      <div className="fixed inset-0 z-[60] md:hidden">
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
          className="absolute inset-0 h-full w-full bg-[#102a35]/40 backdrop-blur-[2px]"
        />
        <aside id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Main navigation" className="absolute inset-y-0 left-0 z-10 flex w-[min(86vw,340px)] flex-col border-r border-[#d5deda] bg-white p-5 shadow-2xl shadow-[#102a35]/20">
          <div className="flex items-center justify-between border-b border-[#e5ebe8] pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#173f52] text-[#a4ddd2]"><Layers3 className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="font-bold tracking-tight text-[#182b39]">ScopeAI</p>
                <p className="truncate text-xs text-[#65717a]">Project studio</p>
              </div>
            </div>
            <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#65717a] hover:bg-[#edf2ef] hover:text-[#173f52]"><X className="h-5 w-5" /></button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#dce6e1] bg-[#fbfcfa] p-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5f0ec] text-base font-bold text-[#173f52]">{user.name.trim().charAt(0).toUpperCase() || <UserRound className="h-4 w-4" />}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#203746]">{user.name}</span>
              <span className="mt-0.5 block text-xs text-[#65717a]">{user.role === 'ADMIN' ? 'Administrator' : 'Estimator'}</span>
            </span>
          </div>

          <nav aria-label="Main" className="mt-6 space-y-1.5">
            <MobileNavLink href="/dashboard" label="Home" active={pathname === '/dashboard'} icon={<House className="h-5 w-5" />} onClick={() => setMobileNavOpen(false)} />
            <MobileNavLink href="/estimates" label="Estimates" active={pathname === '/estimates'} icon={<ClipboardList className="h-5 w-5" />} onClick={() => setMobileNavOpen(false)} />
            <MobileNavLink href="/analysis" label="Analysis" active={pathname === '/analysis'} icon={<BarChart3 className="h-5 w-5" />} onClick={() => setMobileNavOpen(false)} />
            <MobileNavLink href="/profile" label="Profile" active={profileIsActive} icon={<UserRound className="h-5 w-5" />} onClick={() => setMobileNavOpen(false)} />
          </nav>

          <div className="mt-auto border-t border-[#e5ebe8] pt-4">
            <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#9f403a] transition hover:bg-[#fff1ef]">
              <LogOut className="h-5 w-5" />Sign out
            </button>
          </div>
        </aside>
      </div>
    )}
    </>
  );
};

function MobileNavLink({ href, label, active, icon, onClick }: { href: string; label: string; active: boolean; icon: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
        active ? 'bg-[#e6f1ee] text-[#126b67]' : 'text-[#405361] hover:bg-[#edf2ef] hover:text-[#173f52]'
      }`}
    >
      {icon}{label}
    </Link>
  );
}

export default Navbar;
