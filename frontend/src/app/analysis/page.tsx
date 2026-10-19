'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Loader2,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';

const STATUS_META: Record<ProjectStatus, { label: string; color: string; soft: string }> = {
  AI_ESTIMATED: { label: 'Draft', color: '#5470b8', soft: '#e7edff' },
  UNDER_REVIEW: { label: 'In review', color: '#bd7715', soft: '#fff2d8' },
  APPROVED: { label: 'Approved', color: '#25826b', soft: '#e4f3ed' },
  REJECTED: { label: 'Changes requested', color: '#ba5a53', soft: '#fbe9e6' },
};

const money = (value: number) => `$${Math.round(value).toLocaleString()}`;

export default function AnalysisPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<{ year: number; month: number } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetchApi<Project[]>('/projects');
        if (!cancelled && response.success) setProjects(response.data || []);
        if (!cancelled) {
          const today = new Date();
          setCalendarAnchor({ year: today.getFullYear(), month: today.getMonth() });
        }
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Could not load project analysis.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const analytics = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status !== 'REJECTED');
    const totalValue = activeProjects.reduce((sum, project) => sum + (project.finalTotalCost || 0), 0);
    const totalEffort = activeProjects.reduce((sum, project) => sum + (project.totalHours || 0), 0);
    const counts = (Object.keys(STATUS_META) as ProjectStatus[]).map((status) => ({
      status,
      ...STATUS_META[status],
      count: projects.filter((project) => project.status === status).length,
    }));

    const statusHours = counts.map((item) => ({
      ...item,
      hours: projects.filter((project) => project.status === item.status)
        .reduce((sum, project) => sum + (project.totalHours || 0), 0),
    }));

    const months = calendarAnchor ? Array.from({ length: 6 }, (_, index) => {
      const date = new Date(calendarAnchor.year, calendarAnchor.month - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
        count: projects.filter((project) => {
          const created = new Date(project.createdAt);
          return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
        }).length,
      };
    }) : [];

    const slices = counts.filter((item) => item.count > 0);
    let accumulated = 0;
    const gradient = slices.length === 0
      ? 'conic-gradient(#e7edeb 0deg 360deg)'
      : `conic-gradient(${slices.map((item) => {
          const start = accumulated;
          accumulated += (item.count / projects.length) * 360;
          return `${item.color} ${start}deg ${accumulated}deg`;
        }).join(', ')})`;

    return {
      activeProjects,
      totalValue,
      totalEffort,
      averageFee: activeProjects.length ? totalValue / activeProjects.length : 0,
      pendingReviews: projects.filter((project) => project.status === 'UNDER_REVIEW').length,
      counts,
      statusHours,
      months,
      statusGradient: gradient,
      maxMonthCount: Math.max(1, ...months.map((month) => month.count)),
      recent: [...activeProjects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    };
  }, [projects, calendarAnchor]);

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-[#65717a]"><Loader2 className="mr-2 h-5 w-5 animate-spin text-[#126b67]" />Loading analysis…</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#182b39]">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-5 sm:space-y-7 px-3.5 sm:px-6 py-5 sm:py-8 sm:py-10">
        <header className="flex flex-col gap-3.5 sm:gap-4 border-b border-[#d5deda] pb-4 sm:pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs sm:text-sm font-semibold text-[#126b67]">{user.role === 'ADMIN' ? 'Team workspace' : 'Your workspace'}</p>
            <h1 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight">Project analysis</h1>
            <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-base leading-5 sm:leading-6 text-[#526270]">
              A clear view of project value, delivery effort, review progress, and recent activity.
            </p>
          </div>
          <Link href="/estimates" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#d5deda] bg-white px-4 py-2.5 text-sm font-semibold text-[#173f52] transition hover:border-[#b8d0c8] hover:bg-[#f4f8f6]">
            Browse estimates <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        {loadError && <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 sm:p-4 text-xs sm:text-sm text-rose-900"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{loadError}</div>}

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white text-sm text-[#65717a]"><Loader2 className="h-6 w-6 animate-spin text-[#126b67]" />Preparing your analysis…</div>
        ) : projects.length === 0 ? (
          <section className="rounded-2xl sm:rounded-3xl border border-dashed border-[#cbd8d2] bg-white px-4 py-12 sm:px-6 sm:py-16 text-center">
            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#e7f2ef] text-[#126b67]"><BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" /></div>
            <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-semibold">Your analysis starts with a project</h2>
            <p className="mx-auto mt-1.5 sm:mt-2 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-[#65717a]">Create your first estimate to see project value, review status, effort distribution, and activity here.</p>
            <Link href="/dashboard" className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173f52] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#102f3e]">Create project <ArrowRight className="h-4 w-4" /></Link>
          </section>
        ) : (
          <>
            <section aria-label="Project summary" className="grid grid-cols-2 gap-2 sm:gap-3 max-[359px]:grid-cols-1 xl:grid-cols-4">
              <MetricCard icon={<DollarSign className="h-4 w-4" />} label="Active project value" value={money(analytics.totalValue)} detail="Excludes projects returned for changes" accent="teal" />
              <MetricCard icon={<BriefcaseBusiness className="h-4 w-4" />} label="Active projects" value={analytics.activeProjects.length.toLocaleString()} detail={`${projects.length} total estimates`} />
              <MetricCard icon={<Clock3 className="h-4 w-4" />} label="Planned effort" value={`${analytics.totalEffort.toLocaleString()} hrs`} detail="Included features across active work" />
              <MetricCard icon={<Activity className="h-4 w-4" />} label="Pending review" value={analytics.pendingReviews.toLocaleString()} detail="Submitted and awaiting administrator" accent="amber" />
            </section>

            <section className="grid gap-4 sm:gap-5 lg:grid-cols-2">
              <article className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-3.5 sm:p-6 shadow-sm shadow-[#173f52]/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-lg font-semibold">Estimate status</h2><p className="mt-1 text-sm text-[#65717a]">Where each project sits in the review flow</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4f2] text-[#126b67]"><PieChart className="h-5 w-5" /></span>
                </div>
                <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row sm:justify-center">
                  <div className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full" style={{ background: analytics.statusGradient }} role="img" aria-label="Estimate status distribution chart">
                    <div className="flex h-[118px] w-[118px] flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-3xl font-semibold tracking-tight">{projects.length}</span>
                      <span className="text-xs text-[#65717a]">estimates</span>
                    </div>
                  </div>
                  <div className="w-full space-y-3">
                    {analytics.counts.map((item) => (
                      <div key={item.status} className="flex items-center justify-between gap-4 text-sm">
                        <span className="flex items-center gap-2 text-[#526270]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
                        <span className="font-semibold tabular-nums text-[#203746]">{item.count}<span className="ml-2 w-8 text-right font-normal text-[#829098]">{projects.length ? Math.round((item.count / projects.length) * 100) : 0}%</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-3.5 sm:p-6 shadow-sm shadow-[#173f52]/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-base sm:text-lg font-semibold">Estimate activity</h2><p className="mt-1 text-xs sm:text-sm text-[#65717a]">New estimates created over the last six months</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf1ff] text-[#4d6db5]"><TrendingUp className="h-5 w-5" /></span>
                </div>
                <div className="mt-7 flex h-48 items-end gap-3 border-b border-[#e5ebe8] px-1 sm:gap-5">
                  {analytics.months.map((month) => {
                    const height = month.count ? Math.max(10, (month.count / analytics.maxMonthCount) * 100) : 3;
                    return (
                      <div key={month.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-xs font-semibold tabular-nums text-[#526270]">{month.count || ''}</span>
                        <div className="flex h-[72%] w-full items-end">
                          <div className={`w-full rounded-t-lg transition-all ${month.count ? 'bg-[#3e857d]' : 'bg-[#edf1ef]'}`} style={{ height: `${height}%` }} title={`${month.count} estimates in ${month.label}`} />
                        </div>
                        <span className="pb-2 text-xs text-[#65717a]">{month.label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs text-[#7b898f]"><CalendarDays className="h-3.5 w-3.5" />Based on estimate creation date</p>
              </article>
            </section>

            <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-3.5 sm:p-6 shadow-sm shadow-[#173f52]/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-base sm:text-lg font-semibold">Effort by status</h2><p className="mt-1 text-xs sm:text-sm text-[#65717a]">Planned engineering hours across estimates</p></div>
                  <BarChart3 className="mt-1 h-5 w-5 text-[#126b67]" />
                </div>
                <div className="mt-6 space-y-4">
                  {analytics.statusHours.map((item) => (
                    <div key={item.status}>
                      <div className="mb-1.5 flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-[#405361]">{item.label}</span>
                        <span className="tabular-nums text-[#65717a]">{item.hours.toLocaleString()} hrs</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#edf1ef]">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(item.hours / Math.max(1, analytics.totalEffort)) * 100}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-3.5 sm:p-6 shadow-sm shadow-[#173f52]/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-base sm:text-lg font-semibold">Portfolio snapshot</h2><p className="mt-1 text-xs sm:text-sm text-[#65717a]">Current planning overview</p></div>
                  <CheckCircle2 className="mt-1 h-5 w-5 text-[#25826b]" />
                </div>
                <dl className="mt-4 sm:mt-5 divide-y divide-[#e8eeeb]">
                  <SnapshotRow label="Average active project fee" value={money(analytics.averageFee)} />
                  <SnapshotRow label="Approved projects" value={String(analytics.counts.find((item) => item.status === 'APPROVED')?.count || 0)} />
                  <SnapshotRow label="Draft estimates" value={String(analytics.counts.find((item) => item.status === 'AI_ESTIMATED')?.count || 0)} />
                  <SnapshotRow label="Returned for changes" value={String(analytics.counts.find((item) => item.status === 'REJECTED')?.count || 0)} />
                </dl>
                <p className="mt-4 rounded-xl bg-[#f6f8f6] px-3.5 py-3 text-xs leading-5 text-[#65717a]">Project fees reflect the estimates currently saved in your workspace. Update a quote in its project workspace to keep this view current.</p>
              </article>
            </section>

            <section className="rounded-2xl sm:rounded-3xl border border-[#d5deda] bg-white p-3.5 sm:p-6 shadow-sm shadow-[#173f52]/[0.04]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div><h2 className="text-base sm:text-lg font-semibold">Recently updated projects</h2><p className="mt-1 text-xs sm:text-sm text-[#65717a]">The latest active estimates in your workspace</p></div>
                <Link href="/estimates" className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#126b67] hover:text-[#0e5753]">All estimates <ArrowRight className="h-4 w-4" /></Link>
              </div>
              {analytics.recent.length ? (
                <div className="mt-4 divide-y divide-[#e8eeeb]">
                  {analytics.recent.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} className="group flex flex-col gap-2.5 py-3 sm:py-4 transition first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#263d4a] text-sm group-hover:text-[#126b67]">{project.title}</p>
                        <p className="mt-0.5 text-xs text-[#7b898f]">Updated {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(project.updatedAt))}</p>
                      </div>
                      <div className="flex shrink-0 items-center justify-between sm:justify-end gap-3 sm:gap-6">
                        <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: STATUS_META[project.status].soft, color: STATUS_META[project.status].color }}>{STATUS_META[project.status].label}</span>
                        <span className="text-right text-xs sm:text-sm font-semibold tabular-nums text-[#263d4a]">{money(project.finalTotalCost)}</span>
                        <ArrowRight className="h-4 w-4 text-[#9aa6a3] transition group-hover:translate-x-0.5 group-hover:text-[#126b67]" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="py-8 text-center text-sm text-[#65717a]">No active projects to show.</p>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, detail, accent = 'default' }: { icon: React.ReactNode; label: string; value: string; detail: string; accent?: 'default' | 'teal' | 'amber' }) {
  const iconTone = accent === 'teal' ? 'bg-[#e7f2ef] text-[#126b67]' : accent === 'amber' ? 'bg-[#fff2d8] text-[#a7610a]' : 'bg-[#edf1ff] text-[#4d6db5]';
  return (
    <article className="min-w-0 rounded-2xl border border-[#d5deda] bg-white p-3.5 shadow-sm shadow-[#173f52]/[0.04] sm:p-5">
      <div className="flex min-w-0 items-center gap-2"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconTone}`}>{icon}</span><p className="min-w-0 text-xs font-medium leading-4 text-[#65717a] sm:text-sm">{label}</p></div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-[#182b39] sm:mt-4 sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-xs leading-4 text-[#7b898f]">{detail}</p>
    </article>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 py-3.5 text-sm"><dt className="text-[#65717a]">{label}</dt><dd className="font-semibold tabular-nums text-[#263d4a]">{value}</dd></div>;
}
