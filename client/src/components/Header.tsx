import React, { useState } from 'react';
import { Leaf, Camera, Menu, X, Sparkles, BookOpen, Clock, Settings, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  geminiReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  geminiReady
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'reuse', label: 'Best Out of Waste' },
    { id: 'scan', label: 'Scan Waste' },
    { id: 'history', label: 'History' },
    { id: 'guide', label: 'Waste Guide' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-cream-300/80 shadow-[0_2px_16px_rgba(27,43,34,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-cream-100 flex items-center justify-center shadow-subtle group-hover:bg-forest-900 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-300 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-editorial text-2xl font-medium tracking-tight text-forest-950 block leading-tight">
                WasteWise
              </span>
              <span className="text-[11px] font-sans tracking-wider uppercase text-earth-muted block font-medium">
                Local Rules & Reuse
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-forest-100/70 text-forest-900 font-semibold'
                      : 'text-forest-800/80 hover:text-forest-950 hover:bg-cream-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Status / Key Settings Pill */}
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-cream-300 bg-white/70 text-forest-900 hover:bg-cream-200 transition-colors"
              title="AI & Municipal Model Configuration"
            >
              <span className={`w-2 h-2 rounded-full ${geminiReady ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}`} />
              <span className="text-earth-muted">Source:</span>
              <span className="font-semibold">{geminiReady ? 'Gemini 2.5 + Guide' : 'Municipal Guide RAG'}</span>
              <Settings className="w-3.5 h-3.5 text-earth-muted ml-1" />
            </button>

            {/* Primary CTA */}
            <button
              onClick={() => handleNavClick('scan')}
              className="inline-flex items-center space-x-2 bg-forest-800 hover:bg-forest-900 text-cream-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-subtle hover:shadow-card active:scale-[0.98]"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>Scan an Item</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-forest-800 hover:bg-cream-200"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-forest-800 hover:bg-cream-200"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cream-300 bg-cream-50 px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-forest-800 text-cream-50'
                  : 'text-forest-900 hover:bg-cream-200'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('scan')}
              className="w-full flex items-center justify-center space-x-2 bg-forest-800 text-cream-50 py-3 rounded-xl font-medium"
            >
              <Camera className="w-4 h-4 text-emerald-300" />
              <span>Scan an Item</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
