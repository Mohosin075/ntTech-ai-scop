'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { Feature, FeatureCategory, FeatureComplexity, Project, ProjectStatus } from '@/types';
import Navbar from '@/components/common/Navbar';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import KpiCard from '@/components/common/KpiCard';
import CategoryAnalytics from '@/components/workspace/CategoryAnalytics';
import ProposalModal from '@/components/workspace/ProposalModal';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  Loader2,
  Send,
  RefreshCw,
  FileText,
  Search,
  Edit2,
  Check,
  X,
} from 'lucide-react';

function ProjectWorkspaceContent() {
  const routeParams = useParams();
  const projectId = routeParams?.id as string;

  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [newRate, setNewRate] = useState<number>(25);
  const [updatingRate, setUpdatingRate] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureCategory, setFeatureCategory] = useState<FeatureCategory>('BACKEND');
  const [featureComplexity, setFeatureComplexity] = useState<FeatureComplexity>('MEDIUM');
  const [featureHours, setFeatureHours] = useState<number>(10);
  const [addingFeature, setAddingFeature] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [featureSearch, setFeatureSearch] = useState('');

  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (!user || !projectId) return;

    let isCancelled = false;

    async function fetchProjectDetails() {
      try {
        const res = await fetchApi<Project>(`/projects/${projectId}`);
        if (!isCancelled && res.success && res.data) {
          setProject(res.data);
          setNewRate(res.data.hourlyRate);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          toast.error(err instanceof Error ? err.message : 'Failed to load project');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchProjectDetails();

    return () => {
      isCancelled = true;
    };
  }, [user, isLoading, projectId, router, toast]);

  const handleStatusChange = async (targetStatus: ProjectStatus, reason?: string) => {
    try {
      setActionLoading(true);
      const res = await fetchApi<Project>(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          rejectionReason: reason,
        }),
      });

      if (res.success && res.data) {
        setProject(res.data);
        toast.success(`Project status transitioned to ${targetStatus}`);
        setIsRejectModalOpen(false);
        setRejectionReason('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingRate(true);
      const res = await fetchApi<Project>(`/projects/${projectId}/rate`, {
        method: 'PATCH',
        body: JSON.stringify({ hourlyRate: Number(newRate) }),
      });
      if (res.success && res.data) {
        setProject(res.data);
        toast.success('Hourly rate updated and costs recalculated');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update hourly rate');
    } finally {
      setUpdatingRate(false);
    }
  };

  const handleToggleInclude = async (feature: Feature) => {
    if (project?.status === 'APPROVED') return;
    try {
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features/${feature.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isIncluded: !feature.isIncluded }),
        }
      );
      if (res.success && res.data) {
        setProject(res.data.project);
        toast.info(
          `Feature ${feature.isIncluded ? 'excluded from' : 'included in'} budget calculations`
        );
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update feature');
    }
  };

  const handleAdjustHours = async (feature: Feature, delta: number) => {
    if (project?.status === 'APPROVED') return;
    const targetHours = Math.max(1, Math.min(200, feature.estimatedHours + delta));
    try {
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features/${feature.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ estimatedHours: targetHours }),
        }
      );
      if (res.success && res.data) {
        setProject(res.data.project);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to adjust hours');
    }
  };

  const handleSaveTitle = async (featureId: string) => {
    if (!editingTitle.trim()) {
      setEditingFeatureId(null);
      return;
    }
    try {
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ title: editingTitle.trim() }),
        }
      );
      if (res.success && res.data) {
        setProject(res.data.project);
        toast.success('Feature title updated');
        setEditingFeatureId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save title');
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (project?.status === 'APPROVED') return;
    if (!confirm('Are you sure you want to delete this feature from the scope?')) return;
    try {
      const res = await fetchApi<{ message: string; project: Project }>(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'DELETE',
        }
      );
      if (res.success && res.data) {
        setProject(res.data.project);
        toast.success('Feature removed');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete feature');
    }
  };

  const handleAddFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingFeature(true);
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: featureTitle,
            category: featureCategory,
            complexity: featureComplexity,
            estimatedHours: Number(featureHours),
            isIncluded: true,
          }),
        }
      );
      if (res.success && res.data) {
        setProject(res.data.project);
        setIsAddModalOpen(false);
        setFeatureTitle('');
        setFeatureHours(10);
        toast.success('Feature added to scope');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add custom feature');
    } finally {
      setAddingFeature(false);
    }
  };

  const filteredFeatures = useMemo(() => {
    if (!project) return [];
    return project.features.filter((f) => {
      const matchCat = categoryFilter === 'ALL' || f.category === categoryFilter;
      const matchSearch =
        !featureSearch.trim() ||
        f.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(featureSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [project, categoryFilter, featureSearch]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: project?.features.length || 0 };
    project?.features.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [project]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-rose-400 text-xs mb-3">Project not found or accessible.</p>
        <Link href="/dashboard" className="px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-200 text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = project.status === 'APPROVED';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition mb-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">{project.title}</h1>
              <StatusBadge status={project.status} />
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Lock className="w-3 h-3 text-amber-400" /> Locked Scope
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition"
              title="Preview and print Statement of Work"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export SOW</span>
            </button>

            {project.status === 'AI_ESTIMATED' && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Submit for Approval</span>
              </button>
            )}

            {project.status === 'UNDER_REVIEW' && isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-medium transition disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Scope</span>
                </button>
              </div>
            )}

            {project.status === 'UNDER_REVIEW' && !isAdmin && (
              <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-md font-medium">
                Under Review by Administrator
              </span>
            )}

            {project.status === 'REJECTED' && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resubmit for Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard
            label="Total Estimated Cost"
            value={project.finalTotalCost.toLocaleString()}
            icon={<DollarSign className="w-4 h-4 -mr-1" />}
            valueClassName="text-emerald-400"
            subtitle={`Base: $${project.baseCost.toLocaleString()} + Buffer: $${project.riskBufferAmount.toLocaleString()}`}
          />

          <KpiCard
            label="Total Effort"
            value={`${project.totalHours} hrs`}
            icon={<Clock className="w-4 h-4" />}
            valueClassName="text-zinc-200"
            subtitle="Active features only"
          />

          <KpiCard
            label="Estimated Timeline"
            value={`${project.estimatedWeeks} Weeks`}
            icon={<Calendar className="w-4 h-4 text-zinc-400" />}
            valueClassName="text-zinc-200"
            subtitle="Based on 30 hrs/week"
          />

          <KpiCard
            label="Risk Profile"
            value={<StatusBadge risk={project.riskLevel} />}
            valueClassName="text-base"
            subtitle={
              <span className="flex items-center gap-1 text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                Confidence: {project.aiConfidenceScore}%
              </span>
            }
          />
        </div>

        {/* Effort & Cost Distribution by Component */}
        <CategoryAnalytics features={project.features} hourlyRate={project.hourlyRate} />

        {/* 2-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Summary + Feature Table (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Scope Summary & Architecture */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-xs text-zinc-200">
                    Scope summary and architecture
                  </h3>
                  <button
                    onClick={() => setIsEvalModalOpen(true)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 underline ml-1"
                  >
                    (Specs &amp; limitations)
                  </button>
                </div>
                {project.isFallbackUsed && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-800">
                    Rule engine fallback
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {project.executiveSummary}
              </p>

              {project.recommendedStack && project.recommendedStack.length > 0 && (
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-zinc-500 font-sans">
                    Stack:
                  </span>
                  {project.recommendedStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs font-mono bg-zinc-950 text-zinc-300 border border-zinc-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Table Card */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div>
                  <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                    <span>Feature breakdown</span>
                    <span className="text-xs font-mono text-zinc-500">
                      ({filteredFeatures.length} of {project.features.length})
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans">
                    Adjust hours or toggle checkboxes to update project totals.
                  </p>
                </div>

                {!isApproved && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add feature</span>
                  </button>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-0.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'INTEGRATION', 'AI'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        categoryFilter === cat
                          ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                          : 'bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      <span>{cat === 'ALL' ? 'All' : cat}</span>
                      <span className="text-xs opacity-70 font-mono ml-1">
                        ({categoryCounts[cat] || 0})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Filter features..."
                    className="pl-8 pr-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors w-full sm:w-44"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/60 text-zinc-400 font-sans text-xs border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-2.5 w-10 text-center font-medium">Inc</th>
                      <th className="py-2.5 px-3 font-medium">Feature</th>
                      <th className="py-2.5 px-2.5 font-medium">Category</th>
                      <th className="py-2.5 px-2.5 font-medium">Complexity</th>
                      <th className="py-2.5 px-3 text-center font-medium">Hours</th>
                      <th className="py-2.5 px-3 text-right font-medium">Subtotal</th>
                      <th className="py-2.5 px-2.5 w-10 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {filteredFeatures.map((f) => (
                      <tr
                        key={f.id}
                        className={`hover:bg-zinc-800/30 transition ${
                          !f.isIncluded ? 'opacity-40 bg-zinc-950/40 line-through text-zinc-500' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={f.isIncluded}
                            disabled={isApproved}
                            onChange={() => handleToggleInclude(f)}
                            className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-950 text-emerald-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* Title */}
                        <td className="py-2 px-3 font-sans font-medium text-zinc-100 text-xs">
                          {editingFeatureId === f.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(f.id)}
                                autoFocus
                                className="px-2 py-0.5 rounded-md bg-zinc-950 border border-emerald-500 text-zinc-100 text-xs w-full focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveTitle(f.id)}
                                className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                                title="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingFeatureId(null)}
                                className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/title">
                              <span>{f.title}</span>
                              {!isApproved && (
                                <button
                                  onClick={() => {
                                    setEditingFeatureId(f.id);
                                    setEditingTitle(f.title);
                                  }}
                                  className="opacity-0 group-hover/title:opacity-100 text-zinc-500 hover:text-emerald-400 transition"
                                  title="Edit title"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="py-2 px-2.5 font-sans">
                          <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-zinc-950/80 border border-zinc-800 text-zinc-300">
                            {f.category}
                          </span>
                        </td>

                        {/* Complexity */}
                        <td className="py-2 px-2.5 font-sans">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-xs font-medium border ${
                              f.complexity === 'HIGH'
                                ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                                : f.complexity === 'MEDIUM'
                                ? 'text-amber-400 bg-amber-950/40 border-amber-800/50'
                                : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50'
                            }`}
                          >
                            {f.complexity}
                          </span>
                        </td>

                        {/* Stepper */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 px-1.5 py-0.5 rounded-md">
                            {!isApproved && (
                              <button
                                onClick={() => handleAdjustHours(f, -2)}
                                className="text-zinc-400 hover:text-zinc-100 px-1 font-bold text-xs"
                                title="-2 hours"
                              >
                                -
                              </button>
                            )}
                            <span className="font-semibold text-zinc-100 text-xs min-w-7">
                              {f.estimatedHours}h
                            </span>
                            {!isApproved && (
                              <button
                                onClick={() => handleAdjustHours(f, 2)}
                                className="text-zinc-400 hover:text-zinc-100 px-1 font-bold text-xs"
                                title="+2 hours"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td className="py-2 px-3 text-right font-semibold text-emerald-400">
                          ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                        </td>

                        {/* Delete */}
                        <td className="py-2 px-2.5 text-center">
                          {!isApproved ? (
                            <button
                              onClick={() => handleDeleteFeature(f.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1 transition"
                              title="Delete feature"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-zinc-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Milestones & Rates (4 Columns) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Milestone Breakdown */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <h3 className="font-medium text-xs text-zinc-200">
                  Milestone breakdown
                </h3>
                <span className="text-xs font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-800">
                  30% • 40% • 30%
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: 'Milestone 1 (Kickoff - 30%)', amount: project.milestone1Amount, width: '30%', color: 'bg-emerald-500' },
                  { label: 'Milestone 2 (Core MVP - 40%)', amount: project.milestone2Amount, width: '40%', color: 'bg-blue-500' },
                  { label: 'Milestone 3 (QA & Deploy - 30%)', amount: project.milestone3Amount, width: '30%', color: 'bg-teal-500' },
                ].map((ms, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-zinc-300 font-sans">
                      <span className="font-medium text-xs">{ms.label}</span>
                      <span className="font-mono font-semibold text-zinc-100">
                        ${ms.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-md bg-zinc-950 overflow-hidden border border-zinc-800/80">
                      <div className={`h-full ${ms.color}`} style={{ width: ms.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-3">
              <h3 className="font-medium text-xs text-zinc-200">
                Hourly rate adjuster
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Adjust rate to recalculate total estimate and deliverables.
              </p>

              <form onSubmit={handleUpdateRate} className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    disabled={isApproved || updatingRate}
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full pl-6 pr-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
                  />
                </div>

                {!isApproved && (
                  <button
                    type="submit"
                    disabled={updatingRate || newRate === project.hourlyRate}
                    className="w-full py-1.5 px-3 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700/80 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {updatingRate ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Recalculate</span>
                  </button>
                )}
              </form>
            </div>

            {/* Audit Trail */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-4 space-y-2.5 text-xs">
              <h3 className="font-medium text-xs text-zinc-200">
                Audit trail
              </h3>

              <div className="space-y-1.5 text-zinc-400 font-sans">
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span>Created by:</span>
                  <span className="text-zinc-200 font-medium">{project.createdBy?.name || 'Estimator'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/80">
                  <span>Created date:</span>
                  <span className="text-zinc-200 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.reviewedBy && (
                  <div className="flex justify-between py-1 border-b border-zinc-800/80">
                    <span>Reviewed by:</span>
                    <span className="text-zinc-200 font-medium">{project.reviewedBy.name}</span>
                  </div>
                )}
              </div>

              {project.status === 'REJECTED' && project.rejectionReason && (
                <div className="p-2.5 rounded-md bg-rose-950/40 border border-rose-800/80 text-rose-300 space-y-1">
                  <span className="text-xs font-semibold text-rose-400 block">
                    Rejection feedback:
                  </span>
                  <p className="text-xs leading-relaxed font-sans">{project.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Custom Feature Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Feature"
      >
        <form onSubmit={handleAddFeatureSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Feature Name</label>
            <input
              type="text"
              required
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              placeholder="e.g. bKash Webhook Callback Handler"
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Category</label>
              <select
                value={featureCategory}
                onChange={(e) => setFeatureCategory(e.target.value as FeatureCategory)}
                className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="DATABASE">DATABASE</option>
                <option value="INTEGRATION">INTEGRATION</option>
                <option value="AI">AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Complexity</label>
              <select
                value={featureComplexity}
                onChange={(e) => setFeatureComplexity(e.target.value as FeatureComplexity)}
                className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Estimated Hours</label>
            <input
              type="number"
              min={1}
              max={200}
              required
              value={featureHours}
              onChange={(e) => setFeatureHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingFeature}
              className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white flex items-center gap-1.5"
            >
              {addingFeature && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Add Feature</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Scope"
      >
        <p className="text-xs text-zinc-400">
          State reason for rejection (minimum 10 characters).
        </p>

        <textarea
          rows={3}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Scope buffer seems low for payment integration, or hours estimated are insufficient..."
          className="w-full px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-rose-500 transition resize-none"
        />

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(false)}
            className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs font-medium text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={actionLoading || rejectionReason.trim().length < 10}
            onClick={() => handleStatusChange('REJECTED', rejectionReason)}
            className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-xs font-medium text-white flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirm Rejection</span>
          </button>
        </div>
      </Modal>

      {/* Architecture Specs Modal */}
      <Modal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        maxWidth="max-w-xl"
        title="Scoping Engine - Specifications & Limitations"
      >
        <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              1. Input Parameters
            </span>
            <p className="text-zinc-400">
              Project title, raw natural language description, and financial hourly rate baseline.
            </p>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              2. Generated Outputs &amp; Metrics
            </span>
            <p className="text-zinc-400">
              Automated risk tiers (LOW 5%, MEDIUM 12%, HIGH 20%), module breakdown with hours, curated tech stack, and rounding-safe 30%-40%-30% milestones.
            </p>
          </div>

          <div className="p-3 rounded bg-zinc-950 border border-zinc-800">
            <span className="font-semibold text-zinc-200 block mb-1">
              3. Limitations &amp; Fallback
            </span>
            <p className="text-zinc-400">
              Provides architectural baseline; proprietary on-premise hardware or compliance audits may require manual scoping. System includes an offline deterministic rule engine fallback for zero downtime.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => setIsEvalModalOpen(false)}
            className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Statement of Work Proposal Modal */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        project={project}
      />
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ProjectWorkspaceContent />
    </React.Suspense>
  );
}
