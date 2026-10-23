import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { ApiKeyModal } from './components/ApiKeyModal';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { BestOutOfWastePage } from './pages/BestOutOfWastePage';
import { HistoryPage } from './pages/HistoryPage';
import { WasteGuidePage } from './pages/WasteGuidePage';
import { DemoItem, StatsData } from './types';
import { getDashboardStats, getDemoSamples, checkBackendHealth } from './services/api';
import { Leaf, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiReady, setGeminiReady] = useState(false);

  // Shared state
  const [stats, setStats] = useState<StatsData>({
    itemsSorted: 24,
    correctlySorted: 21,
    reuseOpportunities: 7,
    itemsGivenSecondLife: 5
  });
  const [demoItems, setDemoItems] = useState<DemoItem[]>([]);
  const [selectedDemoItem, setSelectedDemoItem] = useState<DemoItem | null>(null);
  const [reuseItemFilter, setReuseItemFilter] = useState<string>('Plastic Bottle');

  const loadInitialData = async () => {
    try {
      const [healthRes, statsRes, demoRes] = await Promise.all([
        checkBackendHealth(),
        getDashboardStats(),
        getDemoSamples()
      ]);

      setGeminiReady(Boolean(healthRes.geminiConfigured));
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (demoRes.success) {
        setDemoItems(demoRes.items);
      }
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshStats = async () => {
    const res = await getDashboardStats();
    if (res.success) {
      setStats(res.stats);
    }
  };

  const handleLaunchDemoFromHome = (item: DemoItem) => {
    setSelectedDemoItem(item);
    setActiveTab('scan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReuseForProject = (itemName: string) => {
    setReuseItemFilter(itemName);
    setActiveTab('reuse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-forest-950 flex flex-col font-sans selection:bg-forest-200 relative overflow-x-hidden">
      
      {/* Ambient Atmospheric Lighting Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-forest-500/10 via-emerald-600/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-96 -right-24 w-[480px] h-[480px] bg-earth-terracotta/5 blur-[130px] rounded-full" />
        <div className="absolute top-[600px] -left-20 w-[550px] h-[550px] bg-forest-400/6 blur-[150px] rounded-full" />
      </div>

      {/* Top Authority Micro-Banner */}
      <div className="relative z-50 bg-forest-950 text-cream-100 py-1.5 px-4 text-center text-[11px] font-medium tracking-wide flex items-center justify-center space-x-2 border-b border-forest-800/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-emerald-300">Metro Regional Authority Edition:</span>
        <span className="opacity-90 hidden sm:inline">Authoritative Municipal Directives Active · Grounded in Official Guidelines</span>
        <span className="opacity-90 sm:hidden">Official Guidelines Active</span>
      </div>

      {/* Primary Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        geminiReady={geminiReady}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-16">
        {activeTab === 'home' && (
          <HomePage
            onScanClick={() => {
              setSelectedDemoItem(null);
              setActiveTab('scan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onReuseClick={() => {
              setActiveTab('reuse');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGuideClick={() => {
              setActiveTab('guide');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectDemoItem={handleLaunchDemoFromHome}
            demoItems={demoItems}
            stats={stats}
          />
        )}

        {activeTab === 'scan' && (
          <ScanPage
            onOpenReuseForProject={handleOpenReuseForProject}
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedDemoItem={selectedDemoItem}
            onClearSelectedDemo={() => setSelectedDemoItem(null)}
            demoItems={demoItems}
            onStatsRefresh={refreshStats}
          />
        )}

        {activeTab === 'reuse' && (
          <BestOutOfWastePage
            initialItem={reuseItemFilter}
            onScanClick={() => {
              setActiveTab('scan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            onScanClick={() => {
              setActiveTab('scan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenReuseProject={handleOpenReuseForProject}
          />
        )}

        {activeTab === 'guide' && (
          <WasteGuidePage />
        )}
      </main>

      {/* Settings / API Key Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiReady={geminiReady}
        onKeyUpdated={loadInitialData}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-cream-300/80 bg-white/70 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 text-xs text-earth-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow-subtle ring-2 ring-forest-700/20">
              <Leaf className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <span className="font-editorial text-lg font-bold text-forest-950 block leading-tight">
                WasteWise
              </span>
              <span className="text-[11px] text-earth-muted">
                Authoritative Municipal Resource Recovery & Creative Reuse Platform
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-forest-900 font-medium">
            <span className="flex items-center space-x-1.5 text-forest-800">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>Grounded in Official Guidelines</span>
            </span>
            <span className="text-cream-400 hidden sm:inline">|</span>
            <span className="flex items-center space-x-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strict Zero-Hallucination RAG</span>
            </span>
            <span className="text-cream-400 hidden sm:inline">|</span>
            <span className="flex items-center space-x-1.5 text-earth-terracottaDark">
              <Sparkles className="w-4 h-4 text-earth-terracotta" />
              <span>Safe Household Second Life</span>
            </span>
          </div>

          <div className="text-[11px] text-earth-muted font-mono">
            REG-ENV-2025-W88
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
