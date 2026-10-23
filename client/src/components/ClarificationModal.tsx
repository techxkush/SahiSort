import React from 'react';
import { HelpCircle, Camera, Edit3, ArrowRight, Sparkles } from 'lucide-react';
import { ClarificationOption } from '../types';

interface ClarificationModalProps {
  question: string;
  options?: ClarificationOption[];
  onSelectOption: (option: ClarificationOption) => void;
  onUploadAnother: () => void;
  onDescribeItem: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  question,
  options = [],
  onSelectOption,
  onUploadAnother,
  onDescribeItem
}) => {
  return (
    <div className="bg-orange-50/80 border-2 border-orange-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-card">
      
      {/* Alert Header */}
      <div className="flex items-start space-x-3.5">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center flex-shrink-0 border border-orange-300">
          <HelpCircle className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-orange-800 block">
            Uncertainty Handled
          </span>
          <h3 className="font-editorial text-2xl font-semibold text-forest-950 mt-0.5">
            We're not completely sure.
          </h3>
          <p className="text-xs sm:text-sm text-forest-800/80 mt-1 leading-relaxed">
            We can identify this as packaging or consumer goods, but the exact material or coating isn't clear enough from this photograph. We never guess when local sorting rules require certainty.
          </p>
        </div>
      </div>

      {/* Clarifying Question Card */}
      <div className="bg-white rounded-2xl p-5 border border-orange-200/90 shadow-subtle space-y-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
          Quick Question:
        </div>
        <p className="text-base sm:text-lg font-medium text-forest-950 font-serif">
          "{question}"
        </p>

        {/* Options */}
        {options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelectOption(opt)}
                className="p-3.5 rounded-xl border border-cream-400 bg-cream-50 hover:bg-forest-800 hover:text-white hover:border-forest-900 transition-all text-left group flex flex-col justify-between"
              >
                <span className="text-xs font-semibold block mb-1 group-hover:text-cream-100">
                  {opt.label}
                </span>
                <span className="text-[11px] text-earth-muted group-hover:text-cream-200 flex items-center justify-between">
                  <span>Resolves to {opt.item}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onSelectOption({ id: 'yes', label: 'Yes', item: 'Coated Packaging', material: 'Coated paperboard', condition: 'Clean' })}
              className="py-2.5 px-4 rounded-xl bg-forest-800 text-cream-50 text-xs font-semibold hover:bg-forest-900 transition-colors text-center"
            >
              Yes
            </button>
            <button
              onClick={() => onSelectOption({ id: 'no', label: 'No', item: 'Plain Cardboard', material: 'Corrugated cardboard', condition: 'Clean' })}
              className="py-2.5 px-4 rounded-xl bg-cream-200 text-forest-950 text-xs font-semibold hover:bg-cream-300 transition-colors text-center"
            >
              No
            </button>
            <button
              onClick={() => onSelectOption({ id: 'not_sure', label: "I'm not sure", item: 'General Packaging', material: 'Mixed packaging', condition: 'Clean' })}
              className="py-2.5 px-4 rounded-xl border border-cream-400 text-forest-900 text-xs font-semibold hover:bg-white transition-colors text-center"
            >
              I'm not sure
            </button>
          </div>
        )}
      </div>

      {/* Alternative actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-earth-muted">
        <span>Prefer to refine directly?</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={onUploadAnother}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-forest-900 font-medium hover:bg-cream-100 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-forest-700" />
            <span>Upload another photo</span>
          </button>
          <button
            onClick={onDescribeItem}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-forest-900 font-medium hover:bg-cream-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-forest-700" />
            <span>Describe the item</span>
          </button>
        </div>
      </div>

    </div>
  );
};
