import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Ticket, Zap, ShieldCheck, Star, Sparkles } from 'lucide-react';
import { Coupon, Merchant } from '../../data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { SmartHintBox } from './SmartHintBox';
import { PublishActionsBar } from './PublishActionsBar';

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSave: (coupon: Partial<Coupon>) => void;
  merchants: Merchant[];
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({ 
  isOpen, 
  onClose, 
  coupon, 
  onSave,
  merchants
}) => {
  const [formData, setFormData] = useState<Partial<Coupon>>({
    title: '',
    description: '',
    code: '',
    type: 'code',
    merchant_id: merchants[0]?.id || '',
    status: 'active',
    exclusive: false,
    verified: true,
    featured: false,
    expiration_date: '',
    tracking_link: '',
    source_type: 'manual',
  });

  const [showMerchantHint, setShowMerchantHint] = useState(false);
  const [showLinkHint, setShowLinkHint] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        title: '',
        description: '',
        code: '',
        type: 'code',
        merchant_id: merchants[0]?.id || '',
        status: 'active',
        exclusive: false,
        verified: true,
        featured: false,
        expiration_date: '',
        tracking_link: '',
        source_type: 'manual',
      });
    }
  }, [coupon, isOpen, merchants]);

  useEffect(() => {
    // Smart logic for merchant hint
    if (formData.title && formData.title.length > 3) {
      const titleLower = formData.title.toLowerCase();
      const suggestedMerchant = merchants.find(m => 
        titleLower.includes(m.name.toLowerCase()) && m.id !== formData.merchant_id
      );
      setShowMerchantHint(!!suggestedMerchant);
    } else {
      setShowMerchantHint(false);
    }

    // Smart logic for link hint
    if (!formData.tracking_link && formData.merchant_id) {
      setShowLinkHint(true);
    } else {
      setShowLinkHint(false);
    }
  }, [formData.title, formData.merchant_id, formData.tracking_link, merchants]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent, statusOverride?: 'active' | 'draft') => {
    if (e) e.preventDefault();
    const finalData = statusOverride ? { ...formData, status: statusOverride } : formData;
    onSave(finalData);
    onClose();
  };

  const selectedMerchant = merchants.find(m => m.id === formData.merchant_id);
  const suggestedMerchant = formData.title ? merchants.find(m => 
    formData.title?.toLowerCase().includes(m.name.toLowerCase()) && m.id !== formData.merchant_id
  ) : null;

  const autofillLink = () => {
    if (selectedMerchant) {
      const link = selectedMerchant.tracking_link || selectedMerchant.homepage_url || '';
      if (link) {
        setFormData({ ...formData, tracking_link: link });
      } else {
        alert('No tracking link or homepage URL found for this merchant.');
      }
    }
  };

  const useSuggestedMerchant = () => {
    if (suggestedMerchant) {
      setFormData({ ...formData, merchant_id: suggestedMerchant.id });
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
          className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900">
                {coupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <p className="text-sm text-gray-500">Enter the coupon details below.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {showMerchantHint && suggestedMerchant && (
              <SmartHintBox 
                title={`Suggested Merchant: ${suggestedMerchant.name}`}
                description={`We noticed you mentioned "${suggestedMerchant.name}" in the title. Would you like to switch the merchant?`}
                actionLabel="Switch Merchant"
                onAction={useSuggestedMerchant}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Merchant</label>
                <select 
                  required
                  value={formData.merchant_id}
                  onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Coupon Type</label>
                <select 
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="code">Code</option>
                  <option value="deal">Deal</option>
                  <option value="sale">Sale</option>
                  <option value="free shipping">Free Shipping</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Coupon Title</label>
              <input 
                type="text" 
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. 20% Off Storewide"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Coupon Code (Optional)</label>
                <input 
                  type="text" 
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono"
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Expiration Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={formData.expiration_date || ''}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">Tracking Link (Optional)</label>
                {showLinkHint && selectedMerchant && (
                  <button 
                    type="button"
                    onClick={autofillLink}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    Autofill from Merchant
                  </button>
                )}
              </div>
              <input 
                type="url" 
                value={formData.tracking_link || ''}
                onChange={(e) => setFormData({ ...formData, tracking_link: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="https://affiliate.link/..."
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Exclusive</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, exclusive: !formData.exclusive })}
                  className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                    formData.exclusive ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${formData.exclusive ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Verified</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                  className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                    formData.verified ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Featured</label>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                    formData.featured ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                >
                  <Star className={`w-5 h-5 ${formData.featured ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea 
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Enter coupon details, terms, or conditions..."
              />
            </div>
          </form>

          <PublishActionsBar 
            status={formData.status || 'draft'}
            lastUpdated={coupon?.updated_at}
            onSaveDraft={() => handleSubmit(undefined, 'draft')}
            onPublish={() => handleSubmit(undefined, 'active')}
            onPreview={() => console.log('Previewing coupon...')}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
