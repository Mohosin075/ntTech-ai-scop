import React from 'react';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  valueClassName = 'text-gray-100',
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-gray-800 bg-[#111827] p-4 font-mono ${className}`}>
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
        {label}
      </span>
      <div className={`text-2xl font-bold flex items-center gap-1.5 ${valueClassName}`}>
        {icon}
        {value}
      </div>
      {subtitle && <div className="text-[11px] text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
