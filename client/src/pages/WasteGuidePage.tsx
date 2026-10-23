import React, { useState, useEffect } from 'react';
import { GuideCategory } from '../types';
import { getWasteGuide } from '../services/api';
import { BookOpen, Recycle, Apple, Wine, AlertTriangle, Cpu, Trash2, CheckCircle2, XCircle, CheckSquare2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export const WasteGuidePage: React.FC = () => {
  const [categories, setCategories] = useState<GuideCategory[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [faq, setFaq] = useState<{ q: string; a: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
        const res = await getWasteGuide();
        if (res.success) {
          setCategories(res.categories);
          setMetadata(res.metadata);
          setFaq(res.faq || []);
          if (res.categories.length > 0) {
            setExpandedCategoryId(res.categories[0].id);
          }
        }
      } catch (e) {
        console.error('Error fetching guide:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, []);

  const getCategoryIcon = (iconName: string) => {
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

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-900 border border-forest-200 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-forest-700" />
          <span>Authoritative Reference</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-forest-950 tracking-tight">
          Local Waste Guide
        </h1>
        {metadata && (
          <p className="font-sans text-xs sm:text-sm text-forest-800/80 leading-relaxed font-normal">
            {metadata.title} · {metadata.edition}
          </p>
        )}
      </div>

      {/* Guide Authority Callout Banner */}
      {metadata && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-earth-muted block">
              Jurisdiction & Authority
            </span>
            <h3 className="font-editorial text-xl font-bold text-forest-950">
              {metadata.jurisdiction}
            </h3>
            <p className="text-xs text-forest-800/80">
              Administered by {metadata.authority} · Effective {metadata.effectiveDate} · Doc: {metadata.documentId}
            </p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Rule Compliance Active</span>
          </div>
        </div>
      )}

      {/* Categories Accordion / Cards List */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isExpanded = expandedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-subtle ${
                isExpanded ? 'border-forest-600 ring-1 ring-forest-500/20' : 'border-cream-300 hover:border-cream-400'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cat.badgeColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-forest-950">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-forest-800/80 mt-0.5 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="hidden sm:inline-block text-xs font-semibold text-earth-muted">
                    {cat.binType}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-forest-800" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-earth-muted" />
                  )}
                </div>
              </button>

              {/* Accordion Expanded Content */}
              {isExpanded && (
                <div className="px-6 sm:px-8 pb-7 pt-2 border-t border-cream-200 space-y-6 animate-fade-in">
                  
                  {/* Accepted vs Not Accepted Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Accepted */}
                    <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Accepted in {cat.binType}</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-950">
                        {cat.accepted.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Not Accepted */}
                    <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200/80 space-y-3">
                      <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Not Accepted / Prohibited</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-rose-950">
                        {cat.notAccepted.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Mandatory Preparation Requirements */}
                  <div className="bg-cream-100/90 rounded-2xl p-5 border border-cream-300 space-y-3">
                    <div className="flex items-center space-x-2 text-forest-900 font-bold text-xs uppercase tracking-wider">
                      <CheckSquare2 className="w-4 h-4 text-forest-700" />
                      <span>Official Preparation Instructions</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-forest-900">
                      {cat.generalPreparationSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-cream-200">
                          <span className="font-bold text-forest-700 flex-shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Municipal Questions */}
      {faq.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-cream-300">
          <h2 className="font-editorial text-3xl font-bold text-forest-950">
            Common Sorting Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {faq.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-cream-300 space-y-2 shadow-subtle">
                <h4 className="font-editorial text-lg font-bold text-forest-950">
                  {item.q}
                </h4>
                <p className="text-xs sm:text-sm text-forest-800/80 leading-relaxed font-sans">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
