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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Under Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Rejected
          </span>
        );
      case 'AI_ESTIMATED':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            AI Estimated
          </span>
        );
    }
  }

  if (risk) {
    switch (risk) {
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}>
            Low Risk (5%)
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 ${className}`}>
            High Risk (20%)
          </span>
        );
      case 'MEDIUM':
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 ${className}`}>
            Medium Risk (12%)
          </span>
        );
    }
  }

  return null;
};

export default StatusBadge;
