'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
import { Project } from '@/types';
import Navbar from '@/components/common/Navbar';
import ProjectCard from '@/components/common/ProjectCard';
import {
  Loader2,
  AlertCircle,
  ArrowRight,
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

  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
        <section>
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#326b64]">Your workspace</p>
            <h1 className="mt-1 text-2xl sm:text-4xl font-semibold tracking-tight text-[#20332f]">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="mt-1 text-[15px] leading-6 text-[#65736e]">Your projects, from first brief to final quote.</p>
          </div>
        </section>
        {/* Project Scoping Generator Section */}
        <section className="space-y-5 rounded-3xl border border-[#e1e8e4] bg-gradient-to-b from-white to-[#fbfcfa] p-4 shadow-[0_18px_50px_-38px_rgba(23,63,82,0.28)] sm:p-7">
          <div className="max-w-3xl">
            <h2 className="text-[1.4rem] font-semibold tracking-tight text-[#20332f] sm:text-3xl">Describe your project</h2>
            <p className="mt-2 font-sans text-[15px] leading-6 text-[#65736e] sm:text-base">
              Describe the outcome. We’ll shape the scope and build a fixed USD quote for the agreed deliverables. Hours guide planning only.
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
              <div className="mb-2">
                <label htmlFor="project-brief" className="block font-sans text-[15px] font-semibold text-[#31453f] sm:text-base">
                  Project brief <span className="text-rose-900">*</span>
                </label>
                <span
                  id="brief-help"
                  aria-live="polite"
                  className={`mt-1 block text-xs font-medium sm:text-sm ${briefLength >= 20 ? 'text-[#28715f]' : 'text-[#738079]'}`}
                >
                  {briefLength >= 20 ? 'Ready to continue' : `${20 - briefLength} more characters to continue`}
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
                placeholder="What are you planning to build? Include the main features, who it’s for, and any important requirements."
                className="min-h-36 w-full resize-y rounded-xl border border-[#dfe5df] bg-[#fffefd] px-4 py-3.5 font-sans text-base leading-7 text-[#263a34] shadow-[0_2px_8px_-6px_rgba(45,66,57,0.2)] transition placeholder:text-[#84918b] focus:border-[#43877a] focus:outline-none focus:ring-4 focus:ring-[#43877a]/10 sm:px-5 sm:py-4 sm:text-lg"
              />

              {/* Sample Blueprints */}
              <div className="mt-4 hidden space-y-2.5 sm:block">
                <span className="block font-sans text-xs font-medium text-[#65717a] sm:text-sm">Need a starting point? Try an example</span>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {SAMPLE_PROMPTS.map((p, index) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applySamplePrompt(p)}
                      className={`flex min-h-11 items-center justify-center rounded-xl border border-[#e1e8e4] bg-[#fbfcfa] px-2.5 py-2 text-center font-sans text-xs font-medium leading-4 text-[#304756] transition hover:border-[#a9c9be] hover:bg-[#f1f7f4] hover:text-[#173f52] sm:min-h-10 sm:whitespace-nowrap sm:px-3 sm:text-sm ${index === SAMPLE_PROMPTS.length - 1 && SAMPLE_PROMPTS.length % 2 === 1 ? 'col-span-2 sm:col-span-1' : ''}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={generating || briefLength < 20}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173f52] px-6 py-3 font-semibold text-sm text-white shadow-[0_8px_18px_-12px_rgba(23,63,82,0.75)] transition hover:bg-[#102f3e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#168780]/20 disabled:cursor-not-allowed disabled:bg-[#e8eeeb] disabled:text-[#71817d] disabled:shadow-none sm:w-auto sm:text-base"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing project quote…</span>
                  </>
                ) : (
                  <>
                    <span>Build project quote</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Project Estimates Section */}
        <section id="project-estimates" className="scroll-mt-24 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#182b39]">Recent estimates</h3>
              <p className="mt-1 text-sm text-[#65717a]">Latest project quotes in your workspace</p>
            </div>
            <Link href="/estimates" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#d5deda] bg-white px-4 py-2.5 text-sm font-semibold text-[#173f52] transition hover:border-[#a9c1bb] hover:bg-[#f5f8f6]">
              View all estimates <span aria-hidden="true">→</span>
            </Link>
          </div>

          {fetchingProjects ? (
            <div className="py-12 text-center text-[#65717a] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-xs font-sans">Loading estimates...</span>
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd8d2] bg-white px-6 py-12 text-center">
              <p className="text-base font-semibold text-[#182b39]">Your estimates will appear here</p>
              <p className="mt-1 text-sm text-[#65717a]">Describe a project above to create your first scope and fixed quote.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} showCreator={user.role === 'ADMIN'} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
