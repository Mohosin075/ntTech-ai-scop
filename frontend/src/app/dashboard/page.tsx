'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { Project, ProjectStatus } from '@/types';
import Navbar from '@/components/common/Navbar';
import ProjectCard from '@/components/common/ProjectCard';
import KpiCard from '@/components/common/KpiCard';
import AiSynthesisModal from '@/components/generator/AiSynthesisModal';
import {
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Filter,
  Loader2,
  Layers,
  AlertCircle,
  Search,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
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
  const { toast } = useToast();
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Executive Analytics Computed Metrics
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

  // Filtered projects by search query
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
        toast.success('AI Scope & Cost Estimation successfully formulated!');
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
    toast.info(`Loaded "${sample.title}" blueprint`);
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
        {/* Top Executive Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Scoped Pipeline"
            value={`$${stats.totalPipeline.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 -mr-1" />}
            valueClassName="text-emerald-400"
            subtitle={`${projects.length} Total Projects in DB`}
          />

          <KpiCard
            label="Total Engineering Hours"
            value={`${stats.totalDevHours.toLocaleString()} hrs`}
            icon={<Clock className="w-5 h-5" />}
            valueClassName="text-sky-400"
            subtitle="Active Feature Requirements"
          />

          <KpiCard
            label="Pending Review Gate"
            value={`${stats.pendingReviews}`}
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            valueClassName={stats.pendingReviews > 0 ? 'text-amber-400' : 'text-gray-300'}
            subtitle={
              user.role === 'ADMIN'
                ? 'Action Required: Review Scopes'
                : 'Awaiting Admin Approval'
            }
          />

          <KpiCard
            label="Average Project Quote"
            value={`$${stats.avgCost.toLocaleString()}`}
            icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
            valueClassName="text-indigo-300"
            subtitle="Mean Commercial Deliverable"
          />
        </section>

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
                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is formulating scope &amp; risk buffers...</span>
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

            {/* Controls: Search + Status Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search estimates..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition w-44 sm:w-56"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
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
          </div>

          {fetchingProjects ? (
            <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading estimates...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/40 text-gray-400 space-y-2">
              <p className="text-sm font-medium">No project estimates found.</p>
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? 'No estimates match your search query.'
                  : 'Use the generator card above to create your first AI estimate.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Phased Multi-Step AI Synthesis Modal */}
      <AiSynthesisModal isOpen={generating} projectTitle={title} />
    </div>
  );
}
