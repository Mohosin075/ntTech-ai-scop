'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldCheck, Cpu, Code2 } from 'lucide-react';

interface AiSynthesisModalProps {
  isOpen: boolean;
  projectTitle: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Domain Semantics & Natural Language Requirement Parsing',
    desc: 'Extracting user entities, workflow boundaries, and integration touchpoints...',
    icon: <Sparkles className="w-4 h-4 text-violet-400" />,
  },
  {
    id: 2,
    title: 'Complexity Matrix & Risk Surface Assessment',
    desc: 'Calculating compliance exposure and calibrating 5%/12%/20% contingency buffer...',
    icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 3,
    title: 'Architectural Module Decomposition & Hours Synthesis',
    desc: 'Structuring granular features across Frontend, Backend, DB, AI, and Integrations...',
    icon: <Code2 className="w-4 h-4 text-indigo-400" />,
  },
  {
    id: 4,
    title: 'Financial Formulation & Zero-Drift Milestone Allocation',
    desc: 'Packaging 30%-40%-30% deliverables schedule and technical tech stack stack...',
    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
  },
];

export const AiSynthesisModal: React.FC<AiSynthesisModalProps> = ({
  isOpen,
  projectTitle,
}) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setActiveStep(1);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-violet-500/40 bg-[#111827] p-7 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-50 flex items-center gap-2">
              <span>ScopeAI Synthesis Engine</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-gray-400 line-clamp-1">
              Scoping: <span className="text-gray-200 font-semibold">{projectTitle || 'Software Project'}</span>
            </p>
          </div>
        </div>

        {/* Step Progress Checklist */}
        <div className="space-y-3.5">
          {STEPS.map((step) => {
            const isCompleted = activeStep > step.id;
            const isCurrent = activeStep === step.id;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10'
                    : isCompleted
                    ? 'bg-[#090D16] border-gray-800 opacity-90'
                    : 'bg-[#090D16]/40 border-gray-900 opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-700 flex items-center justify-center text-[9px] font-mono text-gray-500">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-violet-300'
                        : isCompleted
                        ? 'text-gray-200'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status text */}
        <div className="pt-2 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            Generating enterprise scope deliverables...
          </span>
          <span className="font-mono text-[11px] text-violet-400 font-bold">
            Step {Math.min(activeStep, 4)} of 4
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiSynthesisModal;
