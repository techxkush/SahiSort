import React from 'react';
import { Layers, Check, Info, AlertTriangle } from 'lucide-react';

interface MaterialBreakdownProps {
  material: string;
  mixedMaterials: boolean;
  components?: string[];
  evidence?: string;
}

export const MaterialBreakdown: React.FC<MaterialBreakdownProps> = ({
  material,
  mixedMaterials,
  components = [],
  evidence
}) => {
  // Parse materials if contains '+' or 'and'
  const materialTokens = material.split(/\s*(?:\+|\band\b|\/)\s*/i).filter(Boolean);

  return (
    <div className="bg-cream-50/70 border border-cream-300 rounded-2xl p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-forest-700" />
          <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
            Material Detected
          </span>
        </div>
        {mixedMaterials && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            Multi-Material Composite
          </span>
        )}
      </div>

      {/* Materials Visual Representation */}
      <div className="flex flex-wrap items-center gap-2">
        {materialTokens.map((mat, idx) => (
          <React.Fragment key={idx}>
            <div className="bg-white border border-cream-400 px-3.5 py-2 rounded-xl text-sm font-medium text-forest-950 shadow-subtle flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forest-600" />
              <span>{mat.trim()}</span>
            </div>
            {idx < materialTokens.length - 1 && (
              <span className="text-earth-muted font-bold text-sm px-1">+</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Components breakdown if multiple components */}
      {components.length > 0 && (
        <div className="pt-2 border-t border-cream-200">
          <span className="text-xs font-medium text-earth-muted block mb-2">Visible Components:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {components.map((comp, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-forest-900 bg-cream-100 px-2.5 py-1.5 rounded-lg border border-cream-200">
                <Check className="w-3.5 h-3.5 text-forest-600 flex-shrink-0" />
                <span>{comp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Why we think this */}
      {evidence && (
        <div className="bg-cream-100/90 rounded-xl p-3 border border-cream-200/80 flex items-start space-x-2.5 text-xs text-forest-900">
          <Info className="w-4 h-4 text-forest-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5 text-forest-950">Why we think this:</span>
            <p className="text-forest-800/90 leading-relaxed">{evidence}</p>
          </div>
        </div>
      )}
    </div>
  );
};
