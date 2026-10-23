import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'needs_clarification' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (confidence) {
      case 'high':
        return {
          label: 'High confidence',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500'
        };
      case 'medium':
        return {
          label: 'Medium confidence',
          icon: HelpCircle,
          classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500'
        };
      case 'needs_clarification':
      default:
        return {
          label: 'Needs clarification',
          icon: AlertCircle,
          classes: 'bg-orange-50 text-orange-800 border-orange-200/80',
          dot: 'bg-orange-500 animate-pulse'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs space-x-1',
    md: 'px-2.5 py-1 text-xs space-x-1.5',
    lg: 'px-3.5 py-1.5 text-sm space-x-2'
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border shadow-subtle ${config.classes} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
