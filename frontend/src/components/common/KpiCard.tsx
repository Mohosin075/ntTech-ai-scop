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
    <div className={`border-l-2 border-l-zinc-700 bg-zinc-900/40 pl-3.5 pr-3 py-2.5 transition-colors font-mono ${className}`}>
      <span className="text-xs text-zinc-400 font-sans block mb-1">
        {label}
      </span>
      <div className={`text-lg font-semibold tracking-tight flex items-center gap-1.5 ${valueClassName}`}>
        {icon}
        {value}
      </div>
      {subtitle && <div className="text-xs text-zinc-500 mt-1 font-sans">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
