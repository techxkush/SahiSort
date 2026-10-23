import React from 'react';
import { Camera, Sparkles, BookOpen, ShieldCheck, ArrowRight, Layers, AlertTriangle, CheckCircle2, ChevronRight, Recycle, ArrowUpRight, Check } from 'lucide-react';
import { SustainabilityStats } from '../components/SustainabilityStats';
import { TransformationVisual } from '../components/TransformationVisual';
import { DemoItem, StatsData } from '../types';

interface HomePageProps {
  onScanClick: () => void;
  onReuseClick: () => void;
  onGuideClick: () => void;
  onSelectDemoItem: (item: DemoItem) => void;
  demoItems: DemoItem[];
  stats: StatsData;
}

export const HomePage: React.FC<HomePageProps> = ({
  onScanClick,
  onReuseClick,
  onGuideClick,
  onSelectDemoItem,
  demoItems,
  stats
}) => {
  // Key demo items matching prompt demo scenarios
  const demoScenarios = [
    {
      number: 'Demo 1',
      title: 'Simple Clean Item',
      subtitle: 'Plastic water bottle with PET #1 analysis & Blue Cart prep rules',
      demoId: 'demo-plastic-bottle',
      tag: 'Curbside Recyclable',
      tagColor: 'bg-blue-100 text-blue-900 border-blue-200'
    },
    {
      number: 'Demo 2',
      title: 'Mixed Packaging',
      subtitle: 'Snack packet with multi-layer BOPP + aluminum laminate breakdown',
      demoId: 'demo-snack-packet',
      tag: 'Multi-Material Composite',
      tagColor: 'bg-stone-200 text-stone-900 border-stone-300'
    },
    {
      number: 'Demo 3',
      title: 'Unclear Photo Handling',
      subtitle: 'Blurry, dark photo triggers honest clarification instead of hallucination',
      demoId: 'demo-unclear-item',
      tag: 'Zero-Hallucination Flow',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      number: 'Demo 4',
      title: 'Best Out of Waste',
      subtitle: 'Turn a PET bottle into a hanging vertical planter with DIY tutorial',
      demoId: 'demo-plastic-bottle',
      isReuseFocused: true,
      tag: 'Creative Reuse',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      number: 'Demo 5',
      title: 'Unsafe Item Handling',
      subtitle: 'AA battery triggers strict safety lock & certified hazardous depot directive',
      demoId: 'demo-battery',
      tag: 'Safety Override Mandate',
      tagColor: 'bg-rose-100 text-rose-900 border-rose-300'
    }
  ];

  const handleLaunchDemo = (demoId: string) => {
    const item = demoItems.find(d => d.id === demoId);
    if (item) {
      onSelectDemoItem(item);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-10">
        
        {/* Subtle decorative editorial backdrop frame */}
        <div className="max-w-5xl mx-auto text-center space-y-7 relative">
          
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-cream-400 text-forest-950 text-xs font-semibold shadow-subtle backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Authoritative Local Rules</span>
            <span className="text-cream-400">·</span>
            <span className="text-earth-muted font-normal">Zero-Hallucination AI</span>
            <span className="text-cream-400">·</span>
            <span className="text-emerald-800 font-medium">Safe Household Reuse</span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-bold text-forest-950 tracking-tight leading-[1.04]">
            Not sure where it goes?
          </h1>

          {/* Supporting Text */}
          <p className="font-sans text-base sm:text-xl text-forest-800/85 max-w-2xl mx-auto leading-relaxed font-normal">
            Snap a photo, identify the material, check your local waste rules, or give everyday items a second life.
          </p>

          {/* Primary Action Buttons: Reuse on Left, Scan on Right */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onReuseClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-forest-800 hover:bg-forest-900 text-cream-50 px-8 py-4 rounded-2xl text-base font-semibold shadow-card hover:shadow-lifted transition-all active:scale-[0.98] ring-1 ring-forest-700/50"
            >
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span>Make Something New (Reuse)</span>
            </button>
            <button
              onClick={onScanClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-white/90 hover:bg-white text-forest-950 border border-cream-400 px-8 py-4 rounded-2xl text-base font-semibold shadow-subtle hover:shadow-card transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5 text-forest-700" />
              <span>Scan an Item</span>
            </button>
          </div>

          {/* Interactive Workflow Progress Strip */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 border border-cream-300 shadow-subtle flex flex-wrap items-center justify-around gap-2 text-xs text-forest-900 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-900 text-[11px] font-bold flex items-center justify-center">1</span>
                <span>Scan / Describe</span>
              </div>
              <span className="text-cream-400 hidden sm:inline">→</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-900 text-[11px] font-bold flex items-center justify-center">2</span>
                <span>Analyze Material Layers</span>
              </div>
              <span className="text-cream-400 hidden sm:inline">→</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-forest-100 text-forest-900 text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Official Municipal Rule</span>
              </div>
              <span className="text-cream-400 hidden sm:inline">→</span>
              <div className="flex items-center space-x-1.5 text-emerald-800">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center justify-center">4</span>
                <span className="font-semibold">Reuse or Dispose</span>
              </div>
            </div>
          </div>

        </div>

        {/* Hero Visual: Transformation Banner */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16">
          <TransformationVisual
            originalItem="Single-Use Plastic Bottle"
            projectTitle="Hanging Botanical Planter"
            projectCategory="Garden"
          />
        </div>
      </section>

      {/* Quick Benefits (Trust Indicators) */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="glass-panel glass-panel-hover rounded-3xl p-7 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center border border-forest-200">
              <BookOpen className="w-6 h-6 text-forest-800" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-forest-950">
              Local Rules
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 leading-relaxed font-sans">
              Recommendations follow your supplied local waste-management guide with exact section citations and page references. Never invented.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-7 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center border border-emerald-200">
              <Layers className="w-6 h-6 text-emerald-800" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-forest-950">
              AI Identification
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 leading-relaxed font-sans">
              Gemini understands objects, material composition, condition, and mixed multi-layer packaging without pretending false confidence.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-3xl p-7 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-6 h-6 text-amber-800" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-forest-950">
              Second Life
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 leading-relaxed font-sans">
              Discover safe, practical Best out of Waste ideas with step-by-step DIY instructions. Strict safety lock for hazardous goods.
            </p>
          </div>

        </div>
      </section>

      {/* Demonstration Suite - One-Click Verification of All 5 Key Scenarios */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-cream-300 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-earth-muted">
              <span>Presentation Ready</span>
              <span>·</span>
              <span>5 Core Scenarios</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950 mt-1">
              Explore Core Product Scenarios
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-forest-800/80 max-w-md">
            Click any demo scenario below to test the full identification, uncertainty, local guide RAG, or safety override flow in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoScenarios.map((demo, idx) => (
            <button
              key={idx}
              onClick={() => handleLaunchDemo(demo.demoId)}
              className="text-left glass-panel glass-panel-hover rounded-3xl p-6 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-earth-muted uppercase">
                    {demo.number}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${demo.tagColor}`}>
                    {demo.tag}
                  </span>
                </div>
                <div>
                  <h4 className="font-editorial text-xl font-bold text-forest-950 group-hover:text-forest-800 transition-colors">
                    {demo.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-forest-800/80 mt-1 leading-relaxed">
                    {demo.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-cream-200 flex items-center justify-between text-xs font-semibold text-forest-800 group-hover:text-forest-950">
                <span>Launch Scenario</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Sustainability Activity Stats */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-editorial text-2xl font-bold text-forest-950">
            Community Impact
          </h3>
          <span className="text-xs text-earth-muted">
            Tracking local waste diversion
          </span>
        </div>
        <SustainabilityStats stats={stats} />
      </section>

    </div>
  );
};
