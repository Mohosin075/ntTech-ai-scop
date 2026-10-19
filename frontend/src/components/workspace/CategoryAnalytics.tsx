'use client';

import React, { useMemo } from 'react';
import { Feature, FeatureCategory } from '@/types';

interface CategoryAnalyticsProps {
  features: Feature[];
  hourlyRate: number;
}

const CATEGORY_COLORS: Record<FeatureCategory, { bar: string; badge: string }> = {
  FRONTEND: { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  BACKEND: { bar: 'bg-sky-500', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
  DATABASE: { bar: 'bg-teal-500', badge: 'bg-teal-100 text-teal-900 border-teal-300' },
  INTEGRATION: { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  AI: { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-900 border-violet-300' },
};

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  features,
  hourlyRate,
}) => {
  const activeFeatures = useMemo(
    () => features.filter((f) => f.isIncluded),
    [features]
  );

  const totalActiveHours = useMemo(
    () => activeFeatures.reduce((acc, f) => acc + f.estimatedHours, 0),
    [activeFeatures]
  );

  const distribution = useMemo(() => {
    const map: Record<FeatureCategory, { hours: number; count: number }> = {
      FRONTEND: { hours: 0, count: 0 },
      BACKEND: { hours: 0, count: 0 },
      DATABASE: { hours: 0, count: 0 },
      INTEGRATION: { hours: 0, count: 0 },
      AI: { hours: 0, count: 0 },
    };

    activeFeatures.forEach((f) => {
      if (map[f.category]) {
        map[f.category].hours += f.estimatedHours;
        map[f.category].count += 1;
      }
    });

    return Object.entries(map)
      .map(([cat, data]) => {
        const category = cat as FeatureCategory;
        const percentage =
          totalActiveHours > 0 ? Math.round((data.hours / totalActiveHours) * 100) : 0;
        const cost = data.hours * hourlyRate;
        return {
          category,
          ...data,
          percentage,
          cost,
          colors: CATEGORY_COLORS[category],
        };
      })
      .filter((item) => item.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  }, [activeFeatures, totalActiveHours, hourlyRate]);

  if (totalActiveHours === 0) return null;

  return (
    <div className="rounded-xl border border-[#d5deda] bg-white p-4 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#d5deda]">
        <div>
          <h3 className="font-medium text-xs text-[#263d4a]">
            Effort and cost distribution
          </h3>
          <p className="text-xs text-[#526270] font-sans">
            Workload distribution across architectural layers
          </p>
        </div>
        <span className="text-xs text-[#526270] bg-[#f7f7f4] border border-[#d5deda] px-2 py-0.5 rounded-md">
          {activeFeatures.length} modules • {totalActiveHours}h total
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-md bg-[#f7f7f4] overflow-hidden flex border border-[#d5deda]">
        {distribution.map((item) => (
          <div
            key={item.category}
            className={`h-full ${item.colors.bar}`}
            style={{ width: `${item.percentage}%` }}
            title={`${item.category}: ${item.hours}h (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {distribution.map((item) => (
          <div
            key={item.category}
            className="p-2.5 rounded-md bg-[#f7f7f4] border border-[#d5deda] space-y-1 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${item.colors.badge}`}>
                {item.category}
              </span>
              <span className="font-semibold text-[#304756] text-xs">
                {item.percentage}%
              </span>
            </div>

            <div className="pt-0.5">
              <div className="text-xs font-semibold text-[#182b39]">
                ${item.cost.toLocaleString()}
              </div>
              <div className="text-xs text-[#65717a] font-sans">
                {item.hours}h ({item.count} {item.count === 1 ? 'task' : 'tasks'})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryAnalytics;
