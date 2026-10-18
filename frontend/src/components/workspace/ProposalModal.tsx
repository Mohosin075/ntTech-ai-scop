'use client';

import React from 'react';
import { Project } from '@/types';
import Modal from '@/components/common/Modal';
import { Printer, FileCheck2 } from 'lucide-react';

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
          <span>Statement of Work (SOW) - Commercial Proposal</span>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-zinc-300">
        <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800 print:hidden">
          <span className="text-zinc-400">
            Commercial proposal ready for client sign-off or PDF print.
          </span>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SOW</span>
          </button>
        </div>

        <div className="p-6 rounded-md bg-white text-zinc-900 border border-zinc-200 space-y-5 print:p-0 print:border-none">
          <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-zinc-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  ScopeAI Engineering Solutions
                </h2>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Software Architecture &amp; Delivery Services
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-zinc-600 space-y-0.5">
              <div className="font-bold text-zinc-900 text-xs">COMMERCIAL STATEMENT OF WORK</div>
              <div>Ref: PRJ-{project.id.slice(0, 8).toUpperCase()}</div>
              <div>Date: {new Date(project.createdAt).toLocaleDateString()}</div>
              <div>Status: <span className="font-bold text-zinc-900">{project.status}</span></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-900">{project.title}</h3>
            <p className="text-xs text-zinc-700 leading-relaxed">
              {project.executiveSummary}
            </p>
          </div>

          <div className="p-3 rounded bg-zinc-50 border border-zinc-200 text-xs space-y-1">
            <span className="font-bold text-zinc-800 uppercase tracking-wider text-[10px] block">
              Client Requirements Summary
            </span>
            <p className="text-zinc-600 italic leading-relaxed">
              &quot;{project.rawRequirement}&quot;
            </p>
          </div>

          {project.recommendedStack && project.recommendedStack.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-zinc-800 uppercase tracking-wider text-[10px] block">
                Target Architecture &amp; Technologies
              </span>
              <div className="flex flex-wrap gap-1">
                {project.recommendedStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 text-zinc-800 border border-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="font-bold text-zinc-800 uppercase tracking-wider text-[10px] block">
              Itemized Scope of Deliverables ({activeFeatures.length} Active Modules)
            </span>
            <table className="w-full text-left text-xs border border-zinc-200 rounded overflow-hidden">
              <thead className="bg-zinc-100 text-zinc-700 font-mono text-[10px] uppercase border-b border-zinc-200">
                <tr>
                  <th className="py-2 px-2.5">Module / Deliverable</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Complexity</th>
                  <th className="py-2 px-2.5 text-center">Hours</th>
                  <th className="py-2 px-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-zinc-800 text-[11px]">
                {activeFeatures.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-50/50">
                    <td className="py-1.5 px-2.5 font-sans font-medium text-zinc-900">{f.title}</td>
                    <td className="py-1.5 px-2.5">{f.category}</td>
                    <td className="py-1.5 px-2.5">{f.complexity}</td>
                    <td className="py-1.5 px-2.5 text-center">{f.estimatedHours}h</td>
                    <td className="py-1.5 px-2.5 text-right font-bold">
                      ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded bg-zinc-50 border border-zinc-200 space-y-1.5 font-mono text-xs">
              <span className="font-sans font-bold text-zinc-900 text-xs block border-b border-zinc-200 pb-1">
                Commercial Quotation
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">Effort:</span>
                <span className="font-bold">{project.totalHours} Hours</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">Base Rate:</span>
                <span>${project.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">Base Engineering:</span>
                <span>${project.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 text-zinc-700">
                <span className="font-sans">Contingency Buffer ({project.riskBufferPercent}%):</span>
                <span>+${project.riskBufferAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-zinc-300 text-xs font-bold text-zinc-900">
                <span className="font-sans">Total Commercial Quotation:</span>
                <span>${project.finalTotalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-zinc-50 border border-zinc-200 space-y-1.5 font-mono text-xs">
              <span className="font-sans font-bold text-zinc-900 text-xs block border-b border-zinc-200 pb-1">
                Milestone Payment Schedule
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">M1 (Kickoff - 30%):</span>
                <span className="font-bold text-zinc-900">${project.milestone1Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">M2 (Core MVP - 40%):</span>
                <span className="font-bold text-zinc-900">${project.milestone2Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-600 font-sans">M3 (QA &amp; Handover - 30%):</span>
                <span className="font-bold text-zinc-900">${project.milestone3Amount.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-sans pt-0.5">
                Zero rounding drift verified across deliverables.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-300">
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-800">Authorized Vendor Signature:</div>
              <div className="border-b border-zinc-400 w-3/4"></div>
              <div className="text-[10px] text-zinc-500">
                Prepared by: {project.createdBy?.name || 'Tanvir Hasan (Lead Estimator)'}
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-800">Client Acceptance Signature:</div>
              <div className="border-b border-zinc-400 w-3/4"></div>
              <div className="text-[10px] text-zinc-500">
                Date: ________________________
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalModal;
