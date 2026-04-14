import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SmartHintBoxProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SmartHintBox: React.FC<SmartHintBoxProps> = ({ 
  title, 
  description, 
  actionLabel, 
  onAction, 
  className = '' 
}) => {
  return (
    <div className={`p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Smart Suggestion</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
      {actionLabel && (
        <button 
          type="button"
          onClick={onAction}
          className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:underline pt-1"
        >
          {actionLabel}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
