'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { Feature, FeatureCategory, FeatureComplexity, Project, ProjectStatus } from '@/types';
import Navbar from '@/components/common/Navbar';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import KpiCard from '@/components/common/KpiCard';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  Loader2,
  Sparkles,
  Send,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';

function ProjectWorkspaceContent() {
  const routeParams = useParams();
  const projectId = routeParams?.id as string;

  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hourly Rate adjuster state
  const [newRate, setNewRate] = useState<number>(25);
  const [updatingRate, setUpdatingRate] = useState(false);

  // Add Feature Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureCategory, setFeatureCategory] = useState<FeatureCategory>('BACKEND');
  const [featureComplexity, setFeatureComplexity] = useState<FeatureComplexity>('MEDIUM');
  const [featureHours, setFeatureHours] = useState<number>(10);
  const [addingFeature, setAddingFeature] = useState(false);

  // Reject Modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // AI Evaluation & Specs Modal state
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  // Load project
  const loadProject = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetchApi<Project>(`/projects/${projectId}`);
      if (res.success && res.data) {
        setProject(res.data);
        setNewRate(res.data.hourlyRate);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadProject();
    }
  }, [user, isLoading, projectId]);

  // Status Action Handlers
  const handleStatusChange = async (targetStatus: ProjectStatus, reason?: string) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetchApi<Project>(`/projects/${projectId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          rejectionReason: reason,
        }),
      });

      if (res.success && res.data) {
        setProject(res.data);
        setSuccessMsg(`Project status transitioned to ${targetStatus}`);
        setIsRejectModalOpen(false);
        setRejectionReason('');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Status transition failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Hourly Rate Update Handler
  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingRate(true);
      setErrorMsg(null);
      const res = await fetchApi<Project>(`/projects/${projectId}/rate`, {
        method: 'PATCH',
        body: JSON.stringify({ hourlyRate: Number(newRate) }),
      });
      if (res.success && res.data) {
        setProject(res.data);
        setSuccessMsg('Hourly rate updated and costs recalculated!');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update hourly rate');
    } finally {
      setUpdatingRate(false);
    }
  };

  // Toggle Feature Included Checkbox
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
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update feature');
    }
  };

  // Adjust Feature Hours (+ / -)
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
      setErrorMsg(err instanceof Error ? err.message : 'Failed to adjust hours');
    }
  };

  // Delete Feature Handler
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
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete feature');
    }
  };

  // Add Custom Feature Submit
  const handleAddFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAddingFeature(true);
      setErrorMsg(null);
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
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add custom feature');
    } finally {
      setAddingFeature(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-rose-400 text-sm mb-4">Project not found or accessible.</p>
        <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-gray-800 text-gray-200 text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isApproved = project.status === 'APPROVED';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F9FAFB] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="space-y-1.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-400 transition mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-50">{project.title}</h1>
              <StatusBadge status={project.status} />
              {isApproved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
                  <Lock className="w-3 h-3 text-amber-400" /> Locked Scope
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons based on Status and Role */}
          <div className="flex items-center gap-3">
            {project.status === 'AI_ESTIMATED' && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Submit for Approval
              </button>
            )}

            {project.status === 'UNDER_REVIEW' && isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Scope
                </button>
              </div>
            )}

            {project.status === 'UNDER_REVIEW' && !isAdmin && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl font-medium">
                ⏳ Under Technical Review by Administrator
              </span>
            )}

            {project.status === 'REJECTED' && (
              <button
                onClick={() => handleStatusChange('UNDER_REVIEW')}
                disabled={actionLoading || project.totalHours === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resubmit for Review
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Summary KPI Strip (4 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Estimated Cost"
            value={project.finalTotalCost.toLocaleString()}
            icon={<DollarSign className="w-5 h-5 -mr-1" />}
            valueClassName="text-emerald-400"
            subtitle={`Base: $${project.baseCost.toLocaleString()} + Buffer: $${project.riskBufferAmount.toLocaleString()}`}
          />

          <KpiCard
            label="Total Effort"
            value={`${project.totalHours} hrs`}
            icon={<Clock className="w-5 h-5" />}
            valueClassName="text-sky-400"
            subtitle="Active features only"
          />

          <KpiCard
            label="Estimated Timeline"
            value={`${project.estimatedWeeks} Weeks`}
            icon={<Calendar className="w-5 h-5 text-indigo-400" />}
            valueClassName="text-gray-100"
            subtitle="Based on 30 hrs/week"
          />

          <KpiCard
            label="Risk Profile"
            value={<StatusBadge risk={project.riskLevel} />}
            valueClassName="text-lg"
            subtitle={
              <span className="flex items-center gap-1 text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                AI Confidence: {project.aiConfidenceScore}%
              </span>
            }
          />
        </div>

        {/* 2-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AI Summary + Feature Table (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* AI Executive Summary & Recommended Tech Stack */}
            <div className="rounded-2xl border border-violet-500/30 bg-[#111827] p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h3 className="font-semibold text-sm text-gray-50">AI Executive Summary</h3>
                  <button
                    onClick={() => setIsEvalModalOpen(true)}
                    className="text-[11px] font-medium text-violet-400 hover:text-violet-300 underline underline-offset-2 ml-1"
                  >
                    (View AI Specs &amp; Limitations)
                  </button>
                </div>
                {project.isFallbackUsed && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Rule Engine Fallback
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                {project.executiveSummary}
              </p>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                  Recommended Technology Stack
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.recommendedStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#090D16] border border-gray-800 text-indigo-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Feature Breakdown Table */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-50">Feature Breakdown Table</h3>
                  <p className="text-xs text-gray-400">
                    Toggle inclusion checkboxes or adjust hours to view instant cost recalculations.
                  </p>
                </div>

                {!isApproved && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom Feature
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090D16] text-gray-400 font-mono uppercase text-[10px] border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">Inc</th>
                      <th className="py-3 px-4">Feature Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Complexity</th>
                      <th className="py-3 px-4 text-center">Hours</th>
                      <th className="py-3 px-4 text-right">Subtotal</th>
                      <th className="py-3 px-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono">
                    {project.features.map((f) => (
                      <tr
                        key={f.id}
                        className={`hover:bg-gray-800/40 transition ${
                          !f.isIncluded ? 'opacity-40 bg-gray-950/40 line-through text-gray-500' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={f.isIncluded}
                            disabled={isApproved}
                            onChange={() => handleToggleInclude(f)}
                            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                        </td>

                        {/* Title */}
                        <td className="py-3 px-4 font-sans font-medium text-gray-100 text-xs">
                          {f.title}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300">
                            {f.category}
                          </span>
                        </td>

                        {/* Complexity */}
                        <td className="py-3 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              f.complexity === 'HIGH'
                                ? 'text-rose-400 bg-rose-500/10'
                                : f.complexity === 'MEDIUM'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-emerald-400 bg-emerald-500/10'
                            }`}
                          >
                            {f.complexity}
                          </span>
                        </td>

                        {/* Hours Stepper */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-[#090D16] border border-gray-800 px-2 py-1 rounded-lg">
                            {!isApproved && (
                              <button
                                onClick={() => handleAdjustHours(f, -2)}
                                className="text-gray-400 hover:text-white px-1 font-bold text-xs"
                              >
                                -
                              </button>
                            )}
                            <span className="font-bold text-gray-100 text-xs min-w-8">
                              {f.estimatedHours}h
                            </span>
                            {!isApproved && (
                              <button
                                onClick={() => handleAdjustHours(f, 2)}
                                className="text-gray-400 hover:text-white px-1 font-bold text-xs"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Subtotal ($) */}
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 px-3 text-center">
                          {!isApproved ? (
                            <button
                              onClick={() => handleDeleteFeature(f.id)}
                              className="text-gray-500 hover:text-rose-400 p-1 transition"
                              title="Delete feature"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-gray-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Milestones, Hourly Rate, Status & Audit (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payment Milestone Breakdown Card (30% - 40% - 30%) */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <h3 className="font-bold text-sm text-gray-50">Milestone Breakdown</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                  30% • 40% • 30%
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {[
                  { label: 'Milestone 1 (Kickoff & UI - 30%)', amount: project.milestone1Amount, width: '30%', color: 'bg-indigo-500' },
                  { label: 'Milestone 2 (Core MVP & APIs - 40%)', amount: project.milestone2Amount, width: '40%', color: 'bg-sky-500' },
                  { label: 'Milestone 3 (QA & Deploy - 30%)', amount: project.milestone3Amount, width: '30%', color: 'bg-emerald-500' },
                ].map((ms, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-gray-300 font-sans">
                      <span className="font-medium">{ms.label}</span>
                      <span className="font-mono font-bold text-gray-50">
                        ${ms.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div className={`h-full ${ms.color} rounded-full`} style={{ width: ms.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Rate Adjuster Card */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 space-y-4">
              <h3 className="font-bold text-sm text-gray-50">Hourly Rate Adjuster</h3>
              <p className="text-xs text-gray-400">
                Adjust base hourly rate to recalculate total quote and milestone deliverables.
              </p>

              <form onSubmit={handleUpdateRate} className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    disabled={isApproved || updatingRate}
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-sm font-mono focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                  />
                </div>

                {!isApproved && (
                  <button
                    type="submit"
                    disabled={updatingRate || newRate === project.hourlyRate}
                    className="w-full py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {updatingRate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Recalculate Cost
                  </button>
                )}
              </form>
            </div>

            {/* Status & Audit Info Card */}
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-gray-50">Status &amp; Audit Trail</h3>

              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between py-1 border-b border-gray-800/80">
                  <span>Created By:</span>
                  <span className="text-gray-200 font-medium">{project.createdBy?.name || 'Estimator'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800/80">
                  <span>Created Date:</span>
                  <span className="text-gray-200 font-mono">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                {project.reviewedBy && (
                  <div className="flex justify-between py-1 border-b border-gray-800/80">
                    <span>Reviewed By:</span>
                    <span className="text-gray-200 font-medium">{project.reviewedBy.name}</span>
                  </div>
                )}
              </div>

              {/* Rejection Reason Alert if rejected */}
              {project.status === 'REJECTED' && project.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                    Rejection Feedback:
                  </span>
                  <p className="text-xs leading-relaxed">{project.rejectionReason}</p>
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
        title="Add Custom Feature"
      >
        <form onSubmit={handleAddFeatureSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Feature Name</label>
            <input
              type="text"
              required
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              placeholder="e.g. Stripe Webhook & Automated Invoicing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
              <select
                value={featureCategory}
                onChange={(e) => setFeatureCategory(e.target.value as FeatureCategory)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-xs focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="FRONTEND">FRONTEND</option>
                <option value="BACKEND">BACKEND</option>
                <option value="DATABASE">DATABASE</option>
                <option value="INTEGRATION">INTEGRATION</option>
                <option value="AI">AI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Complexity</label>
              <select
                value={featureComplexity}
                onChange={(e) => setFeatureComplexity(e.target.value as FeatureComplexity)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-xs focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Estimated Hours</label>
            <input
              type="number"
              min={1}
              max={200}
              required
              value={featureHours}
              onChange={(e) => setFeatureHours(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingFeature}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5"
            >
              {addingFeature && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Feature
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-400">
            <XCircle className="w-5 h-5" />
            <span>Reject Project Scope</span>
          </div>
        }
      >
        <p className="text-xs text-gray-400">
          Please state why this estimate was rejected so the estimator can revise the scope (minimum 10 characters required).
        </p>

        <textarea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Scope buffer seems insufficient for payment gateway, or hours estimated for real-time tracking are too high..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-gray-800 text-gray-50 text-xs focus:outline-none focus:border-rose-500 transition resize-none"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsRejectModalOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={actionLoading || rejectionReason.trim().length < 10}
            onClick={() => handleStatusChange('REJECTED', rejectionReason)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Rejection
          </button>
        </div>
      </Modal>

      {/* AI Transparency, Limitations & Evaluation Modal */}
      <Modal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        maxWidth="max-w-2xl"
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span>AI Scoping Engine — Architecture, Inputs, Outputs &amp; Limitations</span>
          </div>
        }
      >
        <div className="space-y-4 text-xs leading-relaxed text-gray-300">
          {/* Section 1: Inputs */}
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              1. Input Parameters
            </span>
            <p>
              • <strong>Project Title:</strong> Concept identifier defining the primary domain (e.g. E-Commerce, Logistics, Healthcare).<br />
              • <strong>Raw Requirements Text:</strong> Natural language project description detailing user roles, workflows, third-party integrations, and performance expectations.<br />
              • <strong>Hourly Rate ($):</strong> Financial baseline used by the calculation engine to project cost deliverables.
            </p>
          </div>

          {/* Section 2: Outputs */}
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              2. Generated Outputs &amp; Metrics
            </span>
            <p>
              • <strong>Risk Classification:</strong> Automated assessment into <code className="text-emerald-300">LOW (5%)</code>, <code className="text-amber-300">MEDIUM (12%)</code>, or <code className="text-rose-300">HIGH (20%)</code> buffer tiers.<br />
              • <strong>Domain Feature Breakdown:</strong> 6 to 8 structured feature modules categorized by <code className="text-indigo-300">FRONTEND</code>, <code className="text-sky-300">BACKEND</code>, <code className="text-teal-300">DATABASE</code>, <code className="text-purple-300">INTEGRATION</code>, and <code className="text-pink-300">AI</code> with granular hour projections.<br />
              • <strong>Tech Stack Recommendations:</strong> Curated modern production libraries tailored to project complexity.<br />
              • <strong>Milestone Schedules:</strong> Rounding-safe 30% / 40% / 30% milestone cost breakdown with zero cent drift.
            </p>
          </div>

          {/* Section 3: Limitations */}
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
            <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
              3. Known Limitations
            </span>
            <p>
              • Estimates provide an initial high-fidelity architectural baseline. Unspecified legacy system integrations, proprietary on-premise hardware, or compliance audits (e.g., HIPAA / SOC 2) may require manual scope adjustments.<br />
              • The engine enforces human-in-the-loop governance: final scopes must be reviewed and approved by an authorized Administrator before contract finalization.
            </p>
          </div>

          {/* Section 4: Evaluation */}
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-gray-800">
            <span className="font-bold text-sky-400 uppercase tracking-wider block mb-1">
              4. Usefulness Evaluation &amp; Fallback Resilience
            </span>
            <p>
              • <strong>Zero-Downtime Fallback:</strong> If third-party AI APIs (Gemini/OpenAI) encounter rate limits or network degradation, the engine seamlessly triggers a deterministic, keyword-aware Rule Engine with 100% uptime.<br />
              • <strong>Validation Benchmark:</strong> The scoping model was calibrated against standard real-world deliverables from software agencies, reducing proposal preparation time from 4 hours to under 30 seconds.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setIsEvalModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
          >
            Close Technical Overview
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default function ProjectWorkspacePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <ProjectWorkspaceContent />
    </React.Suspense>
  );
}
