import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Sparkles, Loader2, Lock } from 'lucide-react';
import { Merchant } from '../../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { WarningBanner } from './WarningBanner';
import { PublishActionsBar } from './PublishActionsBar';
import { ImageUpload } from './ImageUpload';
import { RichTextEditor } from './RichTextEditor';
import { generateAboutMerchant } from '../../services/geminiService';
import { getMerchantPrivateData } from '../../services/supabaseService';

interface MerchantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant?: Merchant | null;
  onSave: (merchant: Partial<Merchant>, privateData?: { fmtc_id: string }) => void;
  couponCount?: number;
}

export const MerchantFormModal: React.FC<MerchantFormModalProps> = ({ 
  isOpen, 
  onClose, 
  merchant, 
  onSave,
  couponCount = 0
}) => {
  const [formData, setFormData] = useState<Partial<Merchant>>({
    name: '',
    slug: '',
    logo: '',
    homepage_url: '',
    tracking_link: '',
    affiliate_platform: '',
    status: 'active',
    is_hidden: false,
    is_featured: false,
    short_description: '',
    about_merchant: '',
    store_info: '',
  });
  const [fmtcId, setFmtcId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const loadPrivateData = async (id: string) => {
      setIsLoadingPrivate(true);
      try {
        const privateData = await getMerchantPrivateData(id);
        if (privateData) {
          setFmtcId(privateData.fmtc_id || '');
        } else {
          setFmtcId('');
        }
      } catch (err) {
        console.error('Error loading private data:', err);
      } finally {
        setIsLoadingPrivate(false);
      }
    };

    if (merchant) {
      setFormData(merchant);
      loadPrivateData(merchant.id as string);
    } else {
      setFormData({
        name: '',
        slug: '',
        logo: '',
        homepage_url: '',
        tracking_link: '',
        affiliate_platform: '',
        status: 'active',
        is_hidden: false,
        is_featured: false,
        short_description: '',
        about_merchant: '',
        store_info: '',
      });
      setFmtcId('');
    }
  }, [merchant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent, statusOverride?: 'active' | 'inactive') => {
    if (e) e.preventDefault();
    const finalData = statusOverride ? { ...formData, status: statusOverride } : formData;
    onSave(finalData, { fmtc_id: fmtcId });
    onClose();
  };

  const handleGenerateAI = async () => {
    if (!formData.name) {
      setAiError("Please enter a merchant name first.");
      return;
    }

    if (formData.about_merchant && formData.about_merchant.length > 50) {
      if (!window.confirm("This will replace your existing 'About Merchant' content. Continue?")) {
        return;
      }
    }

    setIsGenerating(true);
    setAiError(null);

    try {
      const generatedContent = await generateAboutMerchant(formData);
      if (generatedContent) {
        setFormData(prev => ({ ...prev, about_merchant: generatedContent }));
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900">
                {merchant ? 'Edit Merchant' : 'Add New Merchant'}
              </h2>
              <p className="text-sm text-gray-500">Enter the store details below.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {merchant && couponCount < 3 && formData.status === 'active' && (
              <WarningBanner 
                title="Low Coupon Count"
                description={`This merchant only has ${couponCount} active coupons. It's recommended to have at least 5 to maintain SEO value.`}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Store Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Nike"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Slug</label>
                <input 
                  type="text" 
                  required
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. nike-coupons"
                />
              </div>
            </div>

            <ImageUpload 
              label="Merchant Logo"
              value={formData.logo || ''}
              onChange={(url) => setFormData({ ...formData, logo: url })}
              bucket="assets"
              helperText="Upload a high-quality logo. Square or transparent PNG recommended."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Homepage URL</label>
                <input 
                  type="url" 
                  value={formData.homepage_url || ''}
                  onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="https://nike.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Affiliate Platform</label>
                <input 
                  type="text" 
                  value={formData.affiliate_platform || ''}
                  onChange={(e) => setFormData({ ...formData, affiliate_platform: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Impact, CJ"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Tracking Link</label>
              <input 
                type="url" 
                value={formData.tracking_link || ''}
                onChange={(e) => setFormData({ ...formData, tracking_link: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="https://affiliate.link/..."
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-gray-900">
                <Lock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold">Admin Private Data</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">FMTC ID</label>
                  {isLoadingPrivate && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </div>
                <input 
                  type="text" 
                  value={fmtcId}
                  onChange={(e) => setFmtcId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. 12345"
                />
                <p className="text-[10px] text-gray-500 font-medium">Private affiliate network merchant identifier</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-bold text-gray-700">Active Status</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-bold text-gray-700">Featured Store</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Short Description</label>
              <textarea 
                rows={3}
                value={formData.short_description || ''}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Brief summary of the store..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-lg font-headline font-bold text-gray-900">Editorial Content</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-700">About Merchant (Rich Text)</label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
                {aiError && (
                  <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {aiError}
                  </p>
                )}
                <RichTextEditor 
                  content={formData.about_merchant || ''}
                  onChange={(html) => setFormData({ ...formData, about_merchant: html })}
                  placeholder="Tell the story of this merchant..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Expert Savings Tips (Rich Text)</label>
                <RichTextEditor 
                  content={formData.store_info || ''}
                  onChange={(html) => setFormData({ ...formData, store_info: html })}
                  placeholder="Share insider tips on how to save at this store..."
                />
              </div>
            </div>
          </form>

          <PublishActionsBar 
            status={formData.status === 'active' ? 'active' : 'inactive'}
            lastUpdated={merchant?.updated_at}
            onSaveDraft={() => handleSubmit(undefined, 'inactive')}
            onPublish={() => handleSubmit(undefined, 'active')}
            onPreview={() => console.log('Previewing merchant...')}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
