import React from 'react';
import { SupportingRule } from '../types';
import { BookOpen, Quote, ShieldCheck } from 'lucide-react';

interface GuideEvidenceCardProps {
  supportingRule: SupportingRule;
}

export const GuideEvidenceCard: React.FC<GuideEvidenceCardProps> = ({ supportingRule }) => {
  return (
    <div className="bg-cream-200/60 rounded-3xl p-6 sm:p-7 border border-cream-300 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-forest-700" />
          <h4 className="font-editorial text-lg sm:text-xl font-semibold text-forest-950">
            Why does it go here?
          </h4>
        </div>
        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold uppercase tracking-wider text-forest-700 bg-forest-100/80 px-2.5 py-1 rounded-full border border-forest-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Rule Evidence</span>
        </span>
      </div>

      {/* Quote Block */}
      <div className="relative pl-6 pr-4 py-3 bg-white/70 rounded-2xl border-l-4 border-forest-600 border-r border-t border-b border-cream-300 shadow-subtle">
        <Quote className="w-5 h-5 text-forest-300 absolute left-1 top-2 -translate-y-1/2 transform -scale-x-100" />
        <p className="font-serif italic text-forest-950 text-sm sm:text-base leading-relaxed">
          "{supportingRule.exactQuote}"
        </p>
      </div>

      {/* Citation Metadata */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-earth-muted">
        <div>
          <span className="font-medium text-forest-900 block">{supportingRule.guideDocument}</span>
          <span className="text-[11px] text-earth-muted">{supportingRule.edition}</span>
        </div>
        <div className="sm:text-right">
          <span className="font-semibold text-forest-800 block">{supportingRule.section}</span>
          {supportingRule.pageNumber && (
            <span className="font-mono text-[11px] text-earth-muted">Page {supportingRule.pageNumber}</span>
          )}
        </div>
      </div>
    </div>
  );
};
