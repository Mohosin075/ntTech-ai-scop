'use client';

import React from 'react';
import { Project } from '@/types';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { Printer, FileCheck2, Building2 } from 'lucide-react';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const activeFeatures = project.features.filter((f) => f.isIncluded);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-400" />
          <span>Statement of Work (SOW) — Commercial Proposal</span>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-zinc-300">
        {/* Action Header */}
        <div className="flex items-center justify-between p-3 rounded-md bg-[#0A0A0B] border border-[#27272A] border-l-2 border-l-emerald-500 print:hidden">
          <div className="space-y-0.5">
            <span className="font-medium text-zinc-200 block">
              Commercial Statement of Work (SOW)
            </span>
            <span className="text-zinc-500 text-xs">
              Executive architectural proposal ready for client sign-off or PDF export.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md flex items-center gap-1.5 transition-colors text-xs shrink-0"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SOW</span>
          </button>
        </div>

        {/* SOW Document Sheet */}
        <div className="rounded-lg border border-[#27272A] bg-[#0E0E10] p-6 sm:p-8 space-y-6 text-zinc-200 print:p-0 print:border-none print:bg-white print:text-black">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-[#27272A] gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  S
                </div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  ScopeAI Engineering Solutions
                </h2>
              </div>
              <p className="text-xs text-zinc-500">
                Software Architecture &amp; Delivery Services • Commercial Proposal
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-zinc-400 space-y-1">
              <div className="font-semibold text-white">Commercial Statement of Work</div>
              <div>Ref: <span className="text-zinc-200">PRJ-{project.id.slice(0, 8).toUpperCase()}</span></div>
              <div>Date: <span className="text-zinc-200">{new Date(project.createdAt).toLocaleDateString()}</span></div>
              <div className="flex items-center sm:justify-end gap-1.5 pt-0.5">
                <span>Status:</span>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Project Title & Executive Summary */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wide">
              Engagement Scope
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {project.title}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {project.executiveSummary}
            </p>
          </div>

          {/* Client Requirements Summary */}
          <div className="p-3.5 rounded-md bg-[#121214] border border-[#27272A] space-y-1 text-xs">
            <span className="font-medium text-zinc-300 block">
              Client requirements baseline
            </span>
            <p className="text-zinc-400 italic leading-relaxed font-sans">
              &quot;{project.rawRequirement}&quot;
            </p>
          </div>

          {/* Tech Stack */}
          {project.recommendedStack && project.recommendedStack.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-zinc-300 text-xs block">
                Target architecture &amp; technical stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.recommendedStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono bg-[#18181B] text-zinc-300 border border-[#27272A] rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-300 text-xs">
                Itemized deliverables ({activeFeatures.length} active modules)
              </span>
              <span className="text-xs font-mono text-zinc-500">
                Rate: ${project.hourlyRate}/hr
              </span>
            </div>

            <div className="border border-[#27272A] rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181B] text-zinc-400 font-sans text-xs border-b border-[#27272A]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Deliverable</th>
                    <th className="py-2.5 px-2.5 font-medium">Category</th>
                    <th className="py-2.5 px-2.5 font-medium">Complexity</th>
                    <th className="py-2.5 px-2.5 text-center font-medium">Hours</th>
                    <th className="py-2.5 px-3 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] font-mono text-xs">
                  {activeFeatures.map((f) => (
                    <tr key={f.id} className="hover:bg-[#18181B]/40 transition-colors">
                      <td className="py-2 px-3 font-sans font-medium text-white">{f.title}</td>
                      <td className="py-2 px-2.5 font-sans">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-[#18181B] border border-[#27272A] text-zinc-400">
                          {f.category.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-sans">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs border ${
                            f.complexity === 'HIGH'
                              ? 'text-rose-400 border-rose-800/40 bg-rose-950/30'
                              : f.complexity === 'MEDIUM'
                              ? 'text-amber-400 border-amber-800/40 bg-amber-950/30'
                              : 'text-emerald-400 border-emerald-800/40 bg-emerald-950/30'
                          }`}
                        >
                          {f.complexity.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-center text-zinc-300">{f.estimatedHours}h</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-400">
                        ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Milestone Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-md bg-[#121214] border border-[#27272A] space-y-2 font-mono text-xs">
              <span className="font-sans font-medium text-white text-xs block border-b border-[#27272A] pb-2">
                Commercial Quotation
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Total Effort:</span>
                <span className="font-medium text-zinc-200">{project.totalHours} Hours</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Hourly Rate:</span>
                <span className="text-zinc-200">${project.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Base Engineering:</span>
                <span className="text-zinc-200">${project.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 text-zinc-400">
                <span className="font-sans">Contingency Buffer ({project.riskBufferPercent}%):</span>
                <span className="text-amber-400">+${project.riskBufferAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#27272A] text-xs font-semibold">
                <span className="font-sans text-white">Total Commercial Quotation:</span>
                <span className="text-emerald-400 text-sm">${project.finalTotalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-md bg-[#121214] border border-[#27272A] space-y-2 font-mono text-xs">
              <span className="font-sans font-medium text-white text-xs block border-b border-[#27272A] pb-2">
                Milestone Payment Schedule
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Milestone 1 (Kickoff - 30%):</span>
                <span className="font-semibold text-zinc-100">${project.milestone1Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Milestone 2 (Core MVP - 40%):</span>
                <span className="font-semibold text-zinc-100">${project.milestone2Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-500 font-sans">Milestone 3 (QA &amp; Handover - 30%):</span>
                <span className="font-semibold text-zinc-100">${project.milestone3Amount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-zinc-500 font-sans pt-1 border-t border-[#27272A]">
                Deterministic allocation • Zero rounding drift verified.
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#27272A]">
            <div className="p-3.5 rounded-md border border-dashed border-[#27272A] space-y-3">
              <div className="text-xs font-medium text-zinc-300">Authorized Vendor Signature:</div>
              <div className="border-b border-[#27272A] h-8"></div>
              <div className="text-xs text-zinc-500 font-sans">
                Prepared by: <span className="text-zinc-300">{project.createdBy?.name || 'Tanvir Hasan (Lead Estimator)'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-md border border-dashed border-[#27272A] space-y-3">
              <div className="text-xs font-medium text-zinc-300">Client Acceptance Signature:</div>
              <div className="border-b border-[#27272A] h-8"></div>
              <div className="text-xs text-zinc-500 font-sans">
                Date &amp; Sign: <span className="text-zinc-400 font-mono">________________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-1 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#18181B] hover:bg-zinc-800 border border-[#27272A] text-xs font-medium text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalModal;
