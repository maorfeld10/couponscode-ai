import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Image as ImageIcon, Link as LinkIcon, User, Store, FileText, Globe, Sparkles } from 'lucide-react';
import { Article, Merchant } from '../../types/database';
import { motion, AnimatePresence } from 'motion/react';
import { SmartHintBox } from './SmartHintBox';
import { PublishActionsBar } from './PublishActionsBar';
import { ImageUpload } from './ImageUpload';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article | null;
  onSave: (article: Partial<Article>) => void;
  merchants: Merchant[];
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  article, 
  onSave,
  merchants
}) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    subtitle: '',
    slug: '',
    author: 'Admin',
    merchant_id: merchants[0]?.id || '',
    cover_image_url: '',
    body_content: '',
    status: 'draft',
    publish_date: new Date().toISOString().split('T')[0],
  });

  const [suggestedLinks, setSuggestedLinks] = useState<{ name: string; id: string | number }[]>([]);

  useEffect(() => {
    if (article) {
      setFormData({
        ...article,
        publish_date: article.publish_date ? new Date(article.publish_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        slug: '',
        author: 'Admin',
        merchant_id: merchants[0]?.id || '',
        cover_image_url: '',
        body_content: '',
        status: 'draft',
        publish_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [article, isOpen, merchants]);

  useEffect(() => {
    if (formData.body_content) {
      const mentions = merchants.filter(m => 
        m.id !== formData.merchant_id && 
        formData.body_content?.toLowerCase().includes(m.name.toLowerCase())
      ).map(m => ({ name: m.name, id: m.id }));
      setSuggestedLinks(mentions.slice(0, 3));
    } else {
      setSuggestedLinks([]);
    }
  }, [formData.body_content, formData.merchant_id, merchants]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
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
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-headline font-bold text-gray-900">
                {article ? 'Edit Article' : 'Create New Article'}
              </h2>
              <p className="text-sm text-gray-500">Manage research and content for merchants.</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Meta Data */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Article Title</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      required
                      value={formData.title || ''}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({ 
                          ...formData, 
                          title, 
                          slug: article ? formData.slug : generateSlug(title) 
                        });
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-headline font-bold"
                      placeholder="e.g. How to Save at Nike"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Subtitle / Excerpt</label>
                  <textarea 
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm h-20 resize-none"
                    placeholder="A brief summary of the article..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">URL Slug</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Author</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        required
                        value={formData.author || ''}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Connected Merchant</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                        required
                        value={formData.merchant_id || ''}
                        onChange={(e) => setFormData({ ...formData, merchant_id: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
                      >
                        {merchants.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Publish Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.publish_date || ''}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Status</label>
                  <div className="flex gap-3">
                    {['draft', 'published', 'hidden'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: status as any })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
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

              {/* Right Column - Media & Content Preview */}
              <div className="space-y-6">
                <ImageUpload 
                  label="Cover Image"
                  value={formData.cover_image_url || ''}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  bucket="assets"
                  helperText="Upload a high-quality cover image for the article."
                />

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Internal Linking</span>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    This article will be automatically linked on the <span className="font-bold">{merchants.find(m => m.id === formData.merchant_id)?.name}</span> merchant page and relevant review pages.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Width - Body Content */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">Article Content (Markdown)</label>
                <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">
                  Preview Content
                </button>
              </div>

              {suggestedLinks.length > 0 && (
                <div className="mb-4">
                  <SmartHintBox 
                    title="Internal Link Suggestions"
                    description={`We found mentions of ${suggestedLinks.map(l => l.name).join(', ')}. Would you like to add internal links to their merchant pages?`}
                    actionLabel="Add Links"
                    onAction={() => {
                      let newBody = formData.body_content || '';
                      suggestedLinks.forEach(link => {
                        const regex = new RegExp(`\\b${link.name}\\b`, 'gi');
                        newBody = newBody.replace(regex, `[${link.name}](/merchants/${link.name.toLowerCase().replace(/\s+/g, '-')})`);
                      });
                      setFormData({ ...formData, body_content: newBody });
                    }}
                  />
                </div>
              )}

              <textarea 
                value={formData.body_content || ''}
                onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                className="w-full p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm min-h-[300px] leading-relaxed"
                placeholder="Start writing your article content here..."
              />
            </div>
          </form>

          <PublishActionsBar 
            status={formData.status || 'draft'}
            lastUpdated={article?.updated_at}
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
            onPreview={() => console.log('Previewing article...')}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
