import React, { useState } from 'react';
import { ReuseProject } from '../types';
import { X, Clock, Wrench, Package, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { TransformationVisual } from './TransformationVisual';
import confetti from 'canvas-confetti';

interface ProjectDetailModalProps {
  project: ReuseProject;
  originalItem: string;
  onClose: () => void;
  onCompleteProject?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  originalItem,
  onClose,
  onCompleteProject
}) => {
  const [diyMode, setDiyMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const currentStep = project.steps[currentStepIndex];
  const isLastStep = currentStepIndex === project.steps.length - 1;

  const toggleStepCompleted = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
    }
    if (isLastStep) {
      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      if (onCompleteProject) onCompleteProject();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-forest-950/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-cream-100 rounded-3xl max-w-3xl w-full border border-cream-300 shadow-lifted overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-white border-b border-cream-300 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-earth-muted">
              {diyMode ? `Interactive DIY Tutorial (Step ${currentStepIndex + 1} of ${project.steps.length})` : 'Best Out of Waste Project'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-earth-muted hover:text-forest-950 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* Transformation Visual */}
          <TransformationVisual
            originalItem={originalItem || project.itemMatch[0] || 'Waste Item'}
            projectTitle={project.title}
            projectCategory={project.purpose}
          />

          {!diyMode ? (
            /* Standard Overview Mode */
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-300 pb-5">
                <div>
                  <h2 className="font-editorial text-3xl font-bold text-forest-950">
                    {project.title}
                  </h2>
                  <p className="text-sm text-forest-800/80 mt-1">
                    {project.subtitle}
                  </p>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="px-3 py-1 bg-forest-100 text-forest-900 rounded-full text-xs font-semibold border border-forest-200">
                    {project.difficulty}
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-earth-muted font-medium bg-white px-3 py-1 rounded-full border border-cream-300">
                    <Clock className="w-3.5 h-3.5 text-forest-700" />
                    <span>{project.estimatedTime}</span>
                  </span>
                </div>
              </div>

              {/* Finished Result Highlight */}
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
                  Finished Object: {project.finishedResult.name}
                </span>
                <p className="text-xs sm:text-sm text-forest-900 leading-relaxed">
                  {project.finishedResult.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.finishedResult.benefits.map((b, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Materials and Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Materials */}
                <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-subtle space-y-3">
                  <div className="flex items-center space-x-2 text-forest-950 font-semibold text-xs uppercase tracking-wider">
                    <Package className="w-4 h-4 text-forest-700" />
                    <span>Required Materials</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-forest-900">
                    {project.materials.map((mat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-2 flex-shrink-0" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tools */}
                <div className="bg-white rounded-2xl p-5 border border-cream-300 shadow-subtle space-y-3">
                  <div className="flex items-center space-x-2 text-forest-950 font-semibold text-xs uppercase tracking-wider">
                    <Wrench className="w-4 h-4 text-forest-700" />
                    <span>Required Tools</span>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-forest-900">
                    {project.tools.map((tool, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Safety Notes */}
              {project.safetyNotes && (
                <div className="bg-cream-200/50 rounded-2xl p-4 border border-cream-300 flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-forest-900 leading-relaxed">
                    <span className="font-semibold block text-forest-950 mb-0.5">Safety Precaution:</span>
                    <p>{project.safetyNotes}</p>
                  </div>
                </div>
              )}

              {/* Show Me How Big CTA */}
              <div className="pt-2">
                <button
                  onClick={() => setDiyMode(true)}
                  className="w-full flex items-center justify-center space-x-3 bg-forest-800 hover:bg-forest-900 text-cream-50 py-4 rounded-2xl text-base font-semibold shadow-card hover:shadow-lifted transition-all active:scale-[0.99]"
                >
                  <Play className="w-5 h-5 text-emerald-300 fill-emerald-300" />
                  <span>Show Me How (Step-by-Step DIY Mode)</span>
                </button>
              </div>

            </div>
          ) : (
            /* Interactive DIY Step-by-Step Mode */
            <div className="space-y-6 animate-fade-in">
              
              {/* Progress Steps Bar */}
              <div className="flex items-center justify-between text-xs text-earth-muted">
                <button
                  onClick={() => setDiyMode(false)}
                  className="text-forest-800 hover:text-forest-950 font-semibold flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Overview</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  {project.steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentStepIndex(i)}
                      className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                        currentStepIndex === i
                          ? 'bg-forest-800 text-white ring-2 ring-forest-400'
                          : completedSteps.includes(i)
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-cream-300 text-forest-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Step Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-forest-200 shadow-card space-y-5">
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-forest-100 text-forest-900 rounded-full text-xs font-bold border border-forest-200">
                    Step {currentStep.stepNumber} of {project.steps.length}
                  </span>
                  {currentStep.tool && (
                    <span className="text-xs text-earth-muted flex items-center space-x-1">
                      <Wrench className="w-3.5 h-3.5 text-forest-700" />
                      <span>Tool: {currentStep.tool}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-forest-950">
                  {currentStep.title}
                </h3>

                <p className="text-base sm:text-lg text-forest-900 leading-relaxed font-sans font-normal">
                  {currentStep.instruction}
                </p>

                {currentStep.safetyTip && (
                  <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 flex items-start space-x-2 text-xs text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <span>Tip: {currentStep.safetyTip}</span>
                  </div>
                )}

              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    currentStepIndex === 0
                      ? 'text-stone-400 bg-cream-200/50 cursor-not-allowed'
                      : 'text-forest-900 bg-cream-200 hover:bg-cream-300'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className="flex items-center space-x-2 bg-forest-800 hover:bg-forest-900 text-cream-50 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-card hover:shadow-lifted active:scale-98"
                >
                  <span>{isLastStep ? 'Complete Project 🎉' : 'Next Step →'}</span>
                  {!isLastStep && <ArrowRight className="w-4 h-4 text-emerald-300" />}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
