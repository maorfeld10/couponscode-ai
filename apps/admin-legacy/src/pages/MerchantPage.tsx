import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Zap, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Rocket,
  ListChecks,
  ArrowLeft,
  ArrowRight,
  Search,
  Loader2,
  Store
} from 'lucide-react';
import { motion } from 'motion/react';
import { Merchant, Coupon } from '../types/database';
import { getMerchantBySlug, getPublicCouponsByMerchant, getSimilarMerchants } from '../services/supabaseService';
import { CouponModal } from '../components/CouponModal';
import { trackCouponClick } from '../lib/analytics';
import { SEO } from '../components/SEO';
import { NewsletterForm } from '../components/NewsletterForm';
import { EditorialContent } from '../components/EditorialContent';

// --- Components ---

interface MerchantHeroProps {
  merchant: Merchant;
}

const MerchantHero = ({ merchant }: MerchantHeroProps) => (
  <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-10 pb-2 md:pb-8">
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 shadow-sm">
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-50 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10 w-24 h-24 md:w-40 md:h-40 bg-white rounded-2xl md:rounded-[2rem] flex items-center justify-center p-3 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 shrink-0">
        <img 
          src={merchant.logo_url || 'https://picsum.photos/seed/merchant/200/200'} 
          alt={merchant.name} 
          className="w-full h-full object-contain" 
          referrerPolicy="no-referrer" 
        />
      </div>
      
      <div className="relative z-10 flex-1 text-center md:text-left pt-2">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 mb-3 md:mb-4">
          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-black flex items-center gap-1.5 border border-emerald-100/50">
            <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
            <span>Verified & Tested</span>
          </span>
          <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
            Updated: {new Date(merchant.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight mb-4">
          {merchant.name} Coupons & Promo Codes
        </h1>
        <p className="text-gray-500 text-sm md:text-lg max-w-3xl leading-relaxed font-medium">
          {merchant.description || merchant.short_description || `Save on ${merchant.name} with our latest deals. Curated by AI, reviewed by humans.`}
        </p>
      </div>
    </div>
  </section>
);

interface CouponCardProps {
  coupon: Coupon;
  onShowCode: (coupon: Coupon) => void;
}

const CouponCard = ({ coupon, onShowCode }: CouponCardProps) => {
  // Extract discount info from title if possible, or use a fallback
  const discountMatch = coupon.title.match(/(\d+%|\$\d+)\s+OFF/i);
  const discountValue = discountMatch ? discountMatch[1] : 'DEAL';
  const discountLabel = discountMatch ? 'OFF' : 'ACTIVE';

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      onClick={() => window.innerWidth < 768 && onShowCode(coupon)}
      className="group bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-row gap-4 md:gap-8 items-center cursor-pointer"
    >
      <div className="flex-shrink-0 w-20 md:w-36 h-20 md:h-36 bg-gray-50 rounded-xl md:rounded-3xl flex flex-col items-center justify-center p-2 md:p-4 border border-gray-100 group-hover:bg-sky-50/50 transition-colors">
        <span className="text-sky-700 font-black text-xl md:text-4xl leading-none tracking-tighter">{discountValue}</span>
        <span className="text-sky-700 font-black text-[9px] md:text-sm uppercase tracking-widest mt-1 md:mt-2">{discountLabel}</span>
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
          {coupon.is_exclusive && (
            <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              Exclusive
            </span>
          )}
          {coupon.deal_type === 'code' ? (
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
              Code
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              Deal
            </span>
          )}
        </div>
        <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-1 md:mb-2 leading-tight tracking-tight group-hover:text-sky-700 transition-colors">
          {coupon.title}
        </h3>
        <p className="text-gray-500 text-xs md:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
          {coupon.short_description}
        </p>
        <div className="flex items-center gap-4 mt-3 md:mt-4">
           <span className="flex items-center gap-1.5 text-emerald-600 text-[10px] md:text-xs font-bold">
             <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-50" />
             Verified Today
           </span>
           <span className="text-gray-300 text-[10px] md:text-xs font-medium">• 89% Success Rate</span>
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <div className="md:hidden text-gray-300">
          <ChevronRight className="w-6 h-6" />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onShowCode(coupon);
          }}
          className={`hidden md:flex w-44 py-4 px-6 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-sm items-center justify-center gap-2 cursor-pointer ${
            coupon.deal_type === 'code' 
              ? 'bg-sky-700 text-white hover:bg-sky-800' 
              : 'bg-gray-900 text-white hover:bg-black'
          }`}
        >
          {coupon.deal_type === 'code' ? 'Show Code' : 'Get Deal'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

interface MerchantSidebarProps {
  merchant: Merchant;
  couponCount: number;
  bestDiscount: string;
  similarMerchants: Merchant[];
}

const MerchantSidebar = ({ merchant, couponCount, bestDiscount, similarMerchants }: MerchantSidebarProps) => (
  <aside className="lg:col-span-4 space-y-8">
    {/* Highlights */}
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
      <h3 className="font-black text-xl text-gray-900 mb-8 tracking-tight">Merchant Highlights</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Rocket className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-gray-500">Best Discount</span>
          </div>
          <span className="font-black text-emerald-600 text-lg">{bestDiscount}</span>
        </div>
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-sm font-bold text-gray-500">Total Offers</span>
          </div>
          <span className="font-black text-sky-600 text-lg">{couponCount}</span>
        </div>
      </div>
    </div>

    {/* Similar Stores */}
    {similarMerchants.length > 0 && (
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
        <h3 className="font-black text-xl text-gray-900 mb-8 tracking-tight">Similar Stores</h3>
        <div className="space-y-3">
          {similarMerchants.map(m => (
            <Link 
              key={m.id} 
              to={`/${m.slug}-coupons`}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100"
            >
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 p-2 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <img src={m.logo_url || ''} alt={m.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-gray-900 text-sm group-hover:text-sky-700 transition-colors">{m.name}</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Deals</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* Email Capture */}
    <div className="bg-sky-700 rounded-[2.5rem] p-8 text-white shadow-xl overflow-hidden relative">
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sky-600 rounded-full blur-3xl opacity-50"></div>
      <div className="relative z-10">
        <h3 className="font-black text-2xl mb-3 leading-tight tracking-tight">Never miss a drop.</h3>
        <p className="text-sky-100 text-sm mb-8 leading-relaxed font-medium">
          Join 50k+ savvy savers and get the best {merchant.name} deals delivered to your inbox.
        </p>
        <NewsletterForm 
          source="merchant_page"
          merchantId={merchant.id}
          placeholder="Email address"
          buttonText="Sign Up Free"
          layout="vertical"
          inputClassName="bg-white/10 border-white/20 text-white placeholder:text-sky-300 focus:ring-sky-400 h-12"
          buttonClassName="bg-white text-sky-700 hover:bg-sky-50 h-12 font-black"
        />
      </div>
    </div>

    {/* Savings Tips */}
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        </div>
        <h3 className="font-black text-xl text-gray-900 tracking-tight">Expert Savings Tips</h3>
      </div>
      {merchant.store_info ? (
        <div className="prose prose-sm prose-p:text-gray-500 prose-p:leading-relaxed prose-strong:text-gray-900">
          <EditorialContent content={merchant.store_info} />
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No savings tips available for this merchant.</p>
      )}
    </div>
  </aside>
);

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8">
      <Search className="w-10 h-10 text-gray-400" />
    </div>
    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Merchant Not Found</h1>
    <p className="text-gray-500 max-w-md mb-12 leading-relaxed">
      We couldn't find the store you're looking for. It might have been removed or the URL is incorrect.
    </p>
    <Link 
      to="/" 
      className="flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-sky-700 transition-all active:scale-95"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </Link>
  </div>
);

export const MerchantPage = () => {
  const { merchantSlug } = useParams<{ merchantSlug: string }>();
  const location = useLocation();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [similarMerchants, setSimilarMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!merchantSlug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Normalize slug: remove "-coupons" if present
        const normalizedSlug = merchantSlug.replace(/-coupons$/, '');
        
        const merchantData = await getMerchantBySlug(normalizedSlug);
        if (merchantData) {
          setMerchant(merchantData);
          
          const [couponsData, similarData] = await Promise.all([
            getPublicCouponsByMerchant(merchantData.id),
            getSimilarMerchants(merchantData.category || '', merchantData.id, 10)
          ]);
          
          setCoupons(couponsData);
          setSimilarMerchants(similarData);

          // Check for openCoupon or couponId in URL
          const params = new URLSearchParams(location.search);
          const couponId = params.get('openCoupon') || params.get('couponId');
          if (couponId) {
            const couponToOpen = couponsData.find(c => c.id === couponId);
            if (couponToOpen) {
              setSelectedCoupon(couponToOpen);
              setIsModalOpen(true);
              
              // Optional: Clean up URL without refreshing
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            }
          }
        } else {
          setMerchant(null);
        }
      } catch (err) {
        console.error('Error fetching merchant data:', err);
        setError('Failed to load merchant data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantSlug, location.search]);

  const handleShowCode = (coupon: Coupon) => {
    const clickoutUrl = coupon.tracking_link || merchant?.tracking_link;

    // 1. Track coupon click (async)
    trackCouponClick({
      merchant_id: merchant?.id,
      merchant_name: merchant?.name || 'Unknown',
      coupon_id: coupon.id,
      coupon_title: coupon.title,
      coupon_code: coupon.coupon_code,
      deal_type: coupon.deal_type,
      page_type: 'merchant',
      tracking_link: clickoutUrl
    });

    if (clickoutUrl) {
      // 2. Open a NEW TopCoupons.ai tab pointing to the same page with auto-open param
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('openCoupon', coupon.id);
      
      // We use window.open first as it must be triggered by direct user action
      const newTab = window.open(currentUrl.toString(), '_blank');
      
      // 3. Navigate the CURRENT tab to the tracking link
      if (newTab) {
        window.location.href = clickoutUrl;
      } else {
        // Fallback if popup is blocked: just open modal on current page
        setSelectedCoupon(coupon);
        setIsModalOpen(true);
      }
    } else {
      // No tracking link: just open modal normally
      setSelectedCoupon(coupon);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Use a small delay to clear the coupon so the modal exit animation finishes
    setTimeout(() => setSelectedCoupon(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Loading merchant deals...</p>
      </div>
    );
  }

  if (!merchant) {
    return <NotFound />;
  }

  // Calculate best discount
  const bestDiscount = coupons.reduce((best, current) => {
    const match = current.title.match(/(\d+%|\$\d+)\s+OFF/i);
    if (!match) return best;
    
    const value = match[1];
    if (best === 'DEAL') return value;
    
    // Simple comparison: if both are %, compare numbers. If mixed, prefer % for now.
    const bestNum = parseInt(best.replace(/\D/g, ''));
    const currentNum = parseInt(value.replace(/\D/g, ''));
    
    if (value.includes('%') && best.includes('%')) {
      return currentNum > bestNum ? value : best;
    }
    return currentNum > bestNum ? value : best;
  }, 'DEAL');

  return (
    <div className="bg-gray-50/30 min-h-screen">
      <SEO 
        title={`${merchant.name} Coupons & Promo Codes | TopCoupons.ai`}
        description={`Save with the latest ${merchant.name} coupons, promo codes, and verified deals. Explore current offers and smart shopping tips for ${merchant.name}.`}
        canonical={`/${merchant.slug}-coupons`}
        image={merchant.logo_url || undefined}
      />
      <MerchantHero merchant={merchant} />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 pb-20">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
              Active {merchant.name} Offers ({coupons.length})
            </h2>
          </div>
          
          <div className="space-y-6">
            {coupons.length > 0 ? (
              coupons.map(coupon => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  onShowCode={handleShowCode}
                />
              ))
            ) : (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No active offers found</h3>
                <p className="text-gray-500">We couldn't find any active coupons for {merchant.name} at the moment. Check back later!</p>
              </div>
            )}
          </div>

          {/* About Merchant - Moved below coupons */}
          {merchant.about_merchant && (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm mt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="font-black text-2xl md:text-3xl text-gray-900 tracking-tight">About {merchant.name}</h3>
              </div>
              <div className="prose prose-lg max-w-none prose-p:text-gray-600 prose-p:leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-a:text-sky-600">
                <EditorialContent content={merchant.about_merchant} />
              </div>
            </div>
          )}

          {merchant.faq_content && (
            <div className="mt-16">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 tracking-tight">{merchant.name} FAQs</h2>
              <div className="space-y-4">
                {Array.isArray(merchant.faq_content) ? merchant.faq_content.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h4 className="font-black text-lg text-gray-900 mb-3 tracking-tight">{item.question}</h4>
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )) : (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: merchant.faq_content }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <MerchantSidebar 
          merchant={merchant} 
          couponCount={coupons.length} 
          bestDiscount={bestDiscount}
          similarMerchants={similarMerchants}
        />
      </div>

      <CouponModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coupon={selectedCoupon}
        merchant={merchant}
      />
    </div>
  );
};

