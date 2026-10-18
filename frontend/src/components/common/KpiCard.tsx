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
    <div className={`rounded-lg border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700/80 ${className}`}>
      <div className="flex items-center justify-between text-xs text-zinc-400 font-sans mb-2">
        <span>{label}</span>
        {icon && <span className="text-zinc-500">{icon}</span>}
      </div>
      <div className={`text-xl font-semibold font-mono tracking-tight ${valueClassName}`}>
        {value}
      </div>
      {subtitle && <div className="text-xs text-zinc-500 mt-1.5 font-sans">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
