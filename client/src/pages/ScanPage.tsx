import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Edit3,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Trash2,
  FileText
} from 'lucide-react';
import {
  AnalysisResult,
  DisposalRecommendation,
  ClarificationOption,
  DemoItem,
  ReuseProject
} from '../types';
import { analyzeItem, getDisposalRecommendation, saveHistoryEntry } from '../services/api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { MaterialBreakdown } from '../components/MaterialBreakdown';
import { DisposalCard } from '../components/DisposalCard';
import { GuideEvidenceCard } from '../components/GuideEvidenceCard';
import { ReuseOrDisposeChoice } from '../components/ReuseOrDisposeChoice';
import { ClarificationModal } from '../components/ClarificationModal';
import { CorrectionModal } from '../components/CorrectionModal';
import confetti from 'canvas-confetti';

interface ScanPageProps {
  onOpenReuseForProject: (item: string, project?: ReuseProject) => void;
  onNavigateToTab: (tab: string) => void;
  selectedDemoItem?: DemoItem | null;
  onClearSelectedDemo?: () => void;
  demoItems: DemoItem[];
  onStatsRefresh: () => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({
  onOpenReuseForProject,
  onNavigateToTab,
  selectedDemoItem,
  onClearSelectedDemo,
  demoItems,
  onStatsRefresh
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'photo' | 'describe'>('photo');
  const [textDescription, setTextDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis & Result States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [disposalResult, setDisposalResult] = useState<DisposalRecommendation | null>(null);
  const [disposalMessage, setDisposalMessage] = useState<string | null>(null);
  const [userCorrected, setUserCorrected] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<'reuse' | 'dispose' | null>(null);

  // Modals
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Trigger demo item analysis if supplied via props
  useEffect(() => {
    if (selectedDemoItem) {
      handleAnalyzeDemoItem(selectedDemoItem);
    }
  }, [selectedDemoItem]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setTextDescription('');
    setAnalysisResult(null);
    setDisposalResult(null);
    setDisposalMessage(null);
    setUserCorrected(false);
    setSavedHistoryId(null);
    setSelectedChoice(null);
    if (onClearSelectedDemo) onClearSelectedDemo();
  };

  // Run analysis pipeline
  const executeAnalysis = async (params: {
    text?: string;
    file?: File;
    demoId?: string;
  }) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setDisposalResult(null);
    setDisposalMessage(null);
    setUserCorrected(false);
    setSelectedChoice(null);

    try {
      // 1. Analyze item with AI
      const res = await analyzeItem({
        textDescription: params.text,
        file: params.file,
        demoItemId: params.demoId
      });

      if (!res.success) {
        showNotification(res.error || 'Failed to analyze item');
        setAnalyzing(false);
        return;
      }

      const analysis = res.analysis;
      setAnalysisResult(analysis);

      // 2. If item is NOT unclear, immediately retrieve authoritative municipal disposal rule
      if (!analysis.isUnclear) {
        await fetchDisposalForAnalysis(analysis);
      }
    } catch (e) {
      showNotification('Network issue during analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchDisposalForAnalysis = async (analysis: AnalysisResult) => {
    const dispRes = await getDisposalRecommendation(
      analysis.itemName,
      analysis.material,
      analysis.condition
    );

    if (dispRes.matched && dispRes.disposal) {
      setDisposalResult(dispRes.disposal);
      setDisposalMessage(null);

      // Save initial scan to history
      const saved = await saveHistoryEntry({
        itemName: analysis.itemName,
        material: analysis.material,
        condition: analysis.condition,
        confidence: analysis.confidence,
        image: imagePreview || undefined,
        category: dispRes.disposal.category,
        categoryName: dispRes.disposal.categoryName,
        decision: 'pending',
        correctedByUser: userCorrected
      });
      if (saved.success && saved.entry) {
        setSavedHistoryId(saved.entry.id);
      }
      onStatsRefresh();
    } else {
      setDisposalResult(null);
      setDisposalMessage(dispRes.message || "We couldn't find a matching rule in the local guide.");
    }
  };

  const handleAnalyzeDemoItem = (item: DemoItem) => {
    setImagePreview(null);
    setSelectedFile(null);
    executeAnalysis({ demoId: item.id });
  };

  const handleClarificationOption = async (option: ClarificationOption) => {
    if (!analysisResult) return;
    const updatedAnalysis: AnalysisResult = {
      ...analysisResult,
      itemName: option.item,
      material: option.material,
      condition: option.condition,
      confidence: 'high',
      isUnclear: false,
      evidence: `Clarified by user input: ${option.label}. Identified as ${option.item}.`
    };

    setAnalysisResult(updatedAnalysis);
    await fetchDisposalForAnalysis(updatedAnalysis);
    showNotification('Identification clarified and local rule matched!');
  };

  const handleUserCorrectionSubmit = async (corrected: {
    itemName: string;
    material: string;
    condition: string;
  }) => {
    setIsCorrectionModalOpen(false);
    setUserCorrected(true);

    const updatedAnalysis: AnalysisResult = {
      itemName: corrected.itemName,
      material: corrected.material,
      condition: corrected.condition,
      confidence: 'high',
      isUnclear: false,
      mixedMaterials: corrected.material.includes('+') || corrected.material.includes('laminate'),
      components: [corrected.itemName],
      evidence: 'Corrected by user during review.',
      isReuseSafe: !corrected.itemName.toLowerCase().includes('battery') &&
                   !corrected.itemName.toLowerCase().includes('chemical')
    };

    setAnalysisResult(updatedAnalysis);
    await fetchDisposalForAnalysis(updatedAnalysis);
    showNotification('Identification updated and local rules re-checked.');
  };

  const handleDecisionReuse = () => {
    setSelectedChoice('reuse');
    if (analysisResult) {
      onOpenReuseForProject(analysisResult.itemName);
    }
  };

  const handleDecisionDispose = () => {
    setSelectedChoice('dispose');
    showNotification('Official disposal instructions confirmed!');
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-4 z-50 bg-forest-900 text-cream-50 px-4 py-3 rounded-2xl shadow-lifted border border-forest-700 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-forest-950 tracking-tight">
          What are you throwing away?
        </h1>
        <p className="font-sans text-sm sm:text-base text-forest-800/80 max-w-xl mx-auto">
          Upload a photo or describe the item. We'll identify it and check the local rules.
        </p>
      </div>

      {/* Input Options (Photo vs Describe) */}
      {!analysisResult && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex rounded-2xl bg-cream-200/80 p-1 max-w-sm mx-auto">
            <button
              onClick={() => setActiveInputTab('photo')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeInputTab === 'photo'
                  ? 'bg-white text-forest-950 shadow-subtle'
                  : 'text-earth-muted hover:text-forest-950'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photograph</span>
            </button>
            <button
              onClick={() => setActiveInputTab('describe')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                activeInputTab === 'describe'
                  ? 'bg-white text-forest-950 shadow-subtle'
                  : 'text-earth-muted hover:text-forest-950'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Describe Item</span>
            </button>
          </div>

          {/* Option A: Photograph */}
          {activeInputTab === 'photo' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  imagePreview
                    ? 'border-forest-600 bg-forest-50/20'
                    : 'border-cream-400 bg-cream-50 hover:bg-cream-100 hover:border-forest-400'
                }`}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Uploaded waste item"
                      className="max-h-64 mx-auto rounded-2xl object-cover shadow-card border border-cream-300"
                    />
                    <div className="flex items-center justify-center space-x-3 text-xs text-forest-800 font-semibold">
                      <span>Click or drop another image to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-cream-200 text-forest-800 flex items-center justify-center mx-auto shadow-subtle">
                      <Upload className="w-8 h-8 text-forest-700" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-editorial text-xl font-bold text-forest-950 block">
                        Upload or take a photo
                      </span>
                      <p className="text-xs text-earth-muted">
                        Drag and drop image here, or browse files from your device
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {imagePreview && (
                <button
                  onClick={() => executeAnalysis({ file: selectedFile || undefined })}
                  disabled={analyzing}
                  className="w-full flex items-center justify-center space-x-2.5 bg-forest-800 hover:bg-forest-900 text-cream-50 py-4 rounded-2xl font-semibold shadow-card hover:shadow-lifted transition-all"
                >
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <span>Analyze Photograph</span>
                </button>
              )}
            </div>
          )}

          {/* Option B: Describe */}
          {activeInputTab === 'describe' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-earth-muted">
                Describe What You Have
              </label>
              <textarea
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Example: I have an empty takeaway coffee cup with a plastic lid, or an empty cardboard cereal box."
                rows={4}
                className="w-full p-4 bg-white border border-cream-400 rounded-2xl text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent font-medium"
              />
              <button
                onClick={() => executeAnalysis({ text: textDescription })}
                disabled={analyzing || !textDescription.trim()}
                className="w-full flex items-center justify-center space-x-2.5 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-cream-50 py-4 rounded-2xl font-semibold shadow-card hover:shadow-lifted transition-all"
              >
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span>Identify Item</span>
              </button>
            </div>
          )}

          {/* Quick Demo Pick Tray */}
          <div className="pt-6 border-t border-cream-200 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted block text-center sm:text-left">
              Or Test With Instant Sample Items:
            </span>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {demoItems.slice(0, 8).map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleAnalyzeDemoItem(demo)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-cream-100 hover:bg-forest-800 hover:text-white border border-cream-300 text-forest-900 transition-colors"
                >
                  {demo.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="bg-white rounded-3xl p-10 border border-cream-300 shadow-card text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 text-forest-700 animate-spin" />
          </div>
          <div>
            <h3 className="font-editorial text-2xl font-bold text-forest-950">
              Analyzing your item...
            </h3>
            <p className="text-xs sm:text-sm text-forest-800/80 mt-1 max-w-md mx-auto">
              Identifying the material and checking your local disposal guide.
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && !analyzing && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Reset / New Scan Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
              Analysis Results
            </span>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 bg-cream-200 px-3.5 py-1.5 rounded-full border border-cream-300 transition-colors"
            >
              ← Scan Another Item
            </button>
          </div>

          {/* Unclear Photo Clarification Flow (If applicable) */}
          {analysisResult.isUnclear && (
            <ClarificationModal
              question={analysisResult.clarificationQuestion || "Does the inside have a shiny plastic or metallic coating, or is it plain paper?"}
              options={analysisResult.clarificationOptions}
              onSelectOption={handleClarificationOption}
              onUploadAnother={resetAll}
              onDescribeItem={() => {
                setActiveInputTab('describe');
                setAnalysisResult(null);
              }}
            />
          )}

          {/* Identification Overview Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
                    Identified Object
                  </span>
                  <ConfidenceBadge confidence={analysisResult.confidence} />
                  {userCorrected && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200">
                      Identification updated
                    </span>
                  )}
                </div>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-forest-950">
                  {analysisResult.itemName}
                </h2>
                <p className="text-xs sm:text-sm text-forest-800/80 mt-1">
                  Condition: <span className="font-semibold text-forest-950">{analysisResult.condition}</span>
                </p>
              </div>

              {/* Is This Correct? User Correction Section */}
              <div className="bg-cream-100/90 rounded-2xl p-4 border border-cream-200/90 flex-shrink-0 space-y-2">
                <span className="text-xs font-semibold text-forest-950 block">
                  Is this correct?
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => showNotification('Identification confirmed!')}
                    className="flex items-center space-x-1.5 bg-forest-800 hover:bg-forest-900 text-cream-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Looks right</span>
                  </button>
                  <button
                    onClick={() => setIsCorrectionModalOpen(true)}
                    className="flex items-center space-x-1.5 bg-white hover:bg-cream-200 text-forest-900 border border-cream-400 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-forest-700" />
                    <span>Correct identification</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Material Breakdown */}
            <MaterialBreakdown
              material={analysisResult.material}
              mixedMaterials={analysisResult.mixedMaterials}
              components={analysisResult.components}
              evidence={analysisResult.evidence}
            />

          </div>

          {/* Local Municipal Disposal Rule Result Card */}
          {disposalResult && (
            <div className="space-y-6">
              <DisposalCard disposal={disposalResult} />
              
              {/* Supporting Rule Quotation */}
              {disposalResult.supportingRule && (
                <GuideEvidenceCard supportingRule={disposalResult.supportingRule} />
              )}
            </div>
          )}

          {disposalMessage && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-700 mx-auto" />
              <h4 className="font-editorial text-xl font-bold text-amber-950">
                Rule Not Located
              </h4>
              <p className="text-xs sm:text-sm text-amber-900 max-w-md mx-auto">
                {disposalMessage}
              </p>
            </div>
          )}

          {/* Reuse or Dispose Choice Card */}
          <ReuseOrDisposeChoice
            isReuseSafe={analysisResult.isReuseSafe}
            safetyWarning={analysisResult.safetyWarning}
            onSelectReuse={handleDecisionReuse}
            onSelectDispose={handleDecisionDispose}
            selectedChoice={selectedChoice}
          />

        </div>
      )}

      {/* User Correction Modal */}
      {analysisResult && (
        <CorrectionModal
          isOpen={isCorrectionModalOpen}
          onClose={() => setIsCorrectionModalOpen(false)}
          currentItem={{
            itemName: analysisResult.itemName,
            material: analysisResult.material,
            condition: analysisResult.condition
          }}
          onSubmitCorrection={handleUserCorrectionSubmit}
        />
      )}

    </div>
  );
};
