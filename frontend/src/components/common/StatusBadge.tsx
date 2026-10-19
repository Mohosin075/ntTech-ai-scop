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
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span>
            In review
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
            Changes requested
          </span>
        );
      case 'AI_ESTIMATED':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
            Draft estimate
          </span>
        );
    }
  }

  if (risk) {
    switch (risk) {
      case 'LOW':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 ${className}`}>
            Low Risk (5%)
          </span>
        );
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300 ${className}`}>
            High Risk (20%)
          </span>
        );
      case 'MEDIUM':
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
            Medium Risk (12%)
          </span>
        );
    }
  }

  return null;
};

export default StatusBadge;
