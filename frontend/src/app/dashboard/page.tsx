'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
import { Project } from '@/types';
import Navbar from '@/components/common/Navbar';
import ProjectCard from '@/components/common/ProjectCard';
import {
  Filter,
  Loader2,
  AlertCircle,
  Search,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    label: 'Courier settlements',
    text: 'A real-time logistics module for managing cash-on-delivery (COD) collection, automated rider payout balancing, delivery OTP confirmation, and merchant reconciliation ledgers.',
  },
  {
    label: 'Warehouse inventory',
    text: 'Enterprise grocery fulfillment module for multi-hub warehouse inventory tracking, barcode scanner verification, perishable batch expiration alerts, and order picking routes.',
  },
  {
    label: 'Merchant payments',
    text: 'High-availability payment orchestration engine with bKash and Nagad webhook handlers, tokenized recurring subscriptions, automated dispute refunds, and daily ledger reports.',
  },
];

const DEFAULT_HOURLY_RATE = 25;

const createTitleFromBrief = (brief: string) => {
  const firstSentence = brief
    .trim()
    .split(/[.!?\n]/, 1)[0]
    .replace(/^(please\s+)?(build|create|design|develop|make|we need|i need|i want)\s+/i, '');
  const cleanedFirstSentence = formatProjectTitle(firstSentence)
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleanedFirstSentence.split(' ').filter(Boolean);
  const title = words.slice(0, 8).join(' ');
  if (title.length < 3) return 'Project estimate';
  return `${title.charAt(0).toUpperCase()}${title.slice(1)}${words.length > 8 ? '…' : ''}`;
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [rawRequirement, setRawRequirement] = useState('');
  const briefLength = rawRequirement.trim().length;
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchingProjects, setFetchingProjects] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    async function fetchProjectList() {
      try {
        const res = await fetchApi<Project[]>('/projects');
        if (!isCancelled && res.success && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        if (!isCancelled) {
          setFetchingProjects(false);
        }
      }
    }

    fetchProjectList();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status !== 'REJECTED');
    const totalPipeline = activeProjects.reduce((acc, project) => acc + (project.finalTotalCost || 0), 0);
    const totalDevHours = activeProjects.reduce((acc, project) => acc + (project.totalHours || 0), 0);
    const pendingReviews = projects.filter((project) => project.status === 'UNDER_REVIEW').length;
    const avgCost = activeProjects.length > 0 ? Math.round(totalPipeline / activeProjects.length) : 0;
    return {
      totalPipeline,
      totalDevHours,
      pendingReviews,
      avgCost,
    };
  }, [projects]);

  const statusCounts = useMemo(() => {
    return {
      ALL: projects.length,
      AI_ESTIMATED: projects.filter((p) => p.status === 'AI_ESTIMATED').length,
      UNDER_REVIEW: projects.filter((p) => p.status === 'UNDER_REVIEW').length,
      APPROVED: projects.filter((p) => p.status === 'APPROVED').length,
      REJECTED: projects.filter((p) => p.status === 'REJECTED').length,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.executiveSummary?.toLowerCase().includes(q)
      );
    });
  }, [projects, statusFilter, searchQuery]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);

    if (briefLength < 20) {
      const err = 'Please describe the project in at least 20 characters.';
      setGenError(err);
      toast.error(err);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetchApi<Project>('/projects/generate', {
        method: 'POST',
        body: JSON.stringify({
          title: createTitleFromBrief(rawRequirement),
          rawRequirement,
          hourlyRate: DEFAULT_HOURLY_RATE,
        }),
      });

      if (res.success && res.data) {
        toast.success('Scope calculation complete');
        router.push(`/projects/${res.data.id}`);
      } else {
        throw new Error(res.message || 'Could not generate a project estimate. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setGenError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const applySamplePrompt = (sample: (typeof SAMPLE_PROMPTS)[0]) => {
    setRawRequirement(sample.text);
    setGenError(null);
    toast.info(`Added example brief: ${sample.label}`);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f7f7f4] flex items-center justify-center text-[#526270]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#182b39] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#126b67]">Your workspace</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#182b39]">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="mt-2 text-base text-[#526270]">Plan, price, and review your projects.</p>
          </div>
          <div className="flex w-full items-start gap-3 rounded-2xl border border-[#d5deda] bg-white p-4 shadow-sm shadow-[#173f52]/[0.04] sm:w-[340px]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4f2] text-[#126b67]">
              {user.role === 'ADMIN' ? <ShieldCheck className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#65717a]">Your role</p>
              <p className="mt-0.5 text-base font-semibold text-[#182b39]">{user.role === 'ADMIN' ? 'Administrator' : 'Estimator'}</p>
              <p className="mt-1 text-sm leading-5 text-[#526270]">
                {user.role === 'ADMIN'
                  ? 'Review team estimates, approve them, or return them with feedback.'
                  : 'Create and refine estimates, then submit them for review.'}
              </p>
            </div>
          </div>
        </section>
        <section aria-label="Workspace overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 rounded-2xl border border-[#d5deda] bg-white p-5 shadow-sm shadow-[#173f52]/[0.04]">
            <p className="text-sm font-medium text-[#65717a]">Project value</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#126b67] sm:text-[2rem]">
              ${stats.totalPipeline.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[#65717a]">Across active projects</p>
          </div>

          <div className="min-w-0 rounded-2xl border border-[#d5deda] bg-white p-5 shadow-sm shadow-[#173f52]/[0.04]">
            <p className="text-sm font-medium text-[#65717a]">Estimated effort</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#182b39] sm:text-[2rem]">
              {stats.totalDevHours.toLocaleString()}<span className="ml-1 text-xl font-medium text-[#526270]">hrs</span>
            </p>
            <p className="mt-2 text-sm text-[#65717a]">For delivery planning</p>
          </div>

          <button
            type="button"
            aria-pressed={statusFilter === 'UNDER_REVIEW'}
            onClick={() => {
              setStatusFilter(statusFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW');
              document.getElementById('project-estimates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`group min-w-0 rounded-2xl border p-5 text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168780] focus-visible:ring-offset-2 ${
              statusFilter === 'UNDER_REVIEW'
                ? 'border-[#9bc9bf] bg-[#f2f8f6] shadow-[#173f52]/[0.06]'
                : 'border-[#e5dcc7] bg-[#fffdfa] hover:-translate-y-0.5 hover:border-[#d3bc8e] hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${stats.pendingReviews > 0 ? 'bg-amber-500' : 'bg-[#a8b4ae]'}`} />
              <span className="text-sm font-medium text-[#65717a]">Pending review</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#182b39] sm:text-[2rem]">
              {stats.pendingReviews}
            </p>
            <p className="mt-2 text-sm font-medium text-[#126b67] group-hover:text-[#0d5754]">
              View review queue <span aria-hidden="true">→</span>
            </p>
          </button>

          <div className="min-w-0 rounded-2xl border border-[#d5deda] bg-white p-5 shadow-sm shadow-[#173f52]/[0.04]">
            <p className="text-sm font-medium text-[#65717a]">Average project fee</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#182b39] sm:text-[2rem]">
              ${stats.avgCost.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-[#65717a]">Across active projects</p>
          </div>
        </section>

        {/* Project Scoping Generator Section */}
        <section className="rounded-2xl border border-[#d5deda] bg-[#ffffff]/95 p-5 sm:p-7 space-y-5 shadow-sm shadow-slate-900/5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#182b39]">Describe your project</h2>
            <p className="text-base text-[#526270] mt-1 font-sans">
              Turn your brief into a fixed project quote, scoped deliverables, and milestone plan. Effort stays as internal planning guidance.
            </p>
          </div>

          {genError && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-100 border border-rose-300 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-900" />
              <span>{genError}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="project-brief" className="block text-base font-semibold text-[#263d4a] font-sans">
                  Project brief <span className="text-rose-900">*</span>
                </label>
                <span
                  id="brief-help"
                  aria-live="polite"
                  className={`text-sm font-semibold ${briefLength >= 20 ? 'text-emerald-900' : 'text-[#526270]'}`}
                >
                  {briefLength >= 20 ? 'Ready to generate' : `${20 - briefLength} more characters needed`}
                </span>
              </div>
              <textarea
                required
                minLength={20}
                rows={3}
                id="project-brief"
                aria-describedby="brief-help"
                aria-invalid={briefLength > 0 && briefLength < 20}
                value={rawRequirement}
                onChange={(e) => setRawRequirement(e.target.value)}
                placeholder="What should this project deliver? Include key features, users, integrations, and constraints."
                className="w-full px-4 py-4 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-lg focus:outline-none focus:border-[#168780]/60 transition-colors placeholder:text-[#65717a] resize-y min-h-36 leading-relaxed font-sans"
              />

              {/* Sample Blueprints */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-[#65717a] font-sans">
                  Example briefs:
                </span>
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applySamplePrompt(p)}
                    className="text-sm px-3 py-2 rounded-md bg-white hover:bg-[#e3ebe8] border border-[#d5deda] text-[#304756] hover:text-[#182b39] transition-colors font-sans"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={generating || briefLength < 20}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-base bg-[#173f52] hover:bg-[#102f3e] text-white shadow-sm shadow-emerald-800/15 transition-colors disabled:opacity-60"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing project quote…</span>
                  </>
                ) : (
                  <span>Build project quote</span>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Project Estimates Section */}
        <section id="project-estimates" className="scroll-mt-24 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#182b39]">Estimates</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#65717a] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search estimates..."
                  className="pl-8 pr-3 py-1.5 rounded-md bg-[#ffffff] border border-[#d5deda] text-xs text-[#263d4a] placeholder:text-[#65717a] focus:outline-none focus:border-[#168780] transition-colors w-44 sm:w-52"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#526270]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md bg-[#ffffff] border border-[#d5deda] text-xs text-[#304756] focus:outline-none focus:border-[#168780] transition-colors font-sans"
                >
                  <option value="ALL">All statuses ({statusCounts.ALL})</option>
                  <option value="AI_ESTIMATED">AI estimated ({statusCounts.AI_ESTIMATED})</option>
                  <option value="UNDER_REVIEW">Under review ({statusCounts.UNDER_REVIEW})</option>
                  <option value="APPROVED">Approved ({statusCounts.APPROVED})</option>
                  <option value="REJECTED">Rejected ({statusCounts.REJECTED})</option>
                </select>
              </div>
            </div>
          </div>

          {fetchingProjects ? (
            <div className="py-12 text-center text-[#65717a] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-xs font-sans">Loading estimates...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-[#d5deda] bg-[#ffffff] text-[#526270] space-y-3">
              <p className="text-xs font-medium text-[#263d4a]">No project estimates found.</p>
              <p className="text-xs text-[#65717a] font-sans">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No estimates match your active search or status filter.'
                  : 'Use the form above to calculate your first project scope.'}
              </p>
              {(searchQuery || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#edf1ef] hover:bg-[#d5deda] border border-[#d5deda] text-[#263d4a] transition-colors"
                >
                  <span>Reset all filters</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
