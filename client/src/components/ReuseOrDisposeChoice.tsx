import React from 'react';
import { Sparkles, Trash2, AlertOctagon, ArrowRight, ShieldAlert, Check } from 'lucide-react';

interface ReuseOrDisposeChoiceProps {
  isReuseSafe: boolean;
  safetyWarning?: string | null;
  onSelectReuse: () => void;
  onSelectDispose: () => void;
  selectedChoice?: 'reuse' | 'dispose' | null;
}

export const ReuseOrDisposeChoice: React.FC<ReuseOrDisposeChoiceProps> = ({
  isReuseSafe,
  safetyWarning,
  onSelectReuse,
  onSelectDispose,
  selectedChoice
}) => {
  return (
    <div className="bg-cream-100 rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-subtle space-y-6">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-earth-muted">
          Next Step
        </span>
        <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-forest-950">
          What would you like to do?
        </h3>
        <p className="text-xs sm:text-sm text-forest-800/80">
          Choose whether to repurpose this item safely at home or follow local sorting rules.
        </p>
      </div>

      {/* Unsafe item notification banner */}
      {!isReuseSafe && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2.5 text-rose-800 font-semibold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Reuse isn't recommended for this item</span>
          </div>
          <p className="text-xs text-rose-900/90 leading-relaxed pl-7">
            {safetyWarning || "This item contains chemical, electrical, or biological hazards. Casual DIY reuse is strictly prohibited for personal safety and environmental health. Please proceed directly to official local disposal."}
          </p>
        </div>
      )}

      {/* Choice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Choice A: Give it a Second Life */}
        {isReuseSafe ? (
          <button
            onClick={onSelectReuse}
            className={`text-left rounded-2xl p-6 border-2 transition-all duration-200 relative group flex flex-col justify-between ${
              selectedChoice === 'reuse'
                ? 'border-forest-600 bg-forest-50/80 shadow-card ring-2 ring-forest-500/20'
                : 'border-cream-300 bg-white hover:border-forest-400 hover:shadow-subtle'
            }`}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-forest-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-forest-950">♻ Give it a Second Life</span>
              </div>
              <p className="text-xs sm:text-sm text-forest-800/80 mt-1.5 leading-relaxed">
                Find safe, realistic Best out of Waste ideas using household tools.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-semibold text-forest-800 group-hover:text-forest-950 mt-4 border-t border-cream-200">
              <span>Explore DIY Projects</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ) : (
          <div className="rounded-2xl p-6 border-2 border-dashed border-stone-300 bg-stone-100/50 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <span className="text-base font-semibold text-stone-700 block">Reuse Disabled</span>
            <p className="text-xs text-stone-500 mt-1">
              Safety rule active: hazardous or contaminated items cannot be casually repurposed.
            </p>
          </div>
        )}

        {/* Choice B: Dispose Responsibly */}
        <button
          onClick={onSelectDispose}
          className={`text-left rounded-2xl p-6 border-2 transition-all duration-200 relative group flex flex-col justify-between ${
            selectedChoice === 'dispose'
              ? 'border-forest-600 bg-forest-50/80 shadow-card ring-2 ring-forest-500/20'
              : 'border-cream-300 bg-white hover:border-forest-400 hover:shadow-subtle'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Trash2 className="w-6 h-6 text-forest-900" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-forest-950">🗑 Dispose Responsibly</span>
            </div>
            <p className="text-xs sm:text-sm text-forest-800/80 mt-1.5 leading-relaxed">
              Follow official municipal instructions and prep requirements from your local guide.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs font-semibold text-forest-800 group-hover:text-forest-950 mt-4 border-t border-cream-200">
            <span>View Disposal Instructions</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

    </div>
  );
};
