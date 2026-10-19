'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  ClipboardList,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#65717a]">Loading your profile…</div>;
  }

  const roleName = isAdmin ? 'Administrator' : 'Estimator';
  const responsibilities = isAdmin
    ? ['Review estimates submitted by the team', 'Approve proposals or return them with feedback', 'Track project value and delivery scope']
    : ['Turn project briefs into clear scopes and estimates', 'Refine features, effort, and project fees', 'Submit completed estimates for administrator review'];

  return (
    <div className="min-h-screen bg-[#f7f7f4]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-3.5 sm:px-6 py-5 sm:py-8 sm:py-12">
        <div className="mb-5 sm:mb-8">
          <p className="text-xs sm:text-sm font-semibold text-[#126b67]">Account</p>
          <h1 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-[#182b39]">Your profile</h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[#526270]">Your account details and workspace responsibilities.</p>
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="overflow-hidden rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white shadow-sm shadow-[#173f52]/5">
            <div className="relative overflow-hidden bg-[#173f52] px-4 py-5 sm:px-8 sm:py-9 text-white">
              <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-16 h-44 w-44 rounded-full border border-white/10" />
              <div className="relative flex flex-wrap items-center gap-3.5 sm:gap-5">
                <div className="flex h-14 w-14 sm:h-[76px] sm:w-[76px] items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-xl sm:text-3xl font-semibold text-[#b6e4dc] ring-1 ring-white/20">
                  {user.name.trim().charAt(0).toUpperCase() || <UserRound className="h-6 w-6 sm:h-8 sm:w-8" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-[#b6e4dc]">ScopeAI account</p>
                  <h2 className="mt-0.5 sm:mt-1 truncate text-xl sm:text-3xl font-semibold tracking-tight">{user.name}</h2>
                  <div className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium ring-1 ring-white/15">
                    {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#b6e4dc]" /> : <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#b6e4dc]" />}
                    {roleName}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <h3 className="text-base sm:text-lg font-semibold text-[#182b39]">Account details</h3>
              <div className="mt-3 sm:mt-4 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-[#e5ebe8] bg-[#fafbf9] p-3 sm:p-4">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#e7f2ef] text-[#126b67]"><Mail className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#65717a]">Email address</p>
                  <p className="truncate text-xs sm:text-sm font-semibold text-[#263d4a]">{user.email}</p>
                </div>
                <BadgeCheck className="ml-auto h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#24816d]" aria-label="Signed in" />
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-[#e5ebe8] bg-[#fafbf9] p-3 sm:p-4">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-[#edf1ff] text-[#4d5aa2]"><BriefcaseBusiness className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-medium text-[#65717a]">Workspace access</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#263d4a]">{isAdmin ? 'Team workspace' : 'Estimator workspace'}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-4 sm:space-y-5">
            <section className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-4 shadow-sm shadow-[#173f52]/5 sm:p-7">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-[#e7f2ef] text-[#126b67]">
                  {isAdmin ? <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" /> : <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5" />}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#65717a]">Your role</p>
                  <h3 className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-semibold text-[#182b39]">{roleName}</h3>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-[#526270]">
                    {isAdmin ? 'You help the team deliver clear, reviewed project proposals.' : 'You prepare project scopes and send estimates for review.'}
                  </p>
                </div>
              </div>
              <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 border-t border-[#e5ebe8] pt-4 sm:pt-5">
                {responsibilities.map((item) => (
                  <li key={item} className="flex gap-2.5 text-xs sm:text-sm leading-5 text-[#405361]">
                    <span className="mt-1.5 sm:mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#24816d]" />{item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-4 shadow-sm shadow-[#173f52]/5 sm:p-7">
              <h3 className="text-base sm:text-lg font-semibold text-[#182b39]">Quick access</h3>
              <div className="mt-3 sm:mt-4 space-y-2">
                <Link href="/dashboard" className="group flex items-center justify-between rounded-xl border border-[#e5ebe8] px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-[#304756] transition hover:border-[#b8d7d0] hover:bg-[#f6faf8]">
                  Dashboard <ArrowRight className="h-4 w-4 text-[#65717a] transition group-hover:translate-x-0.5 group-hover:text-[#126b67]" />
                </Link>
                <Link href="/estimates" className="group flex items-center justify-between rounded-xl border border-[#e5ebe8] px-4 py-3 text-sm font-semibold text-[#304756] transition hover:border-[#b8d7d0] hover:bg-[#f6faf8]">
                  <span className="inline-flex items-center gap-2"><ClipboardList className="h-4 w-4 text-[#126b67]" />Estimates</span>
                  <ArrowRight className="h-4 w-4 text-[#65717a] transition group-hover:translate-x-0.5 group-hover:text-[#126b67]" />
                </Link>
                <button onClick={logout} className="flex w-full items-center justify-between rounded-xl border border-[#f0d6d4] px-4 py-3 text-sm font-semibold text-[#9f403a] transition hover:bg-[#fff7f6]">
                  <span className="inline-flex items-center gap-2"><LogOut className="h-4 w-4" />Sign out</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
