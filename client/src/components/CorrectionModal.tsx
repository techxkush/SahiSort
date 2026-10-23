import React, { useState } from 'react';
import { X, Check, Edit3, RefreshCw } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: {
    itemName: string;
    material: string;
    condition: string;
  };
  onSubmitCorrection: (corrected: { itemName: string; material: string; condition: string }) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  currentItem,
  onSubmitCorrection
}) => {
  const [itemName, setItemName] = useState(currentItem.itemName);
  const [material, setMaterial] = useState(currentItem.material);
  const [condition, setCondition] = useState(currentItem.condition);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitCorrection({
      itemName: itemName.trim() || currentItem.itemName,
      material: material.trim() || currentItem.material,
      condition: condition.trim() || currentItem.condition,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-100 rounded-3xl max-w-lg w-full border border-cream-300 shadow-lifted overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-cream-300 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-semibold text-forest-950">
                Correct Identification
              </h3>
              <p className="text-xs text-earth-muted">
                Edit details to re-check the local guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-earth-muted hover:text-forest-950 hover:bg-cream-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth-muted mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-cream-400 rounded-xl text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent font-medium"
              placeholder="e.g. Cardboard box, Glass jar, Battery"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth-muted mb-1.5">
              Material Composition
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-cream-400 rounded-xl text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent font-medium"
              placeholder="e.g. PET #1 plastic, Paperboard + plastic lining, Glass"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth-muted mb-1.5">
              Current Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-cream-400 rounded-xl text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent font-medium"
            >
              <option value="Clean & empty">Clean & empty</option>
              <option value="Rinsed">Rinsed</option>
              <option value="Greasy / food-soiled">Greasy / food-soiled</option>
              <option value="Wet / contaminated">Wet / contaminated</option>
              <option value="Dry and clean">Dry and clean</option>
              <option value="Spent / corroded">Spent / corroded</option>
            </select>
          </div>

          <div className="pt-2 text-xs text-earth-muted bg-cream-200/50 p-3 rounded-xl border border-cream-300">
            Note: Updating these details will re-query the authoritative municipal waste guide for the correct rule, without overwriting your scan history audit log.
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-forest-800 hover:bg-cream-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-forest-800 hover:bg-forest-900 text-cream-50 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-subtle hover:shadow-card"
            >
              <RefreshCw className="w-4 h-4 text-emerald-300" />
              <span>Update & Re-Check Rules</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
