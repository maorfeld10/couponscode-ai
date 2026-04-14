import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Zap, 
  Eye, 
  EyeOff, 
  ChevronDown,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Coupon, Merchant } from '../../data/mockData';
import { motion } from 'motion/react';
import { CouponFormModal } from '../../components/admin/CouponFormModal';
import { StatusPill } from '../../components/admin/StatusPill';
import * as supabaseService from '../../services/supabaseService';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedCoupons, setSelectedCoupons] = useState<(string | number)[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [couponsData, merchantsData] = await Promise.all([
        supabaseService.getCoupons(),
        supabaseService.getMerchants()
      ]);

      // Map DB schema to UI interface
      const mappedCoupons: Coupon[] = couponsData.map(c => ({
        id: c.id,
        merchant_id: c.merchant_id,
        title: c.title,
        description: c.short_description || '',
        code: c.coupon_code || '',
        type: (c.deal_type === 'free_shipping' ? 'free shipping' : c.deal_type) as any,
        discount: '',
        status: c.coupon_status as any,
        tags: [],
        exclusive: c.is_exclusive,
        verified: c.is_verified,
        featured: c.is_featured,
        expiration_date: c.expiration_date || undefined,
        tracking_link: c.tracking_link || '',
        source_type: c.source_type as any,
        updated_at: c.updated_at
      }));

      const mappedMerchants: Merchant[] = merchantsData.map(m => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        logo: m.logo_url || '',
        description: m.description || '',
        category: m.category || '',
        status: m.status === 'active' ? 'active' : 'inactive',
        homepage_url: m.homepage_link || '',
        tracking_link: m.tracking_link || '',
        savings_tips: []
      }));

      setCoupons(mappedCoupons);
      setMerchants(mappedMerchants);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMerchantName = (merchantId: string | number) => {
    return merchants.find(m => m.id === merchantId)?.name || 'Unknown';
  };

  const getMerchantLogo = (merchantId: string | number) => {
    return merchants.find(m => m.id === merchantId)?.logo || '';
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         getMerchantName(coupon.merchant_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || coupon.status === filterStatus;
    const matchesType = filterType === 'all' || coupon.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const toggleCouponSelection = (id: string | number) => {
    setSelectedCoupons(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    if (selectedCoupons.length === filteredCoupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(filteredCoupons.map(c => c.id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCoupons.length === 0) return;

    try {
      if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedCoupons.length} coupons?`)) {
          await Promise.all(selectedCoupons.map(id => supabaseService.deleteCoupon(id as string)));
        } else {
          return;
        }
      } else {
        const statusMap: Record<string, string> = {
          'active': 'active',
          'expired': 'expired',
          'hidden': 'hidden'
        };
        const newStatus = statusMap[action];
        if (newStatus) {
          await Promise.all(selectedCoupons.map(id => 
            supabaseService.updateCoupon(id as string, { 
              coupon_status: newStatus as any,
              is_visible: newStatus === 'active'
            })
          ));
        }
      }
      
      fetchData();
      setSelectedCoupons([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      alert('Failed to perform bulk action.');
    }
  };

  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
    try {
      const dbData: any = {
        merchant_id: couponData.merchant_id,
        title: couponData.title,
        short_description: couponData.description,
        coupon_code: couponData.code || null,
        deal_type: couponData.type === 'free shipping' ? 'free_shipping' : couponData.type,
        coupon_status: couponData.status,
        is_exclusive: !!couponData.exclusive,
        is_verified: !!couponData.verified,
        is_featured: !!couponData.featured,
        is_visible: couponData.status === 'active',
        expiration_date: couponData.expiration_date || null,
        tracking_link: couponData.tracking_link || null,
        source_type: couponData.source_type || 'manual',
        priority_score: 0
      };

      if (selectedCoupon) {
        await supabaseService.updateCoupon(selectedCoupon.id as string, dbData);
      } else {
        await supabaseService.createCoupon(dbData);
      }
      
      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      const errorMessage = err.message || 'Unknown error';
      alert(`Failed to save coupon: ${errorMessage}`);
    }
  };

  const handleDeleteCoupon = async (couponId: string | number) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        await supabaseService.deleteCoupon(couponId as string);
        fetchData();
      } catch (err) {
        console.error('Error deleting coupon:', err);
        alert('Failed to delete coupon.');
      }
    }
  };

  if (loading && coupons.length === 0) {
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
          <h1 className="text-2xl font-headline font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm">Manage all active and expired coupon codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddCoupon}
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Coupon
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
              placeholder="Search coupons or merchants..." 
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
                <option value="expired">Expired</option>
                <option value="hidden">Hidden</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Ticket className="w-4 h-4 text-gray-400" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="code">Codes</option>
                <option value="deal">Deals</option>
                <option value="sale">Sales</option>
                <option value="free shipping">Free Shipping</option>
              </select>
            </div>
          </div>
        </div>

        {selectedCoupons.length > 0 && (
          <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-primary">{selectedCoupons.length} coupons selected</span>
              <div className="w-px h-4 bg-primary/20" />
              <div className="relative">
                <button 
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="text-sm font-bold text-gray-700 flex items-center gap-1 hover:text-primary transition-colors"
                >
                  Bulk Actions
                  <ChevronDown className={`w-4 h-4 transition-transform ${showBulkActions ? 'rotate-180' : ''}`} />
                </button>
                {showBulkActions && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-2">
                    <button onClick={() => handleBulkAction('active')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">Mark as Active</button>
                    <button onClick={() => handleBulkAction('expired')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">Mark as Expired</button>
                    <button onClick={() => handleBulkAction('hidden')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors">Hide Selected</button>
                    <div className="my-1 border-t border-gray-50" />
                    <button onClick={() => handleBulkAction('delete')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold">Delete Selected</button>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setSelectedCoupons([])}
              className="text-sm font-bold text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedCoupons.length === filteredCoupons.length && filteredCoupons.length > 0}
                    onChange={toggleAllSelection}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attributes</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedCoupons.includes(coupon.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedCoupons.includes(coupon.id)}
                      onChange={() => toggleCouponSelection(coupon.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{coupon.title}</p>
                        {isExpired(coupon.expiration_date) && coupon.status === 'active' && (
                          <div className="p-1 bg-red-50 text-red-600 rounded-lg" title="Expired but marked active!">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {coupon.code ? (
                          <code className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                            {coupon.code}
                          </code>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">No code needed</span>
                        )}
                        {coupon.expiration_date && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isExpired(coupon.expiration_date) ? 'text-red-500' : 'text-gray-400'}`}>
                            Exp: {new Date(coupon.expiration_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white border border-gray-100 rounded-md flex items-center justify-center p-0.5 shrink-0">
                        <img 
                          src={getMerchantLogo(coupon.merchant_id)} 
                          alt="" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{getMerchantName(coupon.merchant_id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                      coupon.type === 'code' ? 'bg-blue-50 text-blue-600' :
                      coupon.type === 'deal' ? 'bg-purple-50 text-purple-600' :
                      coupon.type === 'free shipping' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {coupon.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={coupon.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {coupon.exclusive && (
                        <div className="p-1 bg-amber-50 text-amber-600 rounded-lg" title="Exclusive Coupon">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                      {coupon.verified && (
                        <div className="p-1 bg-blue-50 text-blue-600 rounded-lg" title="Verified by AI">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {coupon.featured && (
                        <div className="p-1 bg-primary/10 text-primary rounded-lg" title="Featured on Store Page">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditCoupon(coupon)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(coupon.id)}
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

        {filteredCoupons.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-headline font-bold text-gray-900 mb-1">No coupons found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <CouponFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        onSave={handleSaveCoupon}
        merchants={merchants}
      />
    </div>
  );
};
