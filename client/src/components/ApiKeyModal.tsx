import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, Check, AlertCircle } from 'lucide-react';
import { updateApiKey } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiReady: boolean;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  geminiReady,
  onKeyUpdated
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setLoading(true);
    try {
      const res = await updateApiKey(keyInput.trim());
      if (res.success) {
        setMessage('API key saved and verified!');
        onKeyUpdated();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setMessage(res.error || 'Failed to update key');
      }
    } catch (e) {
      setMessage('Network error updating key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-100 rounded-3xl max-w-md w-full border border-cream-300 shadow-lifted overflow-hidden">
        
        <div className="px-6 py-5 border-b border-cream-300 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-semibold text-forest-950">
                AI & Guide Intelligence
              </h3>
              <p className="text-xs text-earth-muted">
                System Engine Status
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-earth-muted hover:bg-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Grounded Guide Status */}
          <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
                Municipal Authority Guide:
              </span>
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                <span>Authoritative</span>
              </span>
            </div>
            <p className="text-xs text-forest-900 leading-relaxed">
              Metro Regional Waste Guidelines (2025-2026 Edition) loaded with citations, page references, and preparation mandates.
            </p>
          </div>

          {/* Gemini API Status */}
          <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
                Gemini Vision API:
              </span>
              <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                geminiReady ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-earth-muted'
              }`}>
                <span>{geminiReady ? 'Connected' : 'Autonomous Engine Active'}</span>
              </span>
            </div>
            <p className="text-xs text-forest-800/80 leading-relaxed">
              WasteWise operates with autonomous local intelligence for all 18+ items. You can also provide a Gemini API key for live multimodal vision analysis.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-earth-muted">
              Optional: Gemini API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-earth-muted absolute left-3.5 top-3" />
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-400 rounded-xl text-xs font-mono text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600"
              />
            </div>

            {message && (
              <p className="text-xs text-forest-900 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                {message}
              </p>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-forest-800 hover:bg-cream-200"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading || !keyInput}
                className="bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-cream-50 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                {loading ? 'Saving...' : 'Set Key'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
