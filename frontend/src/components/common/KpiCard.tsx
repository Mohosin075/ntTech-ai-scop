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
    <div className={`min-w-0 rounded-xl border border-[#d5deda] bg-white p-3 sm:p-4 transition-all hover:border-[#a9c1bb] ${className}`}>
      <div className="flex items-center justify-between text-xs sm:text-sm text-[#526270] font-sans mb-1.5 sm:mb-2">
        <span className="truncate">{label}</span>
        {icon && <span className="text-[#65717a] shrink-0 ml-1">{icon}</span>}
      </div>
      <div className={`text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight truncate ${valueClassName}`}>
        {value}
      </div>
      {subtitle && <div className="text-xs sm:text-sm text-[#65717a] mt-1 sm:mt-1.5 font-sans leading-tight">{subtitle}</div>}
    </div>
  );
};

export default KpiCard;
