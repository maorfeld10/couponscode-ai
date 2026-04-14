import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Layout, Star, ListOrdered, GitCompare, Store, Ticket, FileText, Sparkles } from 'lucide-react';
import { EditorialPage, Merchant, Coupon } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';
import { SmartHintBox } from './SmartHintBox';
import { PublishActionsBar } from './PublishActionsBar';

interface EditorialPageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: EditorialPage | null;
  onSave: (page: Partial<EditorialPage>) => void;
  merchants: Merchant[];
  coupons: Coupon[];
}

export const EditorialPageEditorModal: React.FC<EditorialPageEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  page, 
  onSave,
  merchants,
  coupons
}) => {
  const [formData, setFormData] = useState<Partial<EditorialPage>>({
    page_type: 'top_10_deals',
    title: '',
    subtitle: '',
    intro_text: '',
    body_content: '',
    featured_merchants: [],
    featured_coupons: [],
    status: 'draft',
  });

  const [suggestedLinks, setSuggestedLinks] = useState<{ name: string; id: string | number }[]>([]);

  useEffect(() => {
    if (page) {
      setFormData(page);
    } else {
      setFormData({
        page_type: 'top_10_deals',
        title: '',
        subtitle: '',
        intro_text: '',
        body_content: '',
        featured_merchants: [],
        featured_coupons: [],
        status: 'draft',
      });
    }
  }, [page, isOpen]);

  useEffect(() => {
    if (formData.body_content || formData.intro_text) {
      const content = (formData.body_content || '') + ' ' + (formData.intro_text || '');
      const mentions = merchants.filter(m => 
        content.toLowerCase().includes(m.name.toLowerCase())
      ).map(m => ({ name: m.name, id: m.id }));
      setSuggestedLinks(mentions.slice(0, 3));
    } else {
      setSuggestedLinks([]);
    }
  }, [formData.body_content, formData.intro_text, merchants]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
  };

  const toggleMerchant = (id: string) => {
    const current = formData.featured_merchants || [];
    if (current.includes(id)) {
      setFormData({ ...formData, featured_merchants: current.filter(mId => mId !== id) });
    } else {
      setFormData({ ...formData, featured_merchants: [...current, id] });
    }
  };

  const toggleCoupon = (id: string) => {
    const current = formData.featured_coupons || [];
    if (current.includes(id)) {
      setFormData({ ...formData, featured_coupons: current.filter(cId => cId !== id) });
    } else {
      setFormData({ ...formData, featured_coupons: [...current, id] });
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
          className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900">
                {page ? 'Edit Editorial Page' : 'Create Editorial Page'}
              </h2>
              <p className="text-sm text-gray-500">Manage roundup, comparison, and best-of pages.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Meta Data */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Page Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'top_10_deals', icon: ListOrdered, label: 'Top 10' },
                        { id: 'best_stores', icon: Star, label: 'Best Stores' },
                        { id: 'comparison', icon: GitCompare, label: 'Comparison' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, page_type: type.id as any })}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 ${
                            formData.page_type === type.id 
                              ? 'bg-primary/5 border-primary text-primary shadow-sm ring-1 ring-primary/20' 
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <type.icon className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['draft', 'published'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: status as any })}
                          className={`py-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                            formData.status === status 
                              ? 'bg-primary text-white border-primary shadow-sm' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Page Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-headline font-bold text-xl"
                    placeholder="e.g. Top 10 Fashion Deals for Spring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Subtitle / Summary</label>
                  <textarea 
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
                    placeholder="A brief summary for the page header..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Intro Text</label>
                  <textarea 
                    value={formData.intro_text || ''}
                    onChange={(e) => setFormData({ ...formData, intro_text: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-32 resize-none"
                    placeholder="Introduction for the roundup..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Main Content (Markdown)</label>
                  {suggestedLinks.length > 0 && (
                    <div className="mb-4">
                      <SmartHintBox 
                        title="Internal Link Suggestions"
                        description={`We found mentions of ${suggestedLinks.map(l => l.name).join(', ')}. Would you like to add internal links to their merchant pages?`}
                        actionLabel="Add Links"
                        onAction={() => {
                          let newBody = formData.body_content || '';
                          let newIntro = formData.intro_text || '';
                          suggestedLinks.forEach(link => {
                            const regex = new RegExp(`\\b${link.name}\\b`, 'gi');
                            const linkText = `[${link.name}](/merchants/${link.name.toLowerCase().replace(/\s+/g, '-')})`;
                            newBody = newBody.replace(regex, linkText);
                            newIntro = newIntro.replace(regex, linkText);
                          });
                          setFormData({ ...formData, body_content: newBody, intro_text: newIntro });
                        }}
                      />
                    </div>
                  )}
                  <textarea 
                    value={formData.body_content || ''}
                    onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm min-h-[400px] leading-relaxed"
                    placeholder="Detailed page content..."
                  />
                </div>
              </div>

              {/* Right Column - Selections */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Featured Merchants</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {formData.featured_merchants?.length || 0} selected
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {merchants.map(merchant => (
                      <button
                        key={merchant.id}
                        type="button"
                        onClick={() => toggleMerchant(merchant.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-left ${
                          formData.featured_merchants?.includes(merchant.id as any)
                            ? 'bg-primary/5 text-primary'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className="text-xs font-medium">{merchant.name}</span>
                        {formData.featured_merchants?.includes(merchant.id as any) && <Star className="w-3 h-3 fill-current" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Featured Coupons</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {formData.featured_coupons?.length || 0} selected
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {coupons.slice(0, 20).map(coupon => (
                      <button
                        key={coupon.id}
                        type="button"
                        onClick={() => toggleCoupon(coupon.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-left ${
                          formData.featured_coupons?.includes(coupon.id as any)
                            ? 'bg-primary/5 text-primary'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold truncate">{coupon.title}</p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-wider">{coupon.coupon_code || 'No Code'}</p>
                        </div>
                        {formData.featured_coupons?.includes(coupon.id as any) && <Ticket className="w-3 h-3 fill-current shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Editorial Tip</span>
                  </div>
                  <p className="text-[10px] text-amber-800 leading-relaxed italic">
                    "Top 10" pages perform best when merchants are ranked by discount value. Ensure your featured coupons are currently active.
                  </p>
                </div>
              </div>
            </div>
          </form>

          <PublishActionsBar 
            status={formData.status || 'draft'}
            lastUpdated={page?.updated_at}
            onSaveDraft={() => {
              const updatedData = { ...formData, status: 'draft' as const };
              setFormData(updatedData);
              onSave(updatedData);
            }}
            onPublish={() => {
              const updatedData = { ...formData, status: 'published' as const };
              setFormData(updatedData);
              onSave(updatedData);
            }}
            onPreview={() => console.log('Previewing editorial page...')}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
