import React from 'react';
import { StatsData } from '../types';
import { CheckCircle2, Sparkles, Recycle, HeartHandshake } from 'lucide-react';

interface SustainabilityStatsProps {
  stats: StatsData;
}

export const SustainabilityStats: React.FC<SustainabilityStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Items Sorted',
      value: stats.itemsSorted,
      icon: Recycle,
      accent: 'text-forest-700 bg-forest-100',
    },
    {
      label: 'Correctly Sorted',
      value: stats.correctlySorted,
      icon: CheckCircle2,
      accent: 'text-blue-700 bg-blue-100',
    },
    {
      label: 'Reuse Opportunities',
      value: stats.reuseOpportunities,
      icon: Sparkles,
      accent: 'text-amber-700 bg-amber-100',
    },
    {
      label: 'Given a Second Life',
      value: stats.itemsGivenSecondLife,
      icon: HeartHandshake,
      accent: 'text-emerald-700 bg-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-cream-300 shadow-subtle flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-earth-muted">
                {stat.label}
              </span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${stat.accent} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="font-editorial text-2xl sm:text-3xl font-bold text-forest-950">
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
