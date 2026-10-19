'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { Printer, FileCheck2, Copy, Check, Layers3 } from 'lucide-react';

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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const activeFeatures = project.features.filter((f) => f.isIncluded);

  const handleCopyMarkdown = async () => {
    const text = `# Statement of Work: ${project.title}
Ref: PRJ-${project.id.slice(0, 8).toUpperCase()} | Date: ${new Date(project.createdAt).toLocaleDateString()}
Status: ${project.status}

## Executive Summary
${project.executiveSummary}

## Requirements Baseline
"${project.rawRequirement}"

## Target Stack
${project.recommendedStack?.join(', ') || 'N/A'}

## Deliverables (${activeFeatures.length} Modules)
${activeFeatures
  .map(
    (f) =>
      `- [x] **${f.title}** (${f.category} - ${f.complexity}): $${(
        f.estimatedHours * project.hourlyRate
      ).toLocaleString()}`
  )
  .join('\n')}

## Fixed Project Fee
- Feature allocations: $${project.baseCost.toLocaleString()}
- Scope contingency (${project.riskBufferPercent}%): +$${project.riskBufferAmount.toLocaleString()}
- **Total project fee: $${project.finalTotalCost.toLocaleString()}**

## Milestone Schedule
- M1 (Kickoff - 30%): $${project.milestone1Amount.toLocaleString()}
- M2 (Core MVP - 40%): $${project.milestone2Amount.toLocaleString()}
- M3 (QA & Handover - 30%): $${project.milestone3Amount.toLocaleString()}
`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('SOW Markdown copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-900" />
          <span>Statement of Work (SOW) — Commercial Proposal</span>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-[#304756]">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-[#f7f7f4] border border-[#d5deda] border-l-2 border-l-emerald-500 print:hidden">
          <div className="space-y-0.5">
            <span className="font-medium text-[#263d4a] block">
              Commercial Statement of Work (SOW)
            </span>
            <span className="text-[#65717a] text-xs">
              Executive architectural proposal ready for client sign-off, clipboard copy, or PDF export.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-[#edf1ef] hover:bg-[#d5deda] border border-[#d5deda] text-[#263d4a] font-medium rounded-md flex items-center gap-1.5 transition-colors text-xs"
              title="Copy SOW to clipboard in Markdown format"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5 text-[#526270]" />}
              <span>{copied ? 'Copied' : 'Copy SOW'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#173f52] hover:bg-[#102f3e] text-white font-medium rounded-md flex items-center gap-1.5 transition-colors text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print SOW</span>
            </button>
          </div>
        </div>

        {/* SOW Document Sheet */}
        <div className="rounded-lg border border-[#d5deda] bg-white p-6 sm:p-8 space-y-6 text-[#263d4a] print:p-0 print:border-none print:bg-white print:text-black">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-[#d5deda] gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-[#173f52] flex items-center justify-center text-[#8ed0c5]">
                  <Layers3 className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <h2 className="text-base font-semibold text-[#182b39] tracking-tight">
                  ScopeAI Engineering Solutions
                </h2>
              </div>
              <p className="text-xs text-[#65717a]">
                Software Architecture &amp; Delivery Services • Commercial Proposal
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-[#526270] space-y-1">
              <div className="font-semibold text-[#182b39]">Commercial Statement of Work</div>
              <div>Ref: <span className="text-[#263d4a]">PRJ-{project.id.slice(0, 8).toUpperCase()}</span></div>
              <div>Date: <span className="text-[#263d4a]">{new Date(project.createdAt).toLocaleDateString()}</span></div>
              <div className="flex items-center sm:justify-end gap-1.5 pt-0.5">
                <span>Status:</span>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Project Title & Executive Summary */}
          <div className="space-y-2">
            <div className="text-xs text-emerald-900 uppercase tracking-wide">
              Engagement Scope
            </div>
            <h3 className="text-lg font-semibold text-[#182b39] tracking-tight">
              {project.title}
            </h3>
            <p className="text-xs text-[#304756] leading-relaxed font-sans">
              {project.executiveSummary}
            </p>
          </div>

          {/* Client Requirements Summary */}
          <div className="p-3.5 rounded-md bg-[#ffffff] border border-[#d5deda] space-y-1 text-xs">
            <span className="font-medium text-[#304756] block">
              Client requirements baseline
            </span>
            <p className="text-[#526270] italic leading-relaxed font-sans">
              &quot;{project.rawRequirement}&quot;
            </p>
          </div>

          {/* Tech Stack */}
          {project.recommendedStack && project.recommendedStack.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-[#304756] text-xs block">
                Target architecture &amp; technical stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.recommendedStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs bg-[#edf1ef] text-[#304756] border border-[#d5deda] rounded-md"
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
              <span className="font-medium text-[#304756] text-xs">
                Itemized deliverables ({activeFeatures.length} active modules)
              </span>
              <span className="text-xs text-[#65717a]">
                Fixed-fee deliverables
              </span>
            </div>

            <div className="border border-[#d5deda] rounded-md overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#edf1ef] text-[#526270] font-sans text-xs border-b border-[#d5deda]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Deliverable</th>
                    <th className="py-2.5 px-2.5 font-medium">Category</th>
                    <th className="py-2.5 px-2.5 font-medium">Complexity</th>
                    <th className="py-2.5 px-3 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d5deda] text-xs">
                  {activeFeatures.map((f) => (
                    <tr key={f.id} className="hover:bg-[#edf1ef]/40 transition-colors">
                      <td className="py-2 px-3 font-sans font-medium text-[#182b39]">{f.title}</td>
                      <td className="py-2 px-2.5 font-sans">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-[#edf1ef] border border-[#d5deda] text-[#526270]">
                          {f.category.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-sans">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs border ${
                            f.complexity === 'HIGH'
                              ? 'text-rose-900 border-rose-300 bg-rose-100'
                              : f.complexity === 'MEDIUM'
                              ? 'text-amber-900 border-amber-300 bg-amber-100'
                              : 'text-emerald-900 border-emerald-300 bg-emerald-100'
                          }`}
                        >
                          {f.complexity.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-900">
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
            <div className="p-4 rounded-md bg-[#ffffff] border border-[#d5deda] space-y-2 text-xs">
              <span className="font-sans font-medium text-[#182b39] text-xs block border-b border-[#d5deda] pb-2">
                Fixed Project Fee
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Feature allocations:</span>
                <span className="font-medium text-[#263d4a]">${project.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Scope contingency ({project.riskBufferPercent}%):</span>
                <span className="font-medium text-[#263d4a]">+${project.riskBufferAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#d5deda] text-xs font-semibold">
                <span className="font-sans text-[#182b39]">Total project fee:</span>
                <span className="text-emerald-900 text-sm">${project.finalTotalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-md bg-[#ffffff] border border-[#d5deda] space-y-2 text-xs">
              <span className="font-sans font-medium text-[#182b39] text-xs block border-b border-[#d5deda] pb-2">
                Milestone Payment Schedule
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Milestone 1 (Kickoff - 30%):</span>
                <span className="font-semibold text-[#182b39]">${project.milestone1Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Milestone 2 (Core MVP - 40%):</span>
                <span className="font-semibold text-[#182b39]">${project.milestone2Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Milestone 3 (QA &amp; Handover - 30%):</span>
                <span className="font-semibold text-[#182b39]">${project.milestone3Amount.toLocaleString()}</span>
              </div>
              <div className="text-xs text-[#65717a] font-sans pt-1 border-t border-[#d5deda]">
                Deterministic allocation • Zero rounding drift verified.
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#d5deda]">
            <div className="p-3.5 rounded-md border border-dashed border-[#d5deda] space-y-3">
              <div className="text-xs font-medium text-[#304756]">Authorized Vendor Signature:</div>
              <div className="border-b border-[#d5deda] h-8"></div>
              <div className="text-xs text-[#65717a] font-sans">
                Prepared by: <span className="text-[#304756]">{project.createdBy?.name || 'Tanvir Hasan (Lead Estimator)'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-md border border-dashed border-[#d5deda] space-y-3">
              <div className="text-xs font-medium text-[#304756]">Client Acceptance Signature:</div>
              <div className="border-b border-[#d5deda] h-8"></div>
              <div className="text-xs text-[#65717a] font-sans">
                Date &amp; Sign: <span className="text-[#526270]">________________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-1 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#edf1ef] hover:bg-[#e3ebe8] border border-[#d5deda] text-xs font-medium text-[#304756] transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalModal;
