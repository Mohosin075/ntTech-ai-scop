'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList, Filter, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Project } from '@/types';
import Navbar from '@/components/common/Navbar';
import ProjectCard from '@/components/common/ProjectCard';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'AI_ESTIMATED', label: 'Draft' },
  { value: 'UNDER_REVIEW', label: 'In review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Changes requested' },
];

export default function EstimatesClient({ initialStatus }: { initialStatus?: string }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(
    STATUS_OPTIONS.some((option) => option.value === initialStatus) ? initialStatus! : 'ALL'
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    const loadProjects = async () => {
      try {
        setLoadError(null);
        const res = await fetchApi<Project[]>('/projects');
        if (!isCancelled && res.success) setProjects(res.data || []);
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not load estimates.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadProjects();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  const statusCounts = useMemo(() => ({
    ALL: projects.length,
    AI_ESTIMATED: projects.filter((project) => project.status === 'AI_ESTIMATED').length,
    UNDER_REVIEW: projects.filter((project) => project.status === 'UNDER_REVIEW').length,
    APPROVED: projects.filter((project) => project.status === 'APPROVED').length,
    REJECTED: projects.filter((project) => project.status === 'REJECTED').length,
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
      const matchesSearch = !query || [project.title, project.executiveSummary, project.rawRequirement, project.createdBy?.name]
        .some((value) => value?.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [projects, search, statusFilter]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f4] text-[#526270]">
        <Loader2 className="h-6 w-6 animate-spin text-[#126b67]" />
      </div>
    );
  }

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    router.replace('/estimates');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f7f4] text-[#182b39]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-7 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-5 border-b border-[#d5deda] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#526270] transition hover:text-[#126b67]">
              <span aria-hidden="true">←</span> Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6f1ee] text-[#126b67]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#126b67]">{user.role === 'ADMIN' ? 'Team workspace' : 'Your workspace'}</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[#182b39] sm:text-4xl">Estimates</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-6 text-[#526270]">
              {user.role === 'ADMIN'
                ? 'Browse team project quotes, check their status, and review submitted scopes.'
                : 'Find your project quotes and follow each scope from draft through review.'}
            </p>
          </div>
          <Link href="/dashboard" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#173f52] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102f3e]">
            New project quote <span aria-hidden="true">+</span>
          </Link>
        </header>

        <section aria-label="Estimate list and filters" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#d5deda] bg-white p-4 shadow-sm shadow-[#173f52]/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-sm text-[#65717a]" aria-live="polite">
              Showing <span className="font-semibold text-[#182b39]">{filteredProjects.length}</span> of{' '}
              <span className="font-semibold text-[#182b39]">{projects.length}</span> estimates
            </p>
            <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:min-w-[34rem] sm:grid-cols-2">
              <label className="relative block min-w-0">
                <span className="sr-only">Search estimates</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65717a]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by project or scope..."
                  className="w-full rounded-lg border border-[#d5deda] bg-[#fbfcfb] py-2.5 pl-9 pr-3 text-sm text-[#182b39] outline-none transition placeholder:text-[#8a959c] focus:border-[#168780] focus:ring-2 focus:ring-[#168780]/10"
                />
              </label>
              <label className="relative block min-w-0">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65717a]" />
                <span className="sr-only">Filter by status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setStatusFilter(nextStatus);
                    router.replace(nextStatus === 'ALL' ? '/estimates' : `/estimates?status=${nextStatus}`, { scroll: false });
                  }}
                  className="w-full appearance-none rounded-lg border border-[#d5deda] bg-[#fbfcfb] py-2.5 pl-9 pr-3 text-sm text-[#263d4a] outline-none transition focus:border-[#168780] focus:ring-2 focus:ring-[#168780]/10"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({statusCounts[option.value as keyof typeof statusCounts]})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-[#d5deda] bg-white text-sm text-[#65717a]">
              <Loader2 className="h-6 w-6 animate-spin text-[#126b67]" /> Loading estimates...
            </div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">{loadError}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd8d2] bg-white px-6 py-14 text-center">
              <p className="text-lg font-semibold text-[#182b39]">
                {projects.length === 0 ? 'No estimates yet' : 'No matching estimates'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#65717a]">
                {projects.length === 0
                  ? user.role === 'ADMIN' ? 'Team project quotes will appear here as estimates are created.' : 'Create a project quote from a brief to see it here.'
                  : 'Try another search or status, or clear your filters to see the full list.'}
              </p>
              {projects.length === 0 ? (
                <Link href="/dashboard" className="mt-5 inline-flex rounded-lg bg-[#173f52] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102f3e]">Create a project quote</Link>
              ) : (
                <button type="button" onClick={clearFilters} className="mt-5 rounded-lg border border-[#d5deda] bg-white px-4 py-2.5 text-sm font-semibold text-[#173f52] transition hover:bg-[#f5f8f6]">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} showCreator={user.role === 'ADMIN'} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
