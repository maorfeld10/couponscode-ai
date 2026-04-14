import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Loader2,
  Globe,
  Search,
  Layout,
  Code
} from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';
import { LegalPage } from '../../types/database';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import DOMPurify from 'dompurify';

export const AdminLegal: React.FC = () => {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let data = await supabaseService.getLegalPages();
      if (data.length === 0) {
        // Seed initial pages if none exist
        const seedPages = [
          { slug: 'contact', title: 'Contact Us', body_text: '<h1>Contact Us</h1><p>We would love to hear from you! Please reach out using the information below.</p><h2>General Inquiries</h2><p>Email: support@topcoupons.ai</p><h2>Partnership Opportunities</h2><p>Email: partners@topcoupons.ai</p>', status: 'published' as const },
          { slug: 'privacy', title: 'Privacy Policy', body_text: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p><h2>Information Collection</h2><p>We collect information you provide directly to us when you sign up for our newsletter or use our services.</p>', status: 'published' as const },
          { slug: 'terms', title: 'Terms & Conditions', body_text: '<h1>Terms & Conditions</h1><p>By using TopCoupons.ai, you agree to the following terms and conditions. Please read them carefully.</p><h2>Use of Service</h2><p>You must be at least 18 years old to use this service.</p>', status: 'published' as const },
        ];
        for (const p of seedPages) {
          await supabaseService.upsertLegalPage(p);
        }
        data = await supabaseService.getLegalPages();
      }
      setPages(data);
      if (data.length > 0 && !selectedPageId) {
        setSelectedPageId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching legal pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];

  const handleSave = async (status: 'draft' | 'published') => {
    if (!selectedPage) return;
    
    // Basic validation
    if (!selectedPage.title.trim()) {
      alert('Page title is required.');
      return;
    }
    if (!selectedPage.slug.trim()) {
      alert('URL slug is required.');
      return;
    }

    setIsSaving(true);

    // Sanitize HTML before saving
    const sanitizedHtml = DOMPurify.sanitize(selectedPage.body_text || '', {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'hr', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });

    try {
      await supabaseService.upsertLegalPage({
        ...selectedPage,
        body_text: sanitizedHtml,
        status: status,
        last_updated_at: new Date().toISOString()
      });
      
      // Log the action
      await supabaseService.createAuditLog({
        admin_email: 'yogev@intango.com', // Placeholder until real auth
        action_type: status === 'published' ? 'published' : 'edited',
        entity_type: 'legal',
        entity_id: selectedPage.id,
        entity_name: selectedPage.title,
        details: `Legal page ${selectedPage.title} ${status === 'published' ? 'published' : 'saved as draft'}`
      });

      setHasChanges(false);
      await fetchData();
    } catch (err) {
      console.error('Error saving legal page:', err);
      alert('Failed to save legal page.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSelectedPage = (updates: Partial<LegalPage>) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? { ...p, ...updates } : p));
    setHasChanges(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    updateSelectedPage({ title, slug });
  };

  if (loading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!selectedPage) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-headline font-bold text-gray-900">No legal pages found</h3>
        <p className="text-gray-500">Legal pages are required for the public site.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Legal Pages</h1>
          <p className="text-gray-500 text-sm">Manage the live legal content for the public website.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg animate-pulse">
              Unsaved Changes
            </span>
          )}
          <button 
            onClick={() => handleSave('draft')}
            disabled={isSaving || !hasChanges}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Page List */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pages</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    if (hasChanges && !window.confirm('You have unsaved changes. Switch anyway?')) return;
                    setSelectedPageId(page.id);
                    setHasChanges(false);
                    setActiveTab('edit');
                  }}
                  className={`w-full p-4 text-left flex items-center justify-between transition-all group ${
                    selectedPageId === page.id 
                      ? 'bg-primary/5 border-l-4 border-primary' 
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-sm font-bold ${selectedPageId === page.id ? 'text-primary' : 'text-gray-900'}`}>
                      {page.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {page.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    selectedPageId === page.id ? 'text-primary translate-x-1' : 'text-gray-300 group-hover:text-gray-400'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Status</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last Updated</span>
                <span className="text-xs font-bold text-gray-900">{new Date(selectedPage.last_updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Created At</span>
                <span className="text-xs font-bold text-gray-900">{new Date(selectedPage.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'edit' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'preview' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-bold">Words:</span> {(selectedPage.body_text || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-bold">Chars:</span> {(selectedPage.body_text || '').length}
                </div>
              </div>
            </div>

            {activeTab === 'edit' ? (
              <div className="p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Page Title
                    </label>
                    <input 
                      type="text" 
                      value={selectedPage.title}
                      onChange={handleTitleChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-headline font-bold text-lg"
                      placeholder="e.g. Terms & Conditions"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      URL Slug
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                      <input 
                        type="text" 
                        value={selectedPage.slug}
                        onChange={(e) => updateSelectedPage({ slug: e.target.value })}
                        className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                        placeholder="terms-and-conditions"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Search Engine Optimization</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600">SEO Title Tag</label>
                      <input 
                        type="text" 
                        value={selectedPage.seo_title || ''}
                        onChange={(e) => updateSelectedPage({ seo_title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="Title as it appears in Google search results"
                      />
                      <p className="text-[10px] text-gray-400">Recommended: 50-60 characters. Current: {(selectedPage.seo_title || '').length}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-600">Meta Description</label>
                      <textarea 
                        value={selectedPage.meta_description || ''}
                        onChange={(e) => updateSelectedPage({ meta_description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none h-20"
                        placeholder="Brief summary of the page for search results"
                      />
                      <p className="text-[10px] text-gray-400">Recommended: 150-160 characters. Current: {(selectedPage.meta_description || '').length}</p>
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Code className="w-3.5 h-3.5" />
                    Page Content
                  </label>
                  <RichTextEditor 
                    content={selectedPage.body_text || ''} 
                    onChange={(html) => updateSelectedPage({ body_text: html })}
                    placeholder="Start writing your legal documentation..."
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 md:p-12 bg-gray-50 flex-1 overflow-auto">
                <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-12">
                  <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4 font-headline">
                      {selectedPage.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <span>Updated: {new Date(selectedPage.last_updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div 
                    className="prose prose-sky max-w-none 
                      prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
                      prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                      prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-lg
                      prose-strong:text-gray-900 prose-strong:font-black
                      prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline
                      prose-ul:list-disc prose-ul:pl-6
                      prose-li:text-gray-600 prose-li:mb-2
                      prose-hr:border-gray-100 prose-hr:my-12"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPage.body_text || '') }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
