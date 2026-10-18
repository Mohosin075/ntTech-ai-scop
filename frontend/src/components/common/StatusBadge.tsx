import React from 'react';
import { ProjectStatus, RiskLevel } from '@/types';

interface StatusBadgeProps {
  status?: ProjectStatus;
  risk?: RiskLevel;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, risk, className = '' }) => {
  if (status) {
    switch (status) {
      case 'APPROVED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/80 ${className}`}>
            <span className="w-1.5 h-1.5 bg-emerald-400"></span>
            approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono bg-amber-950/40 text-amber-400 border border-amber-800/80 ${className}`}>
            <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse"></span>
            under review
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono bg-rose-950/40 text-rose-400 border border-rose-800/80 ${className}`}>
            <span className="w-1.5 h-1.5 bg-rose-400"></span>
            rejected
          </span>
        );
      case 'AI_ESTIMATED':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-700 ${className}`}>
            <span className="w-1.5 h-1.5 bg-zinc-400"></span>
            ai estimated
          </span>
        );
    }
  }

  if (risk) {
    switch (risk) {
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/80 ${className}`}>
            low risk (5%)
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-rose-950/40 text-rose-400 border border-rose-800/80 ${className}`}>
            high risk (20%)
          </span>
        );
      case 'MEDIUM':
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-amber-950/40 text-amber-400 border border-amber-800/80 ${className}`}>
            medium risk (12%)
          </span>
        );
    }
  }

  return null;
};

export default StatusBadge;
