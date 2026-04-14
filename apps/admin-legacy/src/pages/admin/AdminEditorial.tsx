import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Layout, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Star,
  ListOrdered,
  GitCompare,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';
import { EditorialPage, Merchant, Coupon } from '../../types/database';
import { EditorialPageEditorModal } from '../../components/admin/EditorialPageEditorModal';

export const AdminEditorial: React.FC = () => {
  const [pages, setPages] = useState<EditorialPage[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<EditorialPage | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pagesData, merchantsData, couponsData] = await Promise.all([
        supabaseService.getEditorialPages(),
        supabaseService.getMerchants(),
        supabaseService.getCoupons()
      ]);
      setPages(pagesData);
      setMerchants(merchantsData);
      setCoupons(couponsData);
    } catch (err) {
      console.error('Error fetching editorial pages:', err);
      setError('Failed to load editorial pages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'top_10_deals': return <ListOrdered className="w-4 h-4" />;
      case 'best_stores': return <Star className="w-4 h-4" />;
      case 'comparison': return <GitCompare className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case 'top_10_deals': return 'Top 10 Deals';
      case 'best_stores': return 'Best Stores';
      case 'comparison': return 'Comparison';
      default: return type || 'Unknown';
    }
  };

  const handleEdit = (page: EditorialPage) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (pageData: Partial<EditorialPage>) => {
    try {
      // Strip metadata and unsupported fields that shouldn't be sent to Supabase
      const { 
        id, 
        created_at, 
        updated_at, 
        featured_merchants, 
        featured_coupons, 
        ...saveData 
      } = pageData as any;

      if (selectedPage) {
        await supabaseService.updateEditorialPage(selectedPage.id, saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'edited',
          entity_type: 'editorial_page',
          entity_id: selectedPage.id,
          entity_name: saveData.title || selectedPage.title,
          details: `Editorial page ${saveData.title} updated`
        });
      } else {
        const newPage = await supabaseService.createEditorialPage(saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'created',
          entity_type: 'editorial_page',
          entity_id: newPage.id,
          entity_name: newPage.title,
          details: `Editorial page ${newPage.title} created`
        });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving editorial page:', err);
      alert('Failed to save editorial page.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this editorial page?')) {
      try {
        await supabaseService.deleteEditorialPage(id);
        await fetchData();
      } catch (err) {
        console.error('Error deleting editorial page:', err);
        alert('Failed to delete editorial page.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Editorial Pages</h1>
          <p className="text-gray-500 text-sm">Manage roundup, comparison, and best-of pages.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Editorial Page
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl ${
                    page.page_type === 'top_10_deals' ? 'bg-amber-50 text-amber-600' :
                    page.page_type === 'best_stores' ? 'bg-blue-50 text-blue-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {getTypeIcon(page.page_type)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {page.status}
                    </span>
                    <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{getTypeLabel(page.page_type)}</p>
                  <h3 className="text-lg font-headline font-bold text-gray-900 line-clamp-1">{page.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{page.subtitle}</p>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchants</span>
                    <span className="text-sm font-bold text-gray-900">{page.featured_merchants?.length || 0}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coupons</span>
                    <span className="text-sm font-bold text-gray-900">{page.featured_coupons?.length || 0}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                    {page.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    Updated {new Date(page.updated_at || page.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(page)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(page.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(page)}
                className="w-full py-3 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Edit Page Content
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button 
            onClick={handleAdd}
            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all group min-h-[280px]"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">Create Editorial Page</p>
              <p className="text-xs text-gray-500">Add a new roundup or comparison</p>
            </div>
          </button>
        </div>
      )}

      <EditorialPageEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        page={selectedPage}
        onSave={handleSave}
        merchants={merchants}
        coupons={coupons}
      />
    </div>
  );
};
