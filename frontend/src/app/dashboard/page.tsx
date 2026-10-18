'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import Navbar from '@/components/common/Navbar';
import StatusBadge from '@/components/common/StatusBadge';
import {
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Food Delivery & Real-time Courier App',
    rate: 35,
    text: 'A full-stack on-demand food delivery platform with customer mobile app, restaurant menu builder, real-time courier GPS tracking, and Stripe escrow payment settlement.',
  },
  {
    title: 'Hospital & Patient Management Portal',
    rate: 40,
    text: 'Enterprise healthcare portal for doctor appointment scheduling, encrypted patient health records (EHR), diagnostic test reports, and pharmacy prescription issuance.',
  },
  {
    title: 'Commercial Real Estate Marketplace',
    rate: 30,
    text: 'Commercial real estate marketplace featuring virtual property tours, broker commission calculation, buyer mortgage pre-qualification, and lease contract management.',
  },
];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Generator form state
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [rawRequirement, setRawRequirement] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Projects list state
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [fetchingProjects, setFetchingProjects] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch projects on load or filter change
  const loadProjects = async (filter?: string) => {
    try {
      setFetchingProjects(true);
      const query = filter && filter !== 'ALL' ? `?status=${filter}` : '';
      const res = await fetchApi<Project[]>(`/projects${query}`);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setFetchingProjects(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects(statusFilter);
    }
  }, [user, statusFilter]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError(null);

    if (rawRequirement.trim().length < 20) {
      setGenError('Please provide at least 20 characters of project description.');
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
        router.push(`/projects/${res.data.id}`);
      }
    } catch (err: unknown) {
      setGenError(err instanceof Error ? err.message : 'Generation failed');
      setGenerating(false);
    }
  };

  const applySamplePrompt = (sample: typeof SAMPLE_PROMPTS[0]) => {
    setTitle(sample.title);
    setHourlyRate(sample.rate);
    setRawRequirement(sample.text);
    setGenError(null);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        {/* Hero Generator Card */}
        <section className="rounded-2xl border border-gray-800 bg-[#111827]/80 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/15 via-violet-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-50">Create New AI Estimate</h2>
              <p className="text-xs text-gray-400">
                Input requirements and hourly rate. AI will generate an executive summary, risk level, tech stack, and feature breakdown.
              </p>
            </div>
          </div>

          {genError && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{genError}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Row 1: Title and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Project Title / Concept Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Multi-vendor E-commerce Platform"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Hourly Rate ($/hr)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm font-mono focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Requirements Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Project Requirements / Idea Description (min 20 characters)
                </label>
                <span className="text-[11px] text-gray-500 font-mono">
                  {rawRequirement.length} chars
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={rawRequirement}
                onChange={(e) => setRawRequirement(e.target.value)}
                placeholder="Describe what the application should do, target users, specific integrations (Stripe, maps, auth), and core capabilities..."
                className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-600 resize-none leading-relaxed"
              />

              {/* Sample Prompt Chips */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Try Sample Prompt:
                </span>
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySamplePrompt(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>⚡ {p.title.split(' ')[0]} {p.title.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is analyzing requirements, calculating risk &amp; estimating hours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Scope &amp; Cost</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Bottom Section: Recent Project Estimates */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-50 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Recent Project Estimates
              </h3>
              <p className="text-xs text-gray-400">Track and review scoped projects and milestones</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="ALL">All Statuses</option>
                <option value="AI_ESTIMATED">AI Estimated</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {fetchingProjects ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading estimates...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/40 text-gray-400 space-y-2">
              <p className="text-sm font-medium">No project estimates found.</p>
              <p className="text-xs text-gray-500">
                Use the generator card above to create your first AI estimate.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-gray-800 bg-[#111827] p-5 flex flex-col justify-between hover:border-gray-700 hover:shadow-xl transition group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-gray-50 line-clamp-1 group-hover:text-indigo-400 transition">
                        {proj.title}
                      </h4>
                      <StatusBadge status={proj.status} />
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {proj.executiveSummary}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-gray-800/80 text-xs">
                      <StatusBadge risk={proj.riskLevel} />
                      <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div className="p-2 rounded-lg bg-[#090D16] border border-gray-800/80">
                        <span className="text-[10px] text-gray-500 block uppercase">Total Cost</span>
                        <span className="font-bold text-gray-50 flex items-center text-sm text-emerald-400">
                          <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
                          {proj.finalTotalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#090D16] border border-gray-800/80">
                        <span className="text-[10px] text-gray-500 block uppercase">Timeline</span>
                        <span className="font-medium text-gray-300 flex items-center gap-1 text-xs mt-0.5">
                          <Clock className="w-3 h-3 text-sky-400" />
                          {proj.totalHours}h • {proj.estimatedWeeks}w
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800/80">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800/80 hover:bg-indigo-600 text-xs font-semibold text-gray-200 hover:text-white transition group-hover:bg-indigo-600"
                    >
                      <span>View Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
