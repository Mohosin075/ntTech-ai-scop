'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { Project } from '@/types';
import Navbar from '@/components/common/Navbar';
import ProjectCard from '@/components/common/ProjectCard';
import {
  Filter,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Pathao Courier COD Settlement Engine',
    rate: 35,
    text: 'A real-time logistics module for managing cash-on-delivery (COD) collection, automated rider payout balancing, delivery OTP confirmation, and merchant reconciliation ledgers.',
  },
  {
    title: 'Chaldal Warehouse Inventory Batching Module',
    rate: 30,
    text: 'Enterprise grocery fulfillment module for multi-hub warehouse inventory tracking, barcode scanner verification, perishable batch expiration alerts, and order picking routes.',
  },
  {
    title: 'bKash Merchant Payment Gateway & Reconciliation',
    rate: 40,
    text: 'High-availability payment orchestration engine with bKash and Nagad webhook handlers, tokenized recurring subscriptions, automated dispute refunds, and daily ledger reports.',
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [rawRequirement, setRawRequirement] = useState('');
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
        const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
        const res = await fetchApi<Project[]>(`/projects${query}`);
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
  }, [user, statusFilter]);

  const stats = useMemo(() => {
    const totalPipeline = projects.reduce((acc, p) => acc + (p.finalTotalCost || 0), 0);
    const totalDevHours = projects.reduce((acc, p) => acc + (p.totalHours || 0), 0);
    const pendingReviews = projects.filter((p) => p.status === 'UNDER_REVIEW').length;
    const avgCost = projects.length > 0 ? Math.round(totalPipeline / projects.length) : 0;
    return {
      totalPipeline,
      totalDevHours,
      pendingReviews,
      avgCost,
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.executiveSummary?.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);

    if (rawRequirement.trim().length < 20) {
      const err = 'Please provide at least 20 characters of project description.';
      setGenError(err);
      toast.error(err);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetchApi<Project>('/projects/generate', {
        method: 'POST',
        body: JSON.stringify({
          title,
          rawRequirement,
          hourlyRate: Number(hourlyRate),
        }),
      });

      if (res.success && res.data) {
        toast.success('Scope calculation complete');
        router.push(`/projects/${res.data.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setGenError(msg);
      toast.error(msg);
      setGenerating(false);
    }
  };

  const applySamplePrompt = (sample: (typeof SAMPLE_PROMPTS)[0]) => {
    setTitle(sample.title);
    setHourlyRate(sample.rate);
    setRawRequirement(sample.text);
    setGenError(null);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Minimal Stat Strip */}
        <section className="bg-[#121214] border border-[#27272A] rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-sans">Total Pipeline Value:</span>
            <span className="font-mono font-medium text-emerald-400">
              ${stats.totalPipeline.toLocaleString()}
            </span>
          </div>

          <span className="hidden md:inline text-zinc-700">•</span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-sans">Total Effort:</span>
            <span className="font-mono font-medium text-zinc-200">
              {stats.totalDevHours.toLocaleString()}h
            </span>
          </div>

          <span className="hidden md:inline text-zinc-700">•</span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-sans">Pending Review:</span>
            <span
              className={`font-mono font-medium ${
                stats.pendingReviews > 0 ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              {stats.pendingReviews}
            </span>
          </div>

          <span className="hidden md:inline text-zinc-700">•</span>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-sans">Average Quote:</span>
            <span className="font-mono font-medium text-zinc-200">
              ${stats.avgCost.toLocaleString()}
            </span>
          </div>
        </section>

        {/* Project Scoping Generator Section */}
        <section className="rounded-lg border border-[#27272A] bg-[#121214] p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Create project estimate</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              Enter target requirements and base hourly rate to calculate effort breakdown, risk buffer, and milestones.
            </p>
          </div>

          {genError && (
            <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span>{genError}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-zinc-300 mb-1 font-sans">
                  Project title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pathao Courier COD Settlement Engine"
                  className="w-full px-3 py-2 rounded-md bg-[#0A0A0B] border border-[#27272A] text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 font-sans">
                  Hourly rate ($/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-2 rounded-md bg-[#0A0A0B] border border-[#27272A] text-zinc-100 text-xs font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-300 font-sans">
                  Project requirements and scope description (minimum 20 characters)
                </label>
                <span className="text-xs text-zinc-500 font-mono">
                  {rawRequirement.length} chars
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={rawRequirement}
                onChange={(e) => setRawRequirement(e.target.value)}
                placeholder="Describe business capabilities, core workflows, database entities, and integrations..."
                className="w-full px-3 py-2 rounded-md bg-[#0A0A0B] border border-[#27272A] text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600 resize-none leading-relaxed font-sans"
              />

              {/* Sample Blueprints */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-zinc-500 font-sans">
                  Presets:
                </span>
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySamplePrompt(p)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white transition-colors font-sans"
                  >
                    {p.title.split(' ')[0]} {p.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Calculating project scope...</span>
                  </>
                ) : (
                  <span>Calculate scope and milestones</span>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Project Estimates Section */}
        <section className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Project estimates</h3>
              <p className="text-xs text-zinc-400 font-sans">Track and review scoped projects and milestones</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search estimates..."
                  className="pl-8 pr-3 py-1.5 rounded-md bg-[#121214] border border-[#27272A] text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors w-44 sm:w-52"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md bg-[#121214] border border-[#27272A] text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors font-sans"
                >
                  <option value="ALL">All statuses</option>
                  <option value="AI_ESTIMATED">AI estimated</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {fetchingProjects ? (
            <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-xs font-sans">Loading estimates...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-[#27272A] bg-[#121214] text-zinc-400 space-y-1">
              <p className="text-xs font-medium text-zinc-300">No project estimates found.</p>
              <p className="text-xs text-zinc-500 font-sans">
                {searchQuery
                  ? 'No estimates match your search query.'
                  : 'Use the form above to calculate your first project scope.'}
              </p>
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
