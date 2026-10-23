import React from 'react';
import { DisposalRecommendation } from '../types';
import { Trash2, Recycle, Apple, Wine, AlertTriangle, Cpu, CheckSquare2, FileText, Check } from 'lucide-react';

interface DisposalCardProps {
  disposal: DisposalRecommendation;
}

export const DisposalCard: React.FC<DisposalCardProps> = ({ disposal }) => {
  const getBinIcon = (iconName: string) => {
    switch (iconName) {
      case 'recycle':
        return Recycle;
      case 'apple':
        return Apple;
      case 'wine':
        return Wine;
      case 'alert-triangle':
        return AlertTriangle;
      case 'cpu':
        return Cpu;
      case 'trash-2':
      default:
        return Trash2;
    }
  };

  const getContainerStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bannerBg: 'bg-blue-600',
          accentBorder: 'border-blue-200',
          cardBg: 'bg-blue-50/40',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          badgeText: 'Blue Recycling Cart'
        };
      case 'green':
        return {
          bannerBg: 'bg-emerald-600',
          accentBorder: 'border-emerald-200',
          cardBg: 'bg-emerald-50/40',
          iconColor: 'text-emerald-700',
          iconBg: 'bg-emerald-100',
          badgeText: 'Green Organics Cart'
        };
      case 'amber':
        return {
          bannerBg: 'bg-amber-600',
          accentBorder: 'border-amber-200',
          cardBg: 'bg-amber-50/40',
          iconColor: 'text-amber-700',
          iconBg: 'bg-amber-100',
          badgeText: 'Yellow Glass Bin'
        };
      case 'red':
        return {
          bannerBg: 'bg-rose-600',
          accentBorder: 'border-rose-200',
          cardBg: 'bg-rose-50/40',
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-100',
          badgeText: 'Hazardous Waste Depot'
        };
      case 'purple':
        return {
          bannerBg: 'bg-purple-600',
          accentBorder: 'border-purple-200',
          cardBg: 'bg-purple-50/40',
          iconColor: 'text-purple-600',
          iconBg: 'bg-purple-100',
          badgeText: 'E-Waste Depot'
        };
      case 'stone':
      default:
        return {
          bannerBg: 'bg-stone-700',
          accentBorder: 'border-stone-300',
          cardBg: 'bg-stone-50/60',
          iconColor: 'text-stone-700',
          iconBg: 'bg-stone-200',
          badgeText: 'General Waste & Landfill'
        };
    }
  };

  const style = getContainerStyle(disposal.color);
  const BinIcon = getBinIcon(disposal.icon);

  return (
    <div className={`rounded-3xl border-2 ${style.accentBorder} ${style.cardBg} shadow-card overflow-hidden transition-all duration-300`}>
      {/* Top Banner */}
      <div className={`${style.bannerBg} px-6 py-2.5 text-white flex items-center justify-between text-xs tracking-wider uppercase font-semibold`}>
        <span className="flex items-center space-x-1.5">
          <BinIcon className="w-4 h-4 text-white" />
          <span>Official Municipal Stream</span>
        </span>
        <span className="opacity-90">{disposal.binType}</span>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        
        {/* Main Recommendation Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-earth-muted block mb-1">
              Put it in
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-forest-950 tracking-tight">
              {disposal.categoryName}
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 mt-1 font-medium">
              Target Container: <span className="text-forest-950 font-semibold">{disposal.binType}</span>
            </p>
          </div>

          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${style.iconBg} ${style.iconColor} flex items-center justify-center flex-shrink-0 shadow-subtle border border-black/5`}>
            <BinIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
        </div>

        {/* Preparation Steps */}
        {disposal.preparationSteps && disposal.preparationSteps.length > 0 && (
          <div className="bg-white/80 rounded-2xl p-5 border border-cream-300 shadow-subtle space-y-3">
            <div className="flex items-center space-x-2 text-forest-900 font-semibold text-xs uppercase tracking-wider">
              <CheckSquare2 className="w-4 h-4 text-forest-700" />
              <span>Before Disposing (Mandatory Preparation)</span>
            </div>
            <ul className="space-y-2">
              {disposal.preparationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-forest-900">
                  <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-forest-200">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Authoritative Badge Footer */}
        <div className="flex items-center justify-between text-xs text-earth-muted pt-2 border-t border-cream-300/80">
          <div className="flex items-center space-x-1.5 font-medium text-forest-800">
            <Check className="w-3.5 h-3.5 text-forest-600" />
            <span>Based on your local waste guide</span>
          </div>
          <span className="text-[11px] font-mono text-earth-muted">
            Official Directive
          </span>
        </div>

      </div>
    </div>
  );
};
