import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Loader2, 
  Search, 
  ArrowLeft, 
  ShoppingBag, 
  Zap, 
  Rocket, 
  Tag, 
  ShieldCheck, 
  LayoutGrid,
  Monitor,
  Home as HomeIcon,
  Utensils,
  Dumbbell,
  Heart,
  Briefcase,
  Gift,
  Coffee,
  Car,
  Camera
} from 'lucide-react';
import { Merchant, Coupon } from '../types/database';
import { getMerchantsByCategory, getCouponsByCategory } from '../services/supabaseService';
import { GlobalCouponCard } from '../components/GlobalCouponCard';
import { CouponModal } from '../components/CouponModal';
import { trackCouponClick } from '../lib/analytics';
import { SEO } from '../components/SEO';

export const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [coupons, setCoupons] = useState<(Coupon & { merchants: Merchant })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Map slug back to readable name
  const categoryTitle = categoryName 
    ? categoryName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryName) return;
      setLoading(true);
      try {
        // Use the mapped title or slug for the query
        const queryName = categoryTitle.replace(' And ', ' & ');
        const [merchantsData, couponsData] = await Promise.all([
          getMerchantsByCategory(queryName),
          getCouponsByCategory(queryName)
        ]);
        setMerchants(merchantsData);
        setCoupons(couponsData as (Coupon & { merchants: Merchant })[]);
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryName, categoryTitle]);

  const handleShowCode = (coupon: Coupon, merchant: Merchant) => {
    const clickoutUrl = coupon.tracking_link || merchant.tracking_link;
    trackCouponClick({
      merchant_id: merchant.id,
      merchant_name: merchant.name,
      coupon_id: coupon.id,
      coupon_title: coupon.title,
      coupon_code: coupon.coupon_code,
      deal_type: coupon.deal_type,
      page_type: 'category',
      tracking_link: clickoutUrl
    });

    if (clickoutUrl) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('openCoupon', coupon.id);
      const newTab = window.open(currentUrl.toString(), '_blank');
      if (newTab) {
        window.location.href = clickoutUrl;
      } else {
        setSelectedCoupon(coupon);
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
      }
    } else {
      setSelectedCoupon(coupon);
      setSelectedMerchant(merchant);
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading {categoryTitle} deals...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title={`${categoryTitle} Coupons & Promo Codes | TopCoupons.ai`}
        description={`Save on ${categoryTitle} with our latest verified coupons and promo codes. Discover fresh deals from top brands in ${categoryTitle} updated daily.`}
        canonical={`/category/${categoryName}`}
      />
      
      <div className="max-w-screen-2xl mx-auto px-6 pt-12">
        <Link 
          to="/categories" 
          className="inline-flex items-center gap-1 text-xs font-black text-sky-600 uppercase tracking-widest mb-8 hover:gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          All Categories
        </Link>
        
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">
            {categoryTitle} <span className="text-sky-600">Deals</span>
          </h1>
          <p className="text-gray-500 max-w-2xl text-lg">
            We've curated the best savings for {categoryTitle} from verified merchants.
          </p>
        </div>

        {/* Merchants in this category */}
        {merchants.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Top {categoryTitle} Stores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {merchants.map(m => (
                <Link 
                  key={m.id} 
                  to={`/${m.slug}-coupons`}
                  className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl p-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <img src={m.logo_url || ''} alt={m.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-black text-gray-900 text-sm">{m.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Coupons in this category */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-8">Best {categoryTitle} Coupons</h2>
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coupons.map(c => (
                <GlobalCouponCard 
                  key={c.id}
                  coupon={c}
                  merchant={c.merchants}
                  onShowCode={handleShowCode}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[2.5rem] p-20 text-center border border-dashed border-gray-200">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500">We couldn't find any specific coupons for this category right now. Check out our featured stores instead!</p>
            </div>
          )}
        </section>
      </div>

      <CouponModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        merchant={selectedMerchant}
      />
    </div>
  );
};
