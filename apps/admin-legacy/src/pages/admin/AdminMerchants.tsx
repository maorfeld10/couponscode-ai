import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Star,
  Store,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { Merchant } from '../../data/mockData';
import { motion } from 'motion/react';
import { MerchantFormModal } from '../../components/admin/MerchantFormModal';
import { BulkUpdateAboutMerchantModal } from '../../components/admin/BulkUpdateAboutMerchantModal';
import { StatusPill } from '../../components/admin/StatusPill';
import * as supabaseService from '../../services/supabaseService';

export const AdminMerchants: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [merchantsData, couponsData] = await Promise.all([
        supabaseService.getMerchants(),
        supabaseService.getCoupons()
      ]);

      // Map DB schema to UI interface
      const mappedMerchants: Merchant[] = merchantsData.map(m => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        logo: m.logo_url || '',
        description: m.description || '',
        short_description: m.short_description || '',
        homepage_url: m.homepage_link || '',
        tracking_link: m.tracking_link || '',
        affiliate_platform: m.affiliate_platform_name || '',
        category: m.category || '',
        status: m.status === 'active' ? 'active' : 'inactive',
        is_hidden: !m.is_visible,
        is_featured: m.is_featured,
        merchant_brief: m.merchant_brief || '',
        about_merchant: m.about_merchant || '',
        store_info: m.store_info || '',
        buying_guide_preview: m.buying_guide_preview || '',
        savings_guide_preview: m.savings_guide_preview || '',
        popular_searches: m.popular_searches || [],
        updated_at: m.updated_at,
        savings_tips: []
      }));

      setMerchants(mappedMerchants);
      setCoupons(couponsData);
    } catch (err: any) {
      console.error('Error fetching merchants:', err);
      setError('Failed to load merchants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCouponCount = (merchantId: string | number) => {
    return coupons.filter(c => c.merchant_id === merchantId && c.coupon_status === 'active').length;
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || merchant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddMerchant = () => {
    setSelectedMerchant(null);
    setIsModalOpen(true);
  };

  const handleEditMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsModalOpen(true);
  };

  const handleSaveMerchant = async (merchantData: Partial<Merchant>, privateData?: { fmtc_id: string }) => {
    try {
      const dbData: any = {
        name: merchantData.name,
        slug: merchantData.slug,
        logo_url: merchantData.logo,
        homepage_link: merchantData.homepage_url,
        tracking_link: merchantData.tracking_link,
        affiliate_platform_name: merchantData.affiliate_platform,
        status: merchantData.status,
        is_visible: !merchantData.is_hidden,
        is_featured: merchantData.is_featured,
        short_description: merchantData.short_description,
        about_merchant: merchantData.about_merchant,
        store_info: merchantData.store_info,
        category: merchantData.category,
        description: merchantData.description,
      };

      let savedMerchant;
      if (selectedMerchant) {
        savedMerchant = await supabaseService.updateMerchant(selectedMerchant.id as string, dbData);
      } else {
        savedMerchant = await supabaseService.createMerchant(dbData);
      }

      // Handle private data upsert (FMTC ID)
      if (privateData && savedMerchant) {
        await supabaseService.upsertMerchantPrivateData({
          merchant_id: savedMerchant.id,
          merchant_name: savedMerchant.name, // Keep synced
          fmtc_id: privateData.fmtc_id
        });
      }
      
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving merchant:', err);
      const errorMessage = err.message || 'Unknown error';
      alert(`Failed to save merchant: ${errorMessage}`);
    }
  };

  const handleToggleVisibility = async (merchant: Merchant) => {
    try {
      await supabaseService.updateMerchant(merchant.id as string, {
        is_visible: !!merchant.is_hidden
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling visibility:', err);
    }
  };

  const handleToggleFeatured = async (merchant: Merchant) => {
    try {
      await supabaseService.updateMerchant(merchant.id as string, {
        is_featured: !merchant.is_featured
      });
      fetchData();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleDeleteMerchant = async (merchantId: string | number) => {
    if (window.confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) {
      try {
        await supabaseService.deleteMerchant(merchantId as string);
        fetchData();
      } catch (err) {
        console.error('Error deleting merchant:', err);
        alert('Failed to delete merchant.');
      }
    }
  };

  if (loading && merchants.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-500 text-sm">Manage your store partners and their profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5 text-primary" />
            Bulk Update About
          </button>
          <button 
            onClick={handleAddMerchant}
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Merchant
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search merchants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-1 shrink-0">
                        <img 
                          src={merchant.logo} 
                          alt={merchant.name} 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{merchant.name}</p>
                          {getCouponCount(merchant.id) < 3 && merchant.status === 'active' && (
                            <div className="p-1 bg-amber-50 text-amber-600 rounded-lg" title="Low coupon count!">
                              <AlertTriangle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{merchant.affiliate_platform || 'Direct'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={merchant.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleVisibility(merchant)}
                      className={`p-2 rounded-lg transition-colors ${
                        merchant.is_hidden ? 'text-gray-400 hover:bg-gray-100' : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {merchant.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleFeatured(merchant)}
                      className={`p-2 rounded-lg transition-colors ${
                        merchant.is_featured ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${merchant.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditMerchant(merchant)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMerchant(merchant.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMerchants.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-headline font-bold text-gray-900 mb-1">No merchants found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <MerchantFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchant={selectedMerchant}
        onSave={handleSaveMerchant}
        couponCount={selectedMerchant ? getCouponCount(selectedMerchant.id) : 0}
      />

      <BulkUpdateAboutMerchantModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchData}
        merchants={merchants}
      />
    </div>
  );
};
