import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Store, 
  LayoutGrid, 
  CheckCircle2, 
  ChevronDown,
  Loader2,
  Star,
  ShoppingBag,
  Tag,
  Clock,
  Sparkles,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Merchant, Coupon } from '../types/database';
import { getFeaturedMerchants, getTrendingCoupons, searchIntelligence } from '../services/supabaseService';
import { GlobalCouponCard } from '../components/GlobalCouponCard';
import { CouponModal } from '../components/CouponModal';
import { trackCouponClick } from '../lib/analytics';
import { SEO } from '../components/SEO';

// --- Sub-components ---

const Hero = () => {
  return (
    <section className="relative pt-8 pb-4 md:pt-12 md:pb-6 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-2xl h-full -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-primary text-xs font-black tracking-widest uppercase mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
            AI-Powered Savings Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-3 leading-[0.95]">
            Find the Best <span className="text-primary">Coupons</span> & <br className="hidden md:block" /> Promo Codes
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-6 font-sans leading-relaxed">
            Stop overpaying. Our intelligence engine scans thousands of stores daily to bring you fresh, editor-reviewed savings in seconds.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/stores" className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-900/20 text-lg">
            Browse Stores
          </Link>
          <Link to="/coupons" className="px-10 py-5 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black hover:bg-gray-50 transition-all active:scale-95 shadow-sm text-lg">
            View All Coupons
          </Link>
        </div>
      </div>
    </section>
  );
};

const FeaturedStores = ({ merchants }: { merchants: Merchant[] }) => (
  <section className="pt-6 pb-10 bg-surface-container-low">
    <div className="max-w-screen-2xl mx-auto px-6">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-2">Top Brands</div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900">Featured Stores</h2>
        </div>
        <Link to="/stores" className="hidden md:flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all">
          View All Stores <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {merchants.map(m => (
          <Link 
            key={m.id} 
            to={`/${m.slug}-coupons`}
            className="group bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl p-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <img 
                src={m.logo_url || ''} 
                alt={m.name} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-black text-gray-900 group-hover:text-primary transition-colors text-sm md:text-base">{m.name}</span>
            <div className="mt-2 text-[10px] font-bold text-tertiary bg-emerald-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              View Offers
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const TrendingCoupons = ({ coupons, onShowCode }: { coupons: (Coupon & { merchants: Merchant })[], onShowCode: (c: Coupon, m: Merchant) => void }) => (
  <section className="py-20">
    <div className="max-w-screen-2xl mx-auto px-6">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="text-secondary font-black text-[10px] uppercase tracking-widest mb-2">Live Savings</div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900">Trending Coupons</h2>
        </div>
        <Link to="/coupons" className="hidden md:flex items-center gap-2 text-secondary font-black text-sm hover:gap-3 transition-all">
          View All Coupons <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coupons.map((c, idx) => (
          <GlobalCouponCard 
            key={c.id}
            coupon={c}
            merchant={c.merchants}
            onShowCode={onShowCode}
            isFeatured={idx === 0}
          />
        ))}
      </div>
    </div>
  </section>
);

const Categories = () => {
  const categories = [
    { name: 'Fashion', icon: ShoppingBag, color: 'bg-pink-50 text-pink-600', count: '1,200+', slug: 'fashion' },
    { name: 'Electronics', icon: Zap, color: 'bg-blue-50 text-blue-600', count: '850+', slug: 'electronics' },
    { name: 'Travel', icon: Rocket, color: 'bg-purple-50 text-purple-600', count: '420+', slug: 'travel' },
    { name: 'Food & Drink', icon: Tag, color: 'bg-orange-50 text-orange-600', count: '630+', slug: 'food-drink' },
    { name: 'Health', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600', count: '510+', slug: 'health-beauty' },
    { name: 'Home', icon: LayoutGrid, color: 'bg-indigo-50 text-indigo-600', count: '940+', slug: 'home-garden' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-500 max-w-xl">Explore thousands of deals organized by what you love most.</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.name} 
              to={`/category/${cat.slug}`} 
              className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <span className="font-black text-gray-900 text-sm mb-1">{cat.name}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.count} Deals</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => (
  <section className="py-24 bg-primary overflow-hidden relative">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
    <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="flex gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8 text-sky-300" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Fresh Savings</h3>
            <p className="text-sky-100/70 leading-relaxed">Our AI engine and community of shoppers verify deals to ensure you get the best possible savings.</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Clock className="w-8 h-8 text-sky-300" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Real-Time Updates</h3>
            <p className="text-sky-100/70 leading-relaxed">Deals are updated every minute. If a new code drops, you'll find it here first.</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <TrendingUp className="w-8 h-8 text-sky-300" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Smart Savings</h3>
            <p className="text-sky-100/70 leading-relaxed">We don't just show coupons; we show the best ones based on success rate and value.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SEOContent = () => (
  <section className="py-20 border-t border-gray-100">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-3xl font-black tracking-tighter text-gray-900 mb-8">Save Smarter with TopCoupons.ai</h2>
      <div className="space-y-6 text-gray-500 leading-relaxed text-left">
        <p>
          Welcome to TopCoupons.ai, your ultimate destination for the most reliable promo codes, discount codes, and online deals. Our mission is simple: to help you save money every time you shop online. By leveraging advanced AI technology, we scan thousands of retailers across the globe to bring you curated savings that actually work.
        </p>
        <p>
          Whether you're looking for fashion deals from top brands, the latest electronics at a fraction of the price, or travel discounts for your next getaway, our curated lists are designed to provide maximum value. We understand the frustration of expired codes, which is why our system prioritizes recently checked and high-success-rate offers.
        </p>
        <p>
          Join millions of smart shoppers who trust TopCoupons.ai for their daily savings. From seasonal sales like Black Friday and Cyber Monday to everyday exclusive promo codes, we ensure you never pay full price again. Browse our store directory or search for your favorite brand to start saving today.
        </p>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does TopCoupons.ai verify its codes?",
      a: "We use a hybrid approach combining AI-driven scanning and community feedback. Our engine tests codes in real-time, and we prioritize those with the highest success rates reported by our users."
    },
    {
      q: "Is TopCoupons.ai free to use?",
      a: "Yes, absolutely! Our service is free for shoppers. We may earn a small commission from some merchants when you use our links, which helps us keep the site running and the AI engine sharp."
    },
    {
      q: "Why didn't my promo code work?",
      a: "While we strive for accuracy, merchants can change or expire codes without notice. Some codes also have specific exclusions (e.g., sale items or minimum spend). Always check the 'Terms & Conditions' on the merchant's site."
    },
    {
      q: "How often are new coupons added?",
      a: "Our database is updated 24/7. New coupons are added as soon as they are discovered by our AI or shared by our merchant partners."
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-black tracking-tighter text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-black text-gray-900">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-8 text-gray-500 leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Page ---

export const HomePage = () => {
  const [featuredMerchants, setFeaturedMerchants] = useState<Merchant[]>([]);
  const [trendingCoupons, setTrendingCoupons] = useState<(Coupon & { merchants: Merchant })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchants, coupons] = await Promise.all([
          getFeaturedMerchants(12),
          getTrendingCoupons(6)
        ]);
        setFeaturedMerchants(merchants);
        const allTrending = coupons as (Coupon & { merchants: Merchant })[];
        setTrendingCoupons(allTrending);

        // Check for openCoupon in URL
        const params = new URLSearchParams(window.location.search);
        const couponId = params.get('openCoupon');
        if (couponId) {
          const itemToOpen = allTrending.find(c => c.id === couponId);
          if (itemToOpen) {
            setSelectedCoupon(itemToOpen);
            setSelectedMerchant(itemToOpen.merchants);
            setIsModalOpen(true);
            
            // Clean up URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      page_type: 'homepage',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-black">Initializing Savings AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="TopCoupons.ai | Best Coupons & Promo Codes"
        description="Find fresh coupon codes, promo offers, and savings tips for top stores like Nike, Sephora, Amazon, and more."
        canonical="/"
      />
      <Hero />
      <FeaturedStores merchants={featuredMerchants} />
      <TrendingCoupons coupons={trendingCoupons} onShowCode={handleShowCode} />
      <Categories />
      <TrustSection />
      <FAQ />
      <SEOContent />

      <CouponModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={selectedCoupon}
        merchant={selectedMerchant}
      />
    </div>
  );
};
