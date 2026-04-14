import React from 'react';
import { Save, Eye, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface PublishActionsBarProps {
  status: 'draft' | 'published' | 'hidden' | 'active' | 'inactive' | 'expired';
  lastUpdated?: string;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  className?: string;
}

export const PublishActionsBar: React.FC<PublishActionsBarProps> = ({ 
  status, 
  lastUpdated, 
  onSaveDraft, 
  onPublish, 
  onPreview, 
  isSaving = false,
  className = '' 
}) => {
  return (
    <div className={`p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-0 z-10 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === 'published' || status === 'active' ? 'bg-emerald-500' : 
            status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'
          }`} />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Current Status: <span className="text-gray-900">{status}</span>
          </span>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
            <Calendar className="w-3 h-3" />
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onPreview && (
          <button 
            type="button"
            onClick={onPreview}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        )}
        {onSaveDraft && (
          <button 
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
        )}
        {onPublish && (
          <button 
            type="button"
            onClick={onPublish}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>
        )}
      </div>
    </div>
  );
};
