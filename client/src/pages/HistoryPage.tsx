import React, { useState, useEffect } from 'react';
import { HistoryEntry } from '../types';
import { getHistory } from '../services/api';
import { Clock, Filter, Sparkles, Trash2, CheckCircle2, ArrowRight, ShieldCheck, Edit3 } from 'lucide-react';
import { ConfidenceBadge } from '../components/ConfidenceBadge';

interface HistoryPageProps {
  onScanClick: () => void;
  onOpenReuseProject: (item: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onScanClick, onOpenReuseProject }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reused' | 'disposed' | 'corrected'>('all');
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory();
      if (res.success) {
        setHistory(res.history);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === 'reused') return item.decision === 'reused';
    if (filter === 'disposed') return item.decision === 'disposed';
    if (filter === 'corrected') return item.correctedByUser;
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-5">
        <div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-forest-950 tracking-tight">
            Your Waste History
          </h1>
          <p className="font-sans text-xs sm:text-sm text-forest-800/80 mt-1">
            Complete audit record of identified materials, local municipal streams, and second-life projects.
          </p>
        </div>

        <button
          onClick={onScanClick}
          className="self-start sm:self-auto bg-forest-800 hover:bg-forest-900 text-cream-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
        >
          + New Scan
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: `All Records (${history.length})` },
          { id: 'reused', label: `Reused (${history.filter(h => h.decision === 'reused').length})` },
          { id: 'disposed', label: `Disposed (${history.filter(h => h.decision === 'disposed').length})` },
          { id: 'corrected', label: `User Corrected (${history.filter(h => h.correctedByUser).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-forest-800 text-cream-50 shadow-subtle'
                : 'bg-white text-forest-950 border border-cream-300 hover:bg-cream-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-forest-300 border-t-forest-800 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-earth-muted">Loading audit records...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEntry(item)}
              className="bg-white rounded-2xl p-5 border border-cream-300 shadow-subtle hover:shadow-card hover:border-forest-400 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-editorial text-xl font-bold text-forest-950 group-hover:text-forest-800 transition-colors">
                    {item.itemName}
                  </span>
                  <ConfidenceBadge confidence={item.confidence} size="sm" />
                  {item.correctedByUser && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      User Corrected
                    </span>
                  )}
                </div>

                <div className="text-xs text-forest-800/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Material: <strong className="text-forest-950">{item.material}</strong></span>
                  <span>·</span>
                  <span>Category: <strong className="text-forest-950">{item.categoryName}</strong></span>
                </div>

                {item.decision === 'reused' && item.reuseProject && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-semibold pt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Project: {item.reuseProject}</span>
                  </div>
                )}
              </div>

              {/* Status and Action */}
              <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-cream-200">
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end space-x-1.5">
                    {item.decision === 'reused' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Reused
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-900 border border-stone-300">
                        Disposed
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-earth-muted block mt-1">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-forest-400 group-hover:text-forest-800 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-cream-300 space-y-3">
          <p className="font-editorial text-2xl font-bold text-forest-950">
            No history entries yet.
          </p>
          <p className="text-xs text-earth-muted">
            Scan your first item to begin building your personal sustainability log.
          </p>
        </div>
      )}

      {/* Selected Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-cream-100 rounded-3xl max-w-md w-full border border-cream-300 shadow-lifted p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-cream-300 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
                Scan Audit Record
              </span>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-earth-muted hover:text-forest-950 text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-2xl font-bold text-forest-950">
                {selectedEntry.itemName}
              </h3>
              <p className="text-xs text-forest-800">
                Logged: {formatDate(selectedEntry.createdAt)}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-cream-300 space-y-2 text-xs">
              <div><strong>Material:</strong> {selectedEntry.material}</div>
              <div><strong>Condition:</strong> {selectedEntry.condition}</div>
              <div><strong>Category:</strong> {selectedEntry.categoryName}</div>
              <div><strong>Final Outcome:</strong> {selectedEntry.decision === 'reused' ? `Reused (${selectedEntry.reuseProject || 'DIY'})` : 'Disposed Responsibly'}</div>
              <div><strong>Confidence:</strong> {selectedEntry.confidence}</div>
              {selectedEntry.correctedByUser && (
                <div className="pt-2 text-amber-800 font-semibold border-t border-cream-200">
                  Note: User adjusted this identification after scanning.
                </div>
              )}
            </div>

            {selectedEntry.decision === 'reused' && (
              <button
                onClick={() => {
                  const item = selectedEntry.itemName;
                  setSelectedEntry(null);
                  onOpenReuseProject(item);
                }}
                className="w-full bg-forest-800 hover:bg-forest-900 text-cream-50 py-2.5 rounded-xl text-xs font-semibold"
              >
                View Best Out of Waste Projects
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
