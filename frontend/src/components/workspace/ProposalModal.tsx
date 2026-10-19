'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/context/ToastContext';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
import { getFeatureAllocation } from '@/lib/scopePricing';
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

  const handlePrint = async () => {
    const sheet = document.querySelector<HTMLElement>('.sow-print-sheet');
    if (!sheet) {
      toast.error('The proposal content is not ready to print');
      return;
    }

    const frame = document.createElement('iframe');
    frame.title = 'Statement of Work print document';
    Object.assign(frame.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: '794px',
      height: '1123px',
      border: '0',
      visibility: 'visible',
    });
    document.body.appendChild(frame);

    const printDocument = frame.contentDocument;
    const printWindow = frame.contentWindow;
    if (!printDocument || !printWindow) {
      frame.remove();
      toast.error('Could not prepare the proposal for printing');
      return;
    }

    printDocument.open();
    printDocument.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Statement of Work</title></head><body></body></html>');
    printDocument.close();

    const stylesheetLoads = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => {
      const stylesheet = printDocument.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = link.href;
      const loaded = new Promise<void>((resolve) => {
        stylesheet.addEventListener('load', () => resolve(), { once: true });
        stylesheet.addEventListener('error', () => resolve(), { once: true });
        window.setTimeout(resolve, 2500);
      });
      printDocument.head.appendChild(stylesheet);
      return loaded;
    });
    document.querySelectorAll<HTMLStyleElement>('style').forEach((style) => {
      printDocument.head.appendChild(style.cloneNode(true));
    });

    const printStyles = printDocument.createElement('style');
    printStyles.textContent = `
      @page { size: A4 portrait; margin: 14mm 13mm; }
      html, body { margin: 0; min-height: 0; background: #fff; color: #182b39; }
      body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .sow-print-sheet { width: 100%; max-width: none; margin: 0; padding: 0 !important; overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: #fff !important; color: #182b39 !important; }
      .sow-print-sheet .text-xs { font-size: 10pt; line-height: 1.45; }
      .sow-print-sheet .text-sm { font-size: 12pt; }
      .sow-print-sheet .text-base { font-size: 16pt; }
      .sow-print-sheet .text-lg { font-size: 18pt; }
      .sow-print-sheet > :not(:first-child) { margin-top: 12pt !important; }
      .sow-print-sheet .sow-section, .sow-print-sheet tr, .sow-print-sheet thead { break-inside: avoid; page-break-inside: avoid; }
      .sow-print-sheet thead { display: table-header-group; }
      .sow-print-sheet table { width: 100% !important; min-width: 0 !important; border-collapse: collapse; }
      .sow-print-sheet th, .sow-print-sheet td { padding: 6px 8px !important; }
      .sow-print-sheet .overflow-x-auto { overflow: visible !important; }
      .sow-print-sheet .bg-emerald-100, .sow-print-sheet .bg-amber-100, .sow-print-sheet .bg-rose-100, .sow-print-sheet .bg-blue-100 { background: #f1f5f4 !important; }
      .sow-print-sheet .hidden.print\\:block { display: block !important; }
      .sow-print-sheet h2, .sow-print-sheet h3, .sow-print-sheet h4, .sow-print-sheet p, .sow-print-sheet span, .sow-print-sheet td, .sow-print-sheet th { color: #182b39; }
      .sow-print-sheet a { color: inherit; text-decoration: none; }
    `;
    printDocument.head.appendChild(printStyles);
    printDocument.body.innerHTML = sheet.outerHTML;

    const cleanup = () => window.setTimeout(() => frame.remove(), 1000);
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    try {
      await Promise.race([
        Promise.all(stylesheetLoads),
        new Promise<void>((resolve) => window.setTimeout(resolve, 3000)),
      ]);
      await printDocument.fonts.ready;
      printWindow.focus();
      printWindow.print();
    } catch {
      frame.remove();
      toast.error('Could not open the print preview');
    }
  };

  const activeFeatures = project.features.filter((f) => f.isIncluded);
  const projectTitle = formatProjectTitle(project.title);
  const projectReference = `PRJ-${project.id.slice(0, 8).toUpperCase()}`;
  const formattedDate = new Intl.DateTimeFormat('en-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(project.createdAt));
  const money = (amount: number) => `$${amount.toLocaleString('en-US')}`;

  const handleCopyMarkdown = async () => {
    const text = `# Statement of Work: ${projectTitle}
Reference: ${projectReference} | Prepared: ${formattedDate}
Status: ${project.status === 'AI_ESTIMATED' ? 'Draft estimate' : project.status === 'UNDER_REVIEW' ? 'In review' : project.status === 'APPROVED' ? 'Approved' : 'Changes requested'}

## Executive Summary
${project.executiveSummary}
Estimated delivery: about ${project.estimatedWeeks} ${project.estimatedWeeks === 1 ? 'week' : 'weeks'}

## Requirements Baseline
"${project.rawRequirement}"

## Target Stack
${project.recommendedStack?.join(', ') || 'N/A'}

## Deliverables (${activeFeatures.length} Modules)
${activeFeatures
  .map(
    (f) =>
      `- **${f.title}** (${f.category.toLowerCase()}, ${f.complexity.toLowerCase()}): $${getFeatureAllocation(f, project.scopePointValue).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  )
  .join('\n')}

## Fixed Project Fee
- Scoped deliverables: $${project.baseCost.toLocaleString()}
- Scope contingency (${project.riskBufferPercent}%): +$${project.riskBufferAmount.toLocaleString()}
- **Fixed project fee (USD): $${project.finalTotalCost.toLocaleString()}**

## Milestone Schedule
- M1 (Kickoff - 30%): $${project.milestone1Amount.toLocaleString()}
- M2 (Core MVP - 40%): $${project.milestone2Amount.toLocaleString()}
- M3 (QA & Handover - 30%): $${project.milestone3Amount.toLocaleString()}

## Scope and change control
This proposal covers only the deliverables listed above. Any additional requirements or changes to the agreed scope should be reviewed and approved in writing before work begins. The delivery schedule starts after kickoff and receipt of the access, content, and decisions needed from the client.
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
              Review the scope and fixed-fee schedule, then print or save this proposal as a PDF.
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
        <div className="sow-print-sheet rounded-2xl border border-[#d5deda] bg-white p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 text-[#263d4a] print:p-0 print:border-none print:bg-white print:text-black">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-4 sm:pb-5 border-b border-[#d5deda] gap-3.5 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-[#173f52] flex items-center justify-center text-[#8ed0c5]">
                  <Layers3 className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-[#182b39] tracking-tight">
                  ScopeAI
                </h2>
              </div>
              <p className="text-xs text-[#65717a]">
                Software delivery proposal
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-[#526270] space-y-1">
              <div className="font-semibold text-[#182b39]">Statement of Work</div>
              <div>Reference: <span className="text-[#263d4a]">{projectReference}</span></div>
              <div>Prepared: <span className="text-[#263d4a]">{formattedDate}</span></div>
              <div className="flex items-center sm:justify-end gap-1.5 pt-0.5">
                <span>Status:</span>
                <StatusBadge status={project.status} />
              </div>
            </div>
          </div>

          {/* Project Title & Executive Summary */}
          <div className="space-y-2">
            <div className="text-xs text-emerald-900 uppercase tracking-wide">
              Project scope
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-[#182b39] tracking-tight">
              {projectTitle}
            </h3>
            <p className="text-xs text-[#304756] leading-relaxed font-sans">
              {project.executiveSummary}
            </p>
            <p className="text-xs text-[#526270]">Estimated delivery: <strong className="font-semibold text-[#263d4a]">about {project.estimatedWeeks} {project.estimatedWeeks === 1 ? 'week' : 'weeks'}</strong></p>
          </div>

          {/* Client Requirements Summary */}
          <div className="p-3.5 rounded-md bg-[#ffffff] border border-[#d5deda] space-y-1 text-xs">
            <span className="font-medium text-[#304756] block">
              Requirements provided
            </span>
            <p className="text-[#526270] italic leading-relaxed font-sans">
              &quot;{project.rawRequirement}&quot;
            </p>
          </div>

          {/* Tech Stack */}
          {project.recommendedStack && project.recommendedStack.length > 0 && (
            <div className="space-y-2">
              <span className="font-medium text-[#304756] text-xs block">
                Proposed technology
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
                Included deliverables ({activeFeatures.length})
              </span>
              <span className="text-xs text-[#65717a]">
                Scope and fixed-fee allocation
              </span>
            </div>

            <div className="overflow-x-auto rounded-md border border-[#d5deda]">
              <table className="w-full min-w-[520px] text-left text-xs sow-deliverables-table">
                <thead className="bg-[#edf1ef] text-[#526270] font-sans text-xs border-b border-[#d5deda]">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Deliverable</th>
                    <th className="py-2.5 px-2.5 font-medium">Category</th>
                    <th className="py-2.5 px-2.5 font-medium">Complexity</th>
                    <th className="py-2.5 px-3 text-right font-medium">Allocation</th>
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
                      <td className="py-2 px-2.5 font-sans capitalize">{f.complexity.toLowerCase()}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-900">
                        {money(getFeatureAllocation(f, project.scopePointValue))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Milestone Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <div className="p-3 sm:p-4 rounded-xl bg-[#ffffff] border border-[#d5deda] space-y-2 text-xs">
              <span className="font-sans font-medium text-[#182b39] text-xs block border-b border-[#d5deda] pb-2">
                Fixed Project Fee · USD
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Scoped deliverables:</span>
                <span className="font-medium text-[#263d4a]">{money(project.baseCost)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Included scope contingency ({project.riskBufferPercent}%):</span>
                <span className="font-medium text-[#263d4a]">{money(project.riskBufferAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#d5deda] text-xs font-semibold">
                <span className="font-sans text-[#182b39]">Total project fee:</span>
                <span className="text-emerald-900 text-sm">{money(project.finalTotalCost)}</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[#ffffff] border border-[#d5deda] space-y-2 text-xs">
              <span className="font-sans font-medium text-[#182b39] text-xs block border-b border-[#d5deda] pb-2">
                Proposed payment schedule
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Kickoff · 30%</span>
                <span className="font-semibold text-[#182b39]">{money(project.milestone1Amount)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">Core delivery · 40%</span>
                <span className="font-semibold text-[#182b39]">{money(project.milestone2Amount)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#65717a] font-sans">QA &amp; handover · 30%</span>
                <span className="font-semibold text-[#182b39]">{money(project.milestone3Amount)}</span>
              </div>
              <div className="text-xs text-[#65717a] font-sans pt-1 border-t border-[#d5deda]">
                Proposed stages; final payment terms are subject to agreement.
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#d5deda]">
            <div className="p-3.5 rounded-md border border-dashed border-[#d5deda] space-y-3">
              <div className="text-xs font-medium text-[#304756]">Prepared and authorized by the vendor</div>
              <div className="border-b border-[#d5deda] h-8"></div>
              <div className="text-xs text-[#65717a] font-sans">
                Name: <span className="text-[#304756]">{project.createdBy?.name || 'Tanvir Hasan (Lead Estimator)'}</span>
              </div>
              <div className="text-xs text-[#65717a] font-sans">Date: ____________________</div>
            </div>

            <div className="p-3.5 rounded-md border border-dashed border-[#d5deda] space-y-3">
              <div className="text-xs font-medium text-[#304756]">Client acceptance</div>
              <p className="text-xs text-[#65717a]">Signing confirms agreement with the listed scope, fixed project fee, and proposed payment stages.</p>
              <div className="border-b border-[#d5deda] h-8"></div>
              <div className="text-xs text-[#65717a] font-sans">Name and title: ____________________</div>
              <div className="text-xs text-[#65717a] font-sans">Date: ____________________</div>
            </div>
          </div>

          <div className="sow-section border-t border-[#d5deda] pt-4 text-xs leading-relaxed">
            <h4 className="font-semibold text-[#182b39]">Scope and change control</h4>
            <p className="mt-1 text-[#526270]">This proposal covers the deliverables listed above. Any additional requirements or changes to the agreed scope should be reviewed and approved in writing before work begins. The delivery schedule starts after kickoff and once the access, content, and decisions needed from the client are available.</p>
          </div>

          <div className="hidden print:block border-t border-[#d5deda] pt-3 text-[10px] text-[#65717a]">
            {projectReference} · {projectTitle} · Prepared {formattedDate}
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
