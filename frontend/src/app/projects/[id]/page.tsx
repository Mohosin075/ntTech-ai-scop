'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
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
  Filter,
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

  const [newProjectFee, setNewProjectFee] = useState<number>(0);
  const [updatingProjectFee, setUpdatingProjectFee] = useState(false);
  const syncProject = (updatedProject: Project) => {
    setProject(updatedProject);
    setNewProjectFee(updatedProject.finalTotalCost);
  };

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

  const [editingHoursId, setEditingHoursId] = useState<string | null>(null);
  const [editingHoursValue, setEditingHoursValue] = useState<number>(0);

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
          syncProject(res.data);
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
        toast.success(targetStatus === 'UNDER_REVIEW' ? 'Scope sent for review' : targetStatus === 'APPROVED' ? 'Scope approved and locked' : 'Scope returned for revision');
        setIsRejectModalOpen(false);
        setRejectionReason('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProjectFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || project.totalHours <= 0 || newProjectFee <= 0) return;

    // The backend keeps an internal planning rate; translate the fixed quote
    // into that value without exposing an hourly price to the client.
    const internalRate = Number(
      (newProjectFee / (project.totalHours * (1 + project.riskBufferPercent / 100))).toFixed(2)
    );
    if (internalRate < 5 || internalRate > 500) {
      const minFee = project.totalHours * 5 * (1 + project.riskBufferPercent / 100);
      const maxFee = project.totalHours * 500 * (1 + project.riskBufferPercent / 100);
      toast.error(`For this scope, choose a project fee between $${minFee.toLocaleString()} and $${maxFee.toLocaleString()}.`);
      return;
    }

    try {
      setUpdatingProjectFee(true);
      const res = await fetchApi<Project>(`/projects/${projectId}/rate`, {
        method: 'PATCH',
        body: JSON.stringify({ hourlyRate: internalRate }),
      });
      if (res.success && res.data) {
        syncProject(res.data);
        toast.success('Fixed project quote updated');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update project quote');
    } finally {
      setUpdatingProjectFee(false);
    }
  };

  const handleToggleInclude = async (feature: Feature) => {
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
    try {
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features/${feature.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isIncluded: !feature.isIncluded }),
        }
      );
      if (res.success && res.data) {
        syncProject(res.data.project);
        toast.info(
          `Feature ${feature.isIncluded ? 'excluded from' : 'included in'} budget calculations`
        );
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update feature');
    }
  };

  const handleAdjustHours = async (feature: Feature, delta: number) => {
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
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
        syncProject(res.data.project);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to adjust hours');
    }
  };

  const handleSaveTitle = async (featureId: string) => {
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
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
        syncProject(res.data.project);
        toast.success('Feature title updated');
        setEditingFeatureId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save title');
    }
  };

  const handleSaveHours = async (featureId: string) => {
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
    const targetHours = Math.max(1, Math.min(200, Number(editingHoursValue) || 1));
    setEditingHoursId(null);
    try {
      const res = await fetchApi<{ feature: Feature; project: Project }>(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ estimatedHours: targetHours }),
        }
      );
      if (res.success && res.data) {
        syncProject(res.data.project);
        toast.success('Hours updated');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update hours');
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
    if (!confirm('Are you sure you want to delete this feature from the scope?')) return;
    try {
      const res = await fetchApi<{ message: string; project: Project }>(
        `/projects/${projectId}/features/${featureId}`,
        {
          method: 'DELETE',
        }
      );
      if (res.success && res.data) {
        syncProject(res.data.project);
        toast.success('Feature removed');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete feature');
    }
  };

  const handleAddFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (project?.status === 'APPROVED' || project?.status === 'UNDER_REVIEW') return;
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
        syncProject(res.data.project);
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
      <div className="min-h-screen bg-[#f7f7f4] flex items-center justify-center text-[#526270]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f7f7f4] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-rose-900 text-xs mb-3">Project not found or accessible.</p>
        <Link href="/dashboard" className="px-3 py-1.5 rounded-md bg-[#edf1ef] border border-[#d5deda] text-[#263d4a] text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = project.status === 'APPROVED';
  const isScopeLocked = isApproved || project.status === 'UNDER_REVIEW';
  const isAdmin = user?.role === 'ADMIN';
  const isProjectOwner = project.createdById === user?.id;
  const isScopeEditable = isProjectOwner && !isScopeLocked;

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#182b39] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-5 border-b border-[#d5deda]">
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-[#526270] hover:text-emerald-900 transition mb-0.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight text-[#182b39] break-words">
              {formatProjectTitle(project.title)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              {isScopeLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#edf1ef] text-[#304756] border border-[#d5deda]">
                  <Lock className="w-3 h-3 text-amber-900" /> {isApproved ? 'Approved & locked' : 'Locked during review'}
                </span>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 lg:w-auto lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsProposalModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#edf1ef] hover:bg-[#e3ebe8] border border-[#d5deda] text-[#263d4a] text-sm font-medium transition"
              title="Preview and print Statement of Work"
            >
              <FileText className="w-3.5 h-3.5 text-[#526270]" />
              <span>Export SOW</span>
            </button>

            {project.status === 'AI_ESTIMATED' && isProjectOwner && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#173f52] hover:bg-[#102f3e] text-white text-sm font-medium transition disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'Send for peer review' : 'Send for review'}</span>
              </button>
            )}

            {project.status === 'UNDER_REVIEW' && isAdmin && !isProjectOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-900 text-xs font-medium transition disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-[#173f52] hover:bg-[#102f3e] text-white text-xs font-medium transition disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Scope</span>
                </button>
              </div>
            )}

            {project.status === 'UNDER_REVIEW' && !isAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 "></span>
                  Awaiting administrator review
                </span>
              </div>
            )}

            {project.status === 'REJECTED' && isProjectOwner && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#173f52] hover:bg-[#102f3e] text-white text-sm font-medium transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Send updated scope</span>
              </button>
            )}
            </div>

            {project.status === 'AI_ESTIMATED' && isAdmin && !isProjectOwner && (
              <p className="max-w-sm text-right text-sm leading-5 text-[#65717a]">
                The project owner must submit this draft for review.
              </p>
            )}
            {project.status === 'UNDER_REVIEW' && isAdmin && isProjectOwner && (
              <p className="max-w-sm text-right text-sm leading-5 text-[#65717a]">
                Another administrator must review this project. You cannot approve your own scope.
              </p>
            )}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard
            label="Fixed Project Quote"
            value={project.finalTotalCost.toLocaleString()}
            icon={<DollarSign className="w-4 h-4 -mr-1" />}
            valueClassName="text-emerald-900"
            subtitle={`Includes ${project.riskBufferPercent}% scope contingency`}
          />

          <KpiCard
            label="Total Effort"
            value={`${project.totalHours} hrs`}
            icon={<Clock className="w-4 h-4" />}
            valueClassName="text-[#263d4a]"
            subtitle="Active features only"
          />

          <KpiCard
            label="Estimated Timeline"
            value={`${project.estimatedWeeks} Weeks`}
            icon={<Calendar className="w-4 h-4 text-[#526270]" />}
            valueClassName="text-[#263d4a]"
            subtitle="Based on 30 hrs/week"
          />

          <KpiCard
            label="Risk Profile"
            value={<StatusBadge risk={project.riskLevel} />}
            valueClassName="text-base"
            subtitle={
              <span className="flex items-center gap-1 text-[#526270]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#526270]" />
                {project.isFallbackUsed
                  ? 'Rule-based estimate; validate assumptions'
                  : `Model confidence: ${project.aiConfidenceScore}%`}
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
            <div className="rounded-lg border border-[#d5deda] bg-[#ffffff] p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-[#182b39]">
                    Scope summary and architecture
                  </h3>
                  <button
                    onClick={() => setIsEvalModalOpen(true)}
                    className="text-xs text-[#526270] hover:text-[#263d4a] underline ml-1"
                  >
                    (Specs &amp; limitations)
                  </button>
                </div>
                {project.isFallbackUsed && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#f7f7f4] text-[#526270] border border-[#d5deda]">
                    Rule engine fallback
                  </span>
                )}
              </div>

              <p className="text-base text-[#304756] leading-relaxed font-sans">
                {project.executiveSummary}
              </p>

              {project.recommendedStack && project.recommendedStack.length > 0 && (
                <div className="pt-2 border-t border-[#d5deda] flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-[#65717a] font-sans">
                    Stack:
                  </span>
                  {project.recommendedStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs bg-[#f7f7f4] text-[#304756] border border-[#d5deda]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Feature Table Card */}
            <div className="rounded-lg border border-[#d5deda] bg-[#ffffff] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d5deda]">
                <div>
                  <h3 className="font-semibold text-lg text-[#182b39] flex items-center gap-2">
                    <span>Feature breakdown</span>
                    <span className="text-xs text-[#65717a]">
                      ({filteredFeatures.length} of {project.features.length})
                    </span>
                  </h3>
                    <p className="text-sm text-[#526270] font-sans">
                    {isScopeLocked
                      ? 'Scope is locked during review and after approval.'
                      : isProjectOwner
                        ? 'Adjust included features and effort; the project quote and milestones recalculate automatically.'
                        : 'Only the project owner can change this draft before submitting it for review.'}
                  </p>
                </div>

                {isScopeEditable && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#173f52] hover:bg-[#102f3e] text-white text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add feature</span>
                  </button>
                )}
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 gap-3 pt-0.5 sm:grid-cols-2">
                <div className="relative min-w-0">
                  <Filter className="w-4 h-4 text-[#65717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    aria-label="Filter features by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none pl-9 pr-3 py-2 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-sm text-[#263d4a] focus:outline-none focus:border-[#168780] focus:ring-2 focus:ring-[#168780]/10 transition-colors"
                  >
                    {['ALL', 'FRONTEND', 'BACKEND', 'DATABASE', 'INTEGRATION', 'AI'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'ALL' ? 'All categories' : cat.charAt(0) + cat.slice(1).toLowerCase()} ({categoryCounts[cat] || 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative min-w-0">
                  <Search className="w-4 h-4 text-[#65717a] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Filter features..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#f7f7f4] border border-[#d5deda] text-sm text-[#263d4a] placeholder:text-[#65717a] focus:outline-none focus:border-[#168780] focus:ring-2 focus:ring-[#168780]/10 transition-colors"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f7f7f4] text-[#526270] font-sans text-xs border-b border-[#d5deda]">
                    <tr>
                      <th className="py-2.5 px-2.5 w-16 text-center font-medium">Include</th>
                      <th className="py-2.5 px-3 font-medium">Feature</th>
                      <th className="py-2.5 px-2.5 font-medium">Category</th>
                      <th className="py-2.5 px-2.5 font-medium">Complexity</th>
                      <th className="py-2.5 px-3 text-center font-medium">Hours</th>
                      <th className="py-2.5 px-3 text-right font-medium">Subtotal</th>
                      <th className="py-2.5 px-2.5 w-16 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5deda]">
                    {filteredFeatures.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#526270] font-sans text-xs">
                          <p className="font-medium text-[#304756]">No features found.</p>
                          <p className="text-[#65717a] mt-0.5">
                            No deliverables match category &quot;{categoryFilter}&quot;
                            {featureSearch ? ` and search "${featureSearch}"` : ''}.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFilter('ALL');
                              setFeatureSearch('');
                            }}
                            className="mt-2 text-xs text-emerald-900 hover:text-emerald-900 underline font-medium"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredFeatures.map((f) => (
                      <tr
                        key={f.id}
                        className={`hover:bg-[#edf1ef]/40 transition ${
                          !f.isIncluded ? 'opacity-40 bg-[#f7f7f4]/40 line-through text-[#65717a]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={f.isIncluded}
                    disabled={!isScopeEditable}
                            onChange={() => handleToggleInclude(f)}
                            className="w-3.5 h-3.5 rounded border-[#d5deda] bg-[#f7f7f4] text-emerald-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* Title */}
                        <td className="py-2 px-3 font-sans font-medium text-[#182b39] text-xs">
                          {editingFeatureId === f.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(f.id)}
                                autoFocus
                                className="px-2 py-0.5 rounded-md bg-[#f7f7f4] border border-emerald-500 text-[#182b39] text-xs w-full focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveTitle(f.id)}
                                className="p-1 rounded-md bg-[#173f52] text-white hover:bg-emerald-700"
                                title="Save"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingFeatureId(null)}
                                className="p-1 rounded-md bg-[#edf1ef] text-[#526270] hover:text-[#263d4a] border border-[#d5deda]"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group/title">
                              <span>{f.title}</span>
                              {isScopeEditable && (
                                <button
                                  onClick={() => {
                                    setEditingFeatureId(f.id);
                                    setEditingTitle(f.title);
                                  }}
                                  className="opacity-0 group-hover/title:opacity-100 text-[#65717a] hover:text-emerald-900 transition"
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
                          <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-[#f7f7f4] border border-[#d5deda] text-[#304756]">
                            {f.category}
                          </span>
                        </td>

                        {/* Complexity */}
                        <td className="py-2 px-2.5 font-sans">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-xs font-medium border ${
                              f.complexity === 'HIGH'
                                ? 'text-rose-900 bg-rose-100 border-rose-300'
                                : f.complexity === 'MEDIUM'
                                ? 'text-amber-900 bg-amber-100 border-amber-300'
                                : 'text-emerald-900 bg-emerald-100 border-emerald-300'
                            }`}
                          >
                            {f.complexity}
                          </span>
                        </td>

                        {/* Stepper / Direct Input */}
                        <td className="py-2 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-[#f7f7f4] border border-[#d5deda] px-1.5 py-0.5 rounded-md">
                            {isScopeEditable && (
                              <button
                                onClick={() => handleAdjustHours(f, -2)}
                                className="text-[#526270] hover:text-[#182b39] px-1 font-bold text-xs"
                                title="-2 hours"
                              >
                                -
                              </button>
                            )}

                            {editingHoursId === f.id ? (
                              <input
                                type="number"
                                min={1}
                                max={200}
                                value={editingHoursValue}
                                onChange={(e) => setEditingHoursValue(Number(e.target.value))}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveHours(f.id)}
                                onBlur={() => handleSaveHours(f.id)}
                                autoFocus
                                className="w-12 text-center bg-[#ffffff] border border-emerald-500 rounded px-1 text-xs text-[#182b39] focus:outline-none"
                              />
                            ) : (
                              <button
                                type="button"
                                disabled={!isScopeEditable}
                                onClick={() => {
                                  if (isScopeEditable) {
                                    setEditingHoursId(f.id);
                                    setEditingHoursValue(f.estimatedHours);
                                  }
                                }}
                                title={!isScopeEditable ? undefined : 'Click to type exact hours'}
                                className={`font-semibold text-[#182b39] text-xs min-w-7 px-1 rounded ${
                                  isScopeEditable ? 'hover:bg-[#edf1ef] hover:text-[#126b67] transition cursor-pointer' : ''
                                }`}
                              >
                                {f.estimatedHours}h
                              </button>
                            )}

                            {isScopeEditable && (
                              <button
                                onClick={() => handleAdjustHours(f, 2)}
                                className="text-[#526270] hover:text-[#182b39] px-1 font-bold text-xs"
                                title="+2 hours"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td className="py-2 px-3 text-right font-semibold text-emerald-900">
                          ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                        </td>

                        {/* Delete */}
                        <td className="py-2 px-2.5 text-center">
                          {isScopeEditable ? (
                            <button
                              onClick={() => handleDeleteFeature(f.id)}
                              className="text-[#65717a] hover:text-rose-900 p-1 transition"
                              title="Delete feature"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-[#65717a] mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Milestones & Rates (4 Columns) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Milestone Breakdown */}
            <div className="rounded-lg border border-[#d5deda] bg-[#ffffff] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#d5deda]">
                <h3 className="font-semibold text-lg text-[#182b39]">
                  Milestone breakdown
                </h3>
                <span className="text-xs text-[#526270] bg-[#f7f7f4] px-2 py-0.5 rounded-md border border-[#d5deda]">
                  30% • 40% • 30%
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { label: 'Milestone 1 (Kickoff - 30%)', amount: project.milestone1Amount, width: '30%', color: 'bg-emerald-500' },
                  { label: 'Milestone 2 (Core MVP - 40%)', amount: project.milestone2Amount, width: '40%', color: 'bg-blue-500' },
                  { label: 'Milestone 3 (QA & Deploy - 30%)', amount: project.milestone3Amount, width: '30%', color: 'bg-teal-500' },
                ].map((ms, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[#304756] font-sans">
                      <span className="font-medium text-xs">{ms.label}</span>
                      <span className="font-semibold text-[#182b39]">
                        ${ms.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-md bg-[#f7f7f4] overflow-hidden border border-[#d5deda]">
                      <div className={`h-full ${ms.color}`} style={{ width: ms.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Project Fee */}
            <div className="rounded-lg border border-[#d5deda] bg-[#ffffff] p-4 space-y-3">
              <h3 className="font-semibold text-lg text-[#182b39]">
                Project fee
              </h3>
              <p className="text-sm text-[#526270] font-sans">
                Set the fixed price for the agreed scope. Estimated hours are used only for delivery planning.
              </p>

              <form onSubmit={handleUpdateProjectFee} className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65717a] text-xs">$</span>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    disabled={!isScopeEditable || updatingProjectFee}
                    value={newProjectFee}
                    onChange={(e) => setNewProjectFee(Number(e.target.value))}
                    aria-label="Fixed project fee in US dollars"
                    className="w-full pl-6 pr-3 py-1.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-slate-400 transition-colors disabled:opacity-60"
                  />
                </div>

                {newProjectFee !== project.finalTotalCost && newProjectFee > 0 && (
                  <div className="p-2.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-xs space-y-1">
                    <div className="flex justify-between items-center text-[#304756]">
                      <span className="font-sans text-[#65717a]">New fixed project quote:</span>
                      <span className="text-emerald-900 font-semibold">
                        ${newProjectFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#65717a] font-sans">
                      Milestone amounts and scope allocations will update with this price.
                    </div>
                  </div>
                )}

                {isScopeEditable && (
                  <button
                    type="submit"
                    disabled={updatingProjectFee || newProjectFee === project.finalTotalCost || newProjectFee <= 0}
                    className="w-full py-1.5 px-3 rounded-md bg-[#edf1ef] hover:bg-[#e3ebe8] text-xs font-medium text-[#263d4a] border border-[#d5deda] transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    {updatingProjectFee ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    <span>Update project quote</span>
                  </button>
                )}
              </form>
            </div>

            {/* Audit Trail */}
            <div className="rounded-lg border border-[#d5deda] bg-[#ffffff] p-4 space-y-2.5 text-xs">
              <h3 className="font-medium text-xs text-[#263d4a]">
                Audit trail
              </h3>

              <div className="space-y-1.5 text-[#526270] font-sans">
                <div className="flex justify-between py-1 border-b border-[#d5deda]">
                  <span>Created by:</span>
                  <span className="text-[#263d4a] font-medium">{project.createdBy?.name || 'Estimator'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#d5deda]">
                  <span>Created date:</span>
                  <span className="text-[#263d4a]">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.reviewedBy && (
                  <div className="flex justify-between py-1 border-b border-[#d5deda]">
                    <span>Reviewed by:</span>
                    <span className="text-[#263d4a] font-medium">{project.reviewedBy.name}</span>
                  </div>
                )}
              </div>

              {project.status === 'REJECTED' && project.rejectionReason && (
                <div className="p-2.5 rounded-md bg-rose-100 border border-rose-300 text-rose-900 space-y-1">
                  <span className="text-xs font-semibold text-rose-900 block">
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
            <label className="block text-xs font-medium text-[#304756] mb-1">Feature Name</label>
            <input
              type="text"
              required
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              placeholder="e.g. bKash Webhook Callback Handler"
              className="w-full px-3 py-1.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-[#168780] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[#304756] mb-1">Category</label>
              <select
                value={featureCategory}
                onChange={(e) => setFeatureCategory(e.target.value as FeatureCategory)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-[#168780] transition"
              >
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="DATABASE">DATABASE</option>
                <option value="INTEGRATION">INTEGRATION</option>
                <option value="AI">AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#304756] mb-1">Complexity</label>
              <select
                value={featureComplexity}
                onChange={(e) => setFeatureComplexity(e.target.value as FeatureComplexity)}
                className="w-full px-2.5 py-1.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-[#168780] transition"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#304756] mb-1">Estimated Hours</label>
            <input
              type="number"
              min={1}
              max={200}
              required
              value={featureHours}
              onChange={(e) => setFeatureHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-[#168780] transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded-md bg-[#edf1ef] border border-[#d5deda] text-xs font-medium text-[#304756] hover:bg-[#e3ebe8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingFeature}
              className="px-3.5 py-1.5 rounded-md bg-[#173f52] hover:bg-[#102f3e] text-xs font-medium text-white flex items-center gap-1.5"
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
        <p className="text-xs text-[#526270]">
          State reason for rejection (minimum 10 characters).
        </p>

        <textarea
          rows={3}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Scope buffer seems low for payment integration, or hours estimated are insufficient..."
          className="w-full px-3 py-2 rounded-md bg-[#f7f7f4] border border-[#d5deda] text-[#182b39] text-xs focus:outline-none focus:border-rose-500 transition resize-none"
        />

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(false)}
            className="px-3 py-1.5 rounded-md bg-[#edf1ef] border border-[#d5deda] text-xs font-medium text-[#304756]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={actionLoading || rejectionReason.trim().length < 10}
            onClick={() => handleStatusChange('REJECTED', rejectionReason)}
            className="px-3.5 py-1.5 rounded-md bg-rose-700 hover:bg-rose-800 text-xs font-medium text-white flex items-center gap-1.5 disabled:opacity-60"
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
        <div className="space-y-3 text-xs leading-relaxed text-[#304756]">
          <div className="p-3 rounded-md bg-[#f7f7f4] border border-[#d5deda]">
            <span className="font-semibold text-[#263d4a] block mb-1">
              1. Input Parameters
            </span>
            <p className="text-[#526270]">
              Project title and raw natural language description. Effort and contingency are used to prepare a planning baseline for the fixed project quote.
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#f7f7f4] border border-[#d5deda]">
            <span className="font-semibold text-[#263d4a] block mb-1">
              2. Generated Outputs &amp; Metrics
            </span>
            <p className="text-[#526270]">
              Automated risk tiers (LOW 5%, MEDIUM 12%, HIGH 20%), module breakdown with hours, curated tech stack, and rounding-safe 30%-40%-30% milestones.
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#f7f7f4] border border-[#d5deda]">
            <span className="font-semibold text-[#263d4a] block mb-1">
              3. Limitations &amp; Fallback
            </span>
            <p className="text-[#526270]">
              Provides architectural baseline; proprietary on-premise hardware or compliance audits may require manual scoping. System includes an offline deterministic rule engine fallback for zero downtime.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => setIsEvalModalOpen(false)}
            className="px-3 py-1.5 rounded-md bg-[#edf1ef] hover:bg-[#e3ebe8] border border-[#d5deda] text-xs font-medium text-[#263d4a]"
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
        <div className="min-h-screen bg-[#f7f7f4] flex items-center justify-center text-[#526270]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ProjectWorkspaceContent />
    </React.Suspense>
  );
}
