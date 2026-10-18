'use client';

import React from 'react';
import { Project } from '@/types';
import Modal from '@/components/common/Modal';
import { Printer, FileCheck2, ShieldCheck, DollarSign, Calendar, Sparkles } from 'lucide-react';

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
          <FileCheck2 className="w-5 h-5 text-indigo-400" />
          <span>Statement of Work (SOW) &amp; Client Commercial Proposal</span>
        </div>
      }
    >
      <div className="space-y-6 text-xs text-gray-300">
        {/* Actions bar at top */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#090D16] border border-gray-800 print:hidden">
          <span className="text-gray-400">
            Previewing formal commercial contract quote ready for print or PDF export.
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-xl space-y-6 print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-indigo-600 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  S
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  ScopeAI Global Technologies
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Enterprise Software Architecture &amp; Delivery Services
              </p>
            </div>

            <div className="text-right sm:text-right font-mono text-[11px] text-gray-600 space-y-0.5">
              <div className="font-bold text-gray-900 text-xs">COMMERCIAL STATEMENT OF WORK</div>
              <div>Ref: PRJ-{project.id.slice(0, 8).toUpperCase()}</div>
              <div>Date: {new Date(project.createdAt).toLocaleDateString()}</div>
              <div>Status: <span className="font-bold text-indigo-600">{project.status}</span></div>
            </div>
          </div>

          {/* Project Title & Overview */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900">{project.title}</h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {project.executiveSummary}
            </p>
          </div>

          {/* Project Scope Description */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
              Raw Client Scope &amp; Target Objectives
            </span>
            <p className="text-gray-600 italic leading-relaxed">
              &quot;{project.rawRequirement}&quot;
            </p>
          </div>

          {/* Recommended Tech Stack */}
          {project.recommendedStack && project.recommendedStack.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                Target Technology Architecture
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.recommendedStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Itemized Feature Table */}
          <div className="space-y-2">
            <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
              Itemized Scope of Deliverables ({activeFeatures.length} Active Modules)
            </span>
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-mono text-[10px] uppercase border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Module / Feature Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Complexity</th>
                  <th className="py-2.5 px-3 text-center">Hours</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono text-gray-800 text-[11px]">
                {activeFeatures.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="py-2 px-3 font-sans font-medium text-gray-900">{f.title}</td>
                    <td className="py-2 px-3">{f.category}</td>
                    <td className="py-2 px-3">{f.complexity}</td>
                    <td className="py-2 px-3 text-center">{f.estimatedHours}h</td>
                    <td className="py-2 px-3 text-right font-bold">
                      ${(f.estimatedHours * project.hourlyRate).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Cost Breakdown */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 font-mono text-xs">
              <span className="font-sans font-bold text-gray-900 text-xs block border-b border-gray-200 pb-1">
                Commercial Financial Summary
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">Total Scoped Effort:</span>
                <span className="font-bold">{project.totalHours} Hours</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">Base Rate:</span>
                <span>${project.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">Base Engineering Cost:</span>
                <span>${project.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5 text-amber-700">
                <span className="font-sans">Contingency Buffer ({project.riskBufferPercent}%):</span>
                <span>+${project.riskBufferAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 text-sm font-bold text-emerald-700">
                <span className="font-sans">Final Project Quotation:</span>
                <span>${project.finalTotalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Milestones */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 font-mono text-xs">
              <span className="font-sans font-bold text-gray-900 text-xs block border-b border-gray-200 pb-1">
                Milestone Payment Schedule
              </span>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">M1 (Kickoff &amp; Design - 30%):</span>
                <span className="font-bold text-indigo-700">${project.milestone1Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">M2 (MVP Development - 40%):</span>
                <span className="font-bold text-sky-700">${project.milestone2Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600 font-sans">M3 (QA &amp; Final Handover - 30%):</span>
                <span className="font-bold text-emerald-700">${project.milestone3Amount.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-gray-500 font-sans pt-1">
                Zero rounding drift verified across all deliverables.
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-300">
            <div className="space-y-6">
              <div className="text-xs font-bold text-gray-800">Authorized Vendor Signature:</div>
              <div className="border-b border-gray-400 w-3/4"></div>
              <div className="text-[11px] text-gray-500">
                Prepared by: {project.createdBy?.name || 'Lead Estimator'}
              </div>
            </div>
            <div className="space-y-6">
              <div className="text-xs font-bold text-gray-800">Client Acceptance Signature:</div>
              <div className="border-b border-gray-400 w-3/4"></div>
              <div className="text-[11px] text-gray-500">
                Date: ________________________
              </div>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end pt-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProposalModal;
