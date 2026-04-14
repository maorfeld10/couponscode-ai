import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  Loader2, 
  AlertTriangle, 
  ChevronLeft, 
  Printer
} from 'lucide-react';
import * as supabaseService from '../services/supabaseService';
import { LegalPage as LegalPageType } from '../types/database';
import { SEO } from '../components/SEO';

export const LegalPage: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [page, setPage] = useState<LegalPageType | null>(null);
  const [allPages, setAllPages] = useState<LegalPageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const fetchPage = async () => {
      let slug = paramSlug || location.pathname.split('/').pop();
      if (!slug) return;

      // Map long route slugs to short database slugs
      const slugMap: Record<string, string> = {
        'contact-us': 'contact',
        'privacy-policy': 'privacy',
        'terms-and-conditions': 'terms'
      };

      const dbSlug = slugMap[slug] || slug;

      setLoading(true);
      setError(null);
      try {
        // Fetch current page
        const { data, error } = await supabaseService.getLegalPageBySlug(dbSlug);
        if (error) throw error;
        
        // Fetch all pages for sidebar
        const allData = await supabaseService.getLegalPages();
        // Only show published pages in sidebar for public site
        setAllPages(allData.filter(p => p.status === 'published' || p.slug === dbSlug));

        if (!data) {
          setError('Page not found');
        } else {
          setPage(data);
        }
      } catch (err) {
        console.error('Error fetching legal page:', err);
        setError('Failed to load legal page content.');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [paramSlug, location.pathname]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Loading legal documentation...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">
          {error === 'Page not found' ? 'Page Not Found' : 'Something went wrong'}
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The legal page you are looking for might have been moved, deleted, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-sky-700 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-sky-800 transition-all shadow-lg hover:shadow-sky-200"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-12">
      <SEO 
        title={page.seo_title || `${page.title} | TopCoupons.ai`}
        description={page.meta_description || `Read our official ${page.title}. Last updated on ${new Date(page.last_updated_at || page.updated_at).toLocaleDateString()}.`}
        canonical={location.pathname}
      />

      {/* Main Content Layout */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-16">
          <div className="mb-10 border-b border-gray-100 pb-8">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 font-headline">
              {page.title}
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Last Updated: {new Date(page.last_updated_at || page.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div 
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-black"
            dangerouslySetInnerHTML={{ __html: page.body_text || '' }}
          />
          
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
