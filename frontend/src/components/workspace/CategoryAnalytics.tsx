'use client';

import React, { useMemo } from 'react';
import { Feature, FeatureCategory } from '@/types';
import { PieChart, Layers, Code, Server, Database, Network, Sparkles } from 'lucide-react';

interface CategoryAnalyticsProps {
  features: Feature[];
  hourlyRate: number;
}

const CATEGORY_CONFIG: Record<
  FeatureCategory,
  {
    name: string;
    color: string;
    bgBadge: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  FRONTEND: {
    name: 'Frontend UI/UX',
    color: 'bg-indigo-500',
    bgBadge: 'bg-indigo-500/10 text-indigo-400',
    border: 'border-indigo-500/20',
    icon: <Code className="w-3.5 h-3.5" />,
  },
  BACKEND: {
    name: 'Backend & APIs',
    color: 'bg-sky-500',
    bgBadge: 'bg-sky-500/10 text-sky-400',
    border: 'border-sky-500/20',
    icon: <Server className="w-3.5 h-3.5" />,
  },
  DATABASE: {
    name: 'Database & Schema',
    color: 'bg-teal-500',
    bgBadge: 'bg-teal-500/10 text-teal-400',
    border: 'border-teal-500/20',
    icon: <Database className="w-3.5 h-3.5" />,
  },
  INTEGRATION: {
    name: 'Integrations & Auth',
    color: 'bg-violet-500',
    bgBadge: 'bg-violet-500/10 text-violet-400',
    border: 'border-violet-500/20',
    icon: <Network className="w-3.5 h-3.5" />,
  },
  AI: {
    name: 'AI Engine & ML',
    color: 'bg-pink-500',
    bgBadge: 'bg-pink-500/10 text-pink-400',
    border: 'border-pink-500/20',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
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
          config: CATEGORY_CONFIG[category],
        };
      })
      .filter((item) => item.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  }, [activeFeatures, totalActiveHours, hourlyRate]);

  if (totalActiveHours === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
        <div>
          <h3 className="font-bold text-sm text-gray-50 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <span>Architecture Effort &amp; Budget Distribution</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time percentage breakdown across architectural domain layers
          </p>
        </div>
        <span className="text-[11px] font-mono text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-lg">
          {activeFeatures.length} Active Modules • {totalActiveHours} Total Hours
        </span>
      </div>

      {/* Stacked Multi-Segment Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 rounded-full bg-gray-900 overflow-hidden flex p-0.5 border border-gray-800">
          {distribution.map((item) => (
            <div
              key={item.category}
              className={`h-full ${item.config.color} first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group`}
              style={{ width: `${item.percentage}%` }}
              title={`${item.config.name}: ${item.hours}h (${item.percentage}%)`}
            />
          ))}
        </div>
      </div>

      {/* Category Breakdown Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {distribution.map((item) => (
          <div
            key={item.category}
            className={`p-3 rounded-xl bg-[#090D16] border ${item.config.border} space-y-1.5 font-mono text-xs hover:border-gray-700 transition`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${item.config.bgBadge}`}>
                {item.config.icon}
                {item.category}
              </span>
              <span className="font-bold text-gray-300 text-xs">
                {item.percentage}%
              </span>
            </div>

            <div className="pt-1">
              <div className="text-sm font-bold text-gray-50">
                ${item.cost.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 font-sans">
                {item.hours} hrs • {item.count} {item.count === 1 ? 'feature' : 'features'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryAnalytics;
