import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, Search, Clock, ArrowRight, Package, Wrench, ShieldAlert, Check } from 'lucide-react';
import { ReuseProject } from '../types';
import { getReuseProjects } from '../services/api';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectDetailModal } from '../components/ProjectDetailModal';

interface BestOutOfWastePageProps {
  initialItem?: string;
  onScanClick: () => void;
}

export const BestOutOfWastePage: React.FC<BestOutOfWastePageProps> = ({
  initialItem = 'Plastic Bottle',
  onScanClick
}) => {
  const [selectedItemName, setSelectedItemName] = useState(initialItem);
  const [projects, setProjects] = useState<ReuseProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ReuseProject | null>(null);

  // Filters
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [customItemInput, setCustomItemInput] = useState('');

  const commonItemOptions = [
    { label: 'Plastic Bottle', value: 'Plastic Bottle' },
    { label: 'Cardboard Box', value: 'Cardboard Box' },
    { label: 'Glass Jar', value: 'Glass Jar' },
    { label: 'Aluminum Can', value: 'Aluminum Can' },
    { label: 'Coffee Cup', value: 'Takeaway Coffee Cup' },
  ];

  const fetchProjects = async (item: string, diff?: string, purp?: string) => {
    setLoading(true);
    try {
      const res = await getReuseProjects(item, {
        difficulty: diff !== 'All' ? diff : undefined,
        purpose: purp !== 'All' ? purp : undefined,
      });
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.error('Error loading reuse projects:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(selectedItemName, difficultyFilter, purposeFilter);
  }, [selectedItemName, difficultyFilter, purposeFilter]);

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customItemInput.trim()) {
      setSelectedItemName(customItemInput.trim());
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Practical Home Upcycling</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-forest-950 tracking-tight">
          Best Out of Waste
        </h1>
        <p className="font-sans text-base sm:text-lg text-forest-800/80 leading-relaxed font-normal">
          Turn everyday waste into something useful. Use safe items you already have at home to create practical objects instead of throwing them away.
        </p>
      </div>

      {/* Item Picker and Search Strip */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Quick Select Common Waste Items */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted block">
              Choose Waste Item to Repurpose:
            </span>
            <div className="flex flex-wrap gap-2">
              {commonItemOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedItemName(opt.value)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    selectedItemName.toLowerCase().includes(opt.value.toLowerCase())
                      ? 'bg-forest-800 text-cream-50 shadow-subtle'
                      : 'bg-cream-100 hover:bg-cream-200 text-forest-950 border border-cream-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Or Describe Custom Item */}
          <form onSubmit={handleCustomSearch} className="flex-shrink-0 flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-earth-muted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Or type any item..."
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                className="pl-9 pr-4 py-2 bg-cream-50 border border-cream-400 rounded-xl text-xs sm:text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-cream-200 hover:bg-forest-800 hover:text-white text-forest-950 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl border border-cream-300 transition-colors"
            >
              Explore
            </button>
          </form>
        </div>

        {/* Filter Strip */}
        <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-forest-700" />
              <span className="font-semibold text-earth-muted">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-cream-100 border border-cream-300 text-forest-950 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-earth-muted">Purpose:</span>
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                className="bg-cream-100 border border-cream-300 text-forest-950 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
              >
                <option value="All">All Purposes</option>
                <option value="Home">Home</option>
                <option value="Desk">Desk & Stationery</option>
                <option value="Garden">Garden & Botanical</option>
              </select>
            </div>
          </div>

          <div className="text-earth-muted">
            Found <span className="font-bold text-forest-950">{projects.length}</span> realistic projects for "{selectedItemName}"
          </div>

        </div>

      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-forest-300 border-t-forest-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-earth-muted">Curating practical projects...</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onSelectProject={(p) => setSelectedProject(p)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-300 space-y-3">
          <p className="text-forest-900 font-editorial text-xl font-bold">
            No projects matched your exact filters.
          </p>
          <p className="text-xs text-earth-muted">
            Try switching to "All Levels" or choosing another common household waste item.
          </p>
          <button
            onClick={() => {
              setDifficultyFilter('All');
              setPurposeFilter('All');
            }}
            className="px-4 py-2 bg-cream-200 text-forest-900 rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Project Detail and DIY Tutorial Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          originalItem={selectedItemName}
          onClose={() => setSelectedProject(null)}
          onCompleteProject={() => {
            // celebration completed
          }}
        />
      )}

    </div>
  );
};
