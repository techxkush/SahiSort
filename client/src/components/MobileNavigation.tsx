import React from 'react';
import { Home, Camera, Sparkles, Clock, BookOpen } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'reuse', label: 'Reuse', icon: Sparkles },
    { id: 'scan', label: 'Scan', icon: Camera, highlight: true },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'guide', label: 'Guide', icon: BookOpen },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-100/95 backdrop-blur-md border-t border-cream-300 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center -mt-5 group"
                aria-label="Scan an Item"
              >
                <div className="w-13 h-13 rounded-full bg-forest-800 text-cream-50 p-3 shadow-lifted border-2 border-cream-100 flex items-center justify-center transform active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-emerald-300" />
                </div>
                <span className={`text-[11px] font-medium mt-1 ${isActive ? 'text-forest-900 font-semibold' : 'text-earth-muted'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-forest-900 font-semibold' : 'text-earth-muted hover:text-forest-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-forest-800 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
