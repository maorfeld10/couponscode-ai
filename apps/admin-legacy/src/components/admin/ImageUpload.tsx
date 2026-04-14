import React, { useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  bucket?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  value, 
  onChange, 
  label, 
  bucket = 'assets',
  helperText = 'Recommended: JPG, PNG or WEBP. Max 2MB.'
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      await supabaseService.uploadFile(bucket, filePath, file);
      const publicUrl = supabaseService.getPublicUrl(bucket, filePath);
      
      onChange(publicUrl);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      if (err.message?.includes('row-level security')) {
        alert(`Storage RLS Violation: Make sure you have created policies for the "${bucket}" bucket in your Supabase dashboard. See the Media Library page for SQL setup instructions.`);
      } else {
        alert(`Failed to upload image to bucket "${bucket}". Error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative group w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => onChange('')}
                className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-200" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <button className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              {value ? 'Change Image' : 'Upload Image'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{helperText}</p>
          {value && (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={value}
                readOnly
                className="flex-1 px-3 py-1.5 bg-gray-50 border-none rounded-lg text-[10px] font-mono text-gray-500"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(value);
                  alert('URL copied to clipboard!');
                }}
                className="p-1.5 bg-gray-50 text-gray-400 hover:text-primary rounded-lg transition-all"
                title="Copy URL"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
