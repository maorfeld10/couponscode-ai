import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Store, 
  LayoutGrid, 
  Bookmark, 
  Home as HomeIcon,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Mail,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Coupon, Merchant } from '../types/database';
import { getPublicCoupons } from '../services/supabaseService';
import { CouponModal } from '../components/CouponModal';
import { GlobalCouponCard } from '../components/GlobalCouponCard';
import { trackCouponClick, trackSearch } from '../lib/analytics';
import { SEO } from '../components/SEO';

import { NewsletterForm } from '../components/NewsletterForm';

// --- Utilities ---

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- Sub-components ---

const CouponsHero = () => (
  <header className="mb-12">
    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 mb-4 font-headline">
      Top Coupons of the Week
    </h1>
    <p className="text-gray-500 text-lg max-w-2xl font-sans leading-relaxed">
      Our AI-powered intelligence engine scanned thousands of merchants to curate this week's highest-value editor-reviewed savings.
    </p>
  </header>
);

interface CouponFilterBarProps {
  filter: string;
  setFilter: (filter: string) => void;
  search: string;
  setSearch: (search: string) => void;
}

const CouponFilterBar = ({ filter, setFilter, search, setSearch }: CouponFilterBarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-6 mb-10 bg-surface-container-low p-2 rounded-2xl border border-gray-100">
    <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-50">
      <button 
        onClick={() => setFilter('all')}
        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        All Offers
      </button>
      <button 
        onClick={() => setFilter('code')}
        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'code' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        Codes Only
      </button>
      <button 
        onClick={() => setFilter('deal')}
        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${filter === 'deal' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        Sales
      </button>
    </div>
    <div className="relative flex-1 max-w-md hidden md:block">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
      <input 
        className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-0 ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none shadow-sm" 
        placeholder="Search brands or coupons..." 
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  </div>
);

const NewsletterSection = () => (
  <div className="md:col-span-2 xl:col-span-3 bg-primary rounded-[2.5rem] p-12 overflow-hidden relative group shadow-xl shadow-primary/10">
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Never miss a price drop again.</h2>
        <p className="text-sky-100 text-lg mb-8 max-w-lg leading-relaxed">Join 200,000+ smart shoppers who get our AI-curated savings alerts delivered weekly.</p>
        <NewsletterForm 
          source="coupons_page"
          placeholder="Enter your email"
          buttonText="Join Free"
          inputClassName="bg-white/10 border-0 focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/60 px-6 py-4 rounded-xl flex-1 backdrop-blur-md outline-none transition-all"
          buttonClassName="bg-white text-primary font-black px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
        />
      </div>
      <div className="hidden md:block w-1/3">
        <div className="relative">
          <div className="absolute inset-0 bg-sky-400/20 blur-3xl rounded-full"></div>
          <img 
            className="w-full relative z-10 transform group-hover:rotate-6 transition-transform duration-700" 
            src="https://picsum.photos/seed/savings/400/400" 
            alt="Savings Illustration"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
    {/* Background blobs */}
    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-400/20 blur-[100px] rounded-full"></div>
    <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-400/10 blur-[80px] rounded-full"></div>
  </div>
);

const Pagination = () => (
  <div className="mt-16 flex items-center justify-center gap-2">
    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
      <ChevronLeft className="w-5 h-5" />
    </button>
    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-black shadow-md shadow-primary/20">1</button>
    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold transition-all">2</button>
    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold transition-all">3</button>
    <span className="px-2 text-gray-300 font-bold">...</span>
    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 font-bold transition-all">12</button>
    <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

// --- Main Page Component ---

export const CouponsPage = () => {
  const [coupons, setCoupons] = useState<{ coupon: Coupon; merchant: Merchant }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await getPublicCoupons();
        const formatted = data.map((c: any) => ({
          coupon: c as Coupon,
          merchant: c.merchants as Merchant
        }));
        
        // Smart randomization:
        // 1. Separate featured
        const featured = formatted.filter(item => item.coupon.is_featured);
        const nonFeatured = formatted.filter(item => !item.coupon.is_featured);
        
        // 2. Shuffle featured
        const shuffledFeatured = shuffleArray(featured);
        
        // 3. Group non-featured by priority_score and shuffle within groups
        const groupedByPriority: Record<number, typeof formatted> = {};
        nonFeatured.forEach(item => {
          const score = item.coupon.priority_score || 0;
          if (!groupedByPriority[score]) groupedByPriority[score] = [];
          groupedByPriority[score].push(item);
        });
        
        const sortedPriorities = Object.keys(groupedByPriority)
          .map(Number)
          .sort((a, b) => b - a);
          
        const shuffledNonFeatured = sortedPriorities.flatMap(score => 
          shuffleArray(groupedByPriority[score])
        );
        
        const allCoupons = [...shuffledFeatured, ...shuffledNonFeatured];
        setCoupons(allCoupons);

        // Check for openCoupon in URL
        const params = new URLSearchParams(window.location.search);
        const couponId = params.get('openCoupon');
        if (couponId) {
          const itemToOpen = allCoupons.find(item => item.coupon.id === couponId);
          if (itemToOpen) {
            setSelectedCoupon(itemToOpen.coupon);
            setSelectedMerchant(itemToOpen.merchant);
            setIsModalOpen(true);
            
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleShowCode = (coupon: Coupon, merchant: Merchant) => {
    const clickoutUrl = coupon.tracking_link || merchant.tracking_link;

    // 1. Track coupon click (async)
    trackCouponClick({
      merchant_id: merchant.id,
      merchant_name: merchant.name,
      coupon_id: coupon.id,
      coupon_title: coupon.title,
      coupon_code: coupon.coupon_code,
      deal_type: coupon.deal_type,
      page_type: 'coupons',
      tracking_link: clickoutUrl
    });

    if (clickoutUrl) {
      // 2. Open a NEW TopCoupons.ai tab pointing to the same page with auto-open param
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('openCoupon', coupon.id);
      
      const newTab = window.open(currentUrl.toString(), '_blank');
      
      // 3. Navigate the CURRENT tab to the tracking link
      if (newTab) {
        window.location.href = clickoutUrl;
      } else {
        // Fallback: open modal on current page
        setSelectedCoupon(coupon);
        setSelectedMerchant(merchant);
        setIsModalOpen(true);
      }
    } else {
      // No tracking link: open modal normally
      setSelectedCoupon(coupon);
      setSelectedMerchant(merchant);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedCoupon(null);
      setSelectedMerchant(null);
    }, 300);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(item => {
      const matchesFilter = filter === 'all' || item.coupon.deal_type === filter;
      const matchesSearch = 
        item.coupon.title.toLowerCase().includes(search.toLowerCase()) ||
        item.merchant.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [coupons, filter, search]);

  // Track search on Coupons page
  useEffect(() => {
    if (search.length < 2) return;

    const timer = setTimeout(() => {
      trackSearch({
        search_term: search,
        results_count: filteredCoupons.length,
        page_type: 'coupons'
      });
    }, 1000); // Debounce for filter-style search

    return () => clearTimeout(timer);
  }, [search, filteredCoupons.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-black">Loading Savings Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <SEO 
        title="Top Coupons & Promo Codes | TopCoupons.ai"
        description="Browse fresh coupon codes and trending deals from leading brands, updated regularly. Our AI-powered engine curates the highest-value savings."
        canonical="/coupons"
      />
      <div className="max-w-screen-2xl mx-auto flex">
        {/* SideNavBar - Matching Stitch Design */}
        <aside className="hidden xl:flex flex-col gap-2 p-8 h-full w-64 sticky top-20">
          <div className="mb-8">
            <div className="text-xl font-black text-primary tracking-tighter font-headline">TopCoupons.ai</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Smart Savings AI</div>
          </div>
          <nav className="space-y-1">
            <Link to="/" className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white hover:text-gray-900 rounded-xl font-black text-sm transition-all">
              <HomeIcon className="w-5 h-5" /> Home
            </Link>
            <Link to="/stores" className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white hover:text-gray-900 rounded-xl font-black text-sm transition-all">
              <Store className="w-5 h-5" /> All Stores
            </Link>
            <Link to="/coupons" className="flex items-center gap-3 p-3 text-primary bg-sky-50 rounded-xl font-black text-sm">
              <LayoutGrid className="w-5 h-5 fill-current" /> Top Coupons
            </Link>
            <Link to="#" className="flex items-center gap-3 p-3 text-gray-400 hover:bg-white hover:text-gray-900 rounded-xl font-black text-sm transition-all">
              <Bookmark className="w-5 h-5" /> Favorites
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-12 py-12">
          <CouponsHero />
          <CouponFilterBar 
            filter={filter} 
            setFilter={setFilter} 
            search={search} 
            setSearch={setSearch} 
          />

          {filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCoupons.map((item, index) => (
                <React.Fragment key={item.coupon.id}>
                  <GlobalCouponCard 
                    coupon={item.coupon} 
                    merchant={item.merchant} 
                    onShowCode={handleShowCode}
                    isFeatured={index === 0 && filter === 'all' && !search} // Only show featured if no filter/search
                  />
                  {/* Insert Newsletter after 4 items */}
                  {index === 3 && <NewsletterSection />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100">
              <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}

          <Pagination />
        </main>
      </div>

      <CouponModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        coupon={selectedCoupon}
        merchant={selectedMerchant}
      />
    </div>
  );
};
