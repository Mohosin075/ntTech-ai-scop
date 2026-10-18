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
  valueClassName = 'text-zinc-100',
  className = '',
}) => {
  return (
    <div className={`rounded-lg border border-zinc-800 bg-zinc-900 p-3.5 font-mono ${className}`}>
      <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">
        {label}
      </span>
      <div className={`text-xl font-bold flex items-center gap-1.5 ${valueClassName}`}>
        {icon}
        {value}
      </div>
      {subtitle && <div className="text-[11px] text-zinc-500 mt-1 font-sans">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
