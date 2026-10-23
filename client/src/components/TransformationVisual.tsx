import React from 'react';
import { ArrowRight, Sparkles, Sprout, Box, Wine, Package, Coffee, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TransformationVisualProps {
  originalItem: string;
  projectTitle: string;
  projectCategory?: string;
  compact?: boolean;
}

export const TransformationVisual: React.FC<TransformationVisualProps> = ({
  originalItem,
  projectTitle,
  projectCategory = 'Home',
  compact = false
}) => {
  const getOriginalIcon = (item: string) => {
    const l = item.toLowerCase();
    if (l.includes('bottle') || l.includes('shampoo')) return Wine;
    if (l.includes('box') || l.includes('cardboard')) return Box;
    if (l.includes('jar')) return Wine;
    if (l.includes('cup') || l.includes('coffee')) return Coffee;
    return Package;
  };

  const getTargetIcon = (title: string) => {
    const l = title.toLowerCase();
    if (l.includes('planter') || l.includes('terrarium') || l.includes('seed')) return Sprout;
    if (l.includes('organizer') || l.includes('caddy')) return Box;
    return Sparkles;
  };

  const OrigIcon = getOriginalIcon(originalItem);
  const TargetIcon = getTargetIcon(projectTitle);

  if (compact) {
    return (
      <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-cream-300 shadow-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cream-200 text-forest-800 flex items-center justify-center">
            <OrigIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-forest-900">{originalItem}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-forest-500 flex-shrink-0" />
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TargetIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-forest-950">{projectTitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cream-300/90 bg-gradient-to-br from-white/90 via-cream-50/80 to-emerald-50/40 p-6 sm:p-8 shadow-card backdrop-blur-md">
      
      {/* Decorative top lighting badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-earth-muted">
            Second-Life Transformation Concept
          </span>
        </div>
        <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Practical Upcycling</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-1">
        
        {/* Original Item Stage */}
        <div className="w-full sm:w-5/12 bg-white/95 rounded-2xl p-5 border border-cream-300 shadow-subtle flex items-center space-x-4 transition-transform hover:scale-[1.01]">
          <div className="w-14 h-14 rounded-2xl bg-cream-200 text-forest-800 flex items-center justify-center flex-shrink-0 border border-cream-300 shadow-inner">
            <OrigIcon className="w-7 h-7 text-forest-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-earth-muted block">
              Starting Material
            </span>
            <span className="font-editorial text-xl font-bold text-forest-950 block mt-0.5 truncate">
              {originalItem}
            </span>
            <span className="text-xs text-earth-muted block mt-0.5">
              Household Packaging Waste
            </span>
          </div>
        </div>

        {/* Transition Arrow Pill */}
        <div className="flex items-center justify-center flex-shrink-0">
          <div className="w-11 h-11 rounded-full bg-forest-800 text-cream-50 flex items-center justify-center shadow-card ring-4 ring-cream-200/90 transform sm:rotate-0 rotate-90 transition-transform hover:scale-110">
            <ArrowRight className="w-5 h-5 text-emerald-300" />
          </div>
        </div>

        {/* Finished Project Stage */}
        <div className="w-full sm:w-5/12 bg-white/95 rounded-2xl p-5 border-2 border-emerald-300/80 shadow-card flex items-center space-x-4 relative overflow-hidden transition-transform hover:scale-[1.01]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 border border-emerald-300 shadow-inner">
            <TargetIcon className="w-7 h-7 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block font-bold">
              What It Can Become
            </span>
            <span className="font-editorial text-xl font-bold text-forest-950 block mt-0.5 truncate">
              {projectTitle}
            </span>
            <span className="text-xs text-forest-800/90 block mt-0.5 flex items-center space-x-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline flex-shrink-0" />
              <span className="truncate">Practical Functional Asset</span>
            </span>
          </div>
        </div>

      </div>

      {/* Bottom transparency footer */}
      <div className="mt-4 pt-3 border-t border-cream-200/80 flex items-center justify-between text-[11px] text-earth-muted">
        <span>Grounded in physical feasibility & common household tools</span>
        <span className="font-semibold text-forest-800">Category: {projectCategory}</span>
      </div>

    </div>
  );
};
