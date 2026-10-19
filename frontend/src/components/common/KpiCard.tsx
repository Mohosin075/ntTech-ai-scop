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
  valueClassName = 'text-[#182b39]',
  className = '',
}) => {
  return (
    <div className={`rounded-xl border border-[#d5deda] bg-white p-4 transition-all hover:border-[#a9c1bb] ${className}`}>
      <div className="flex items-center justify-between text-sm text-[#526270] font-sans mb-2">
        <span>{label}</span>
        {icon && <span className="text-[#65717a]">{icon}</span>}
      </div>
      <div className={`text-2xl sm:text-3xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </div>
      {subtitle && <div className="text-sm text-[#65717a] mt-1.5 font-sans">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
