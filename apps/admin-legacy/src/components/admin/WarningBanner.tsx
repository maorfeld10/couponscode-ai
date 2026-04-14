import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface WarningBannerProps {
  title: string;
  description: string;
  onClose?: () => void;
  className?: string;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ 
  title, 
  description, 
  onClose, 
  className = '' 
}) => {
  return (
    <div className={`p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 relative ${className}`}>
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 space-y-1 pr-6">
        <p className="text-sm font-bold text-amber-900">{title}</p>
        <p className="text-xs text-amber-700 leading-relaxed">{description}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
