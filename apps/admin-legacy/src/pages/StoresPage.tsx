import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Bolt, 
  Store, 
  ChevronRight, 
  Shirt, 
  Monitor, 
  Home as HomeIcon, 
  Utensils, 
  Plane, 
  Dumbbell,
  LayoutGrid,
  Bookmark,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Merchant } from '../types/database';
import { getPublicMerchants } from '../services/supabaseService';
import { trackSearch } from '../lib/analytics';
import { SEO } from '../components/SEO';

// --- Sub-components ---

const StoresHero = ({ onSearch }: { onSearch: (val: string) => void }) => (
  <header className="py-8 md:py-12">
    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">All Stores</h1>
    <p className="text-gray-500 max-w-2xl text-base md:text-lg leading-relaxed">
      Browse our curated intelligence database of over 5,000 global merchants. Verified savings algorithms updated every 60 seconds.
    </p>
    
    {/* Floating Search Bar */}
    <div className="mt-8 max-w-3xl">
      <div className="relative p-1.5 md:p-2 bg-white shadow-[0px_12px_32px_rgba(25,28,30,0.06)] rounded-xl md:rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center border border-gray-50 gap-2 sm:gap-0">
        <div className="flex items-center flex-1">
          <Search className="ml-4 text-sky-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <input 
            className="flex-1 border-none focus:ring-0 text-gray-900 bg-transparent py-3 md:py-4 px-3 md:px-4 text-base md:text-lg placeholder:text-gray-400 min-w-0" 
            placeholder="Filter by store name..." 
            type="text"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <button className="bg-gradient-to-br from-sky-700 to-sky-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-black shadow-lg shadow-sky-100 active:scale-95 transition-transform text-sm md:text-base whitespace-nowrap">
          Search Intelligence
        </button>
      </div>
    </div>
  </header>
);

const FeaturedStoresGrid = ({ stores }: { stores: Merchant[] }) => (
  <section className="mb-12 md:mb-20">
    <div className="flex justify-between items-end mb-6 md:mb-8">
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">Trending Stores</h2>
      <span className="hidden sm:flex text-emerald-600 font-black items-center gap-1 text-xs md:text-sm bg-emerald-50 px-3 py-1 rounded-full">
        <Bolt className="w-4 h-4 fill-current" />
        Live Optimization
      </span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {stores.map(store => (
        <Link 
          key={store.id} 
          to={`/${store.slug}-coupons`}
          className="group bg-white p-4 md:p-8 rounded-xl md:rounded-2xl transition-all duration-300 hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)] border border-gray-50 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 md:w-24 md:h-24 mb-3 md:mb-6 relative grayscale group-hover:grayscale-0 transition-all duration-500">
            <img 
              src={store.logo_url || 'https://picsum.photos/seed/merchant/200/200'} 
              alt={store.name} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="font-black text-sm md:text-lg text-gray-900 mb-0.5 md:mb-1 truncate w-full px-1">{store.name}</h3>
          <p className="text-emerald-600 font-black text-[10px] md:text-sm">Active Deals</p>
        </Link>
      ))}
    </div>
  </section>
);

const AlphabetNav = () => {
  const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return (
    <section className="mb-8 md:mb-12 bg-gray-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl flex flex-wrap justify-center gap-0.5 md:gap-1 border border-gray-100">
      {alphabet.map(letter => (
        <a 
          key={letter}
          href={`#${letter}`}
          className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center rounded-lg font-black text-[10px] md:text-sm transition-all text-gray-400 hover:bg-white hover:text-sky-600"
        >
          {letter}
        </a>
      ))}
    </section>
  );
};

const StoreDirectory = ({ stores }: { stores: Merchant[] }) => {
  const groupedStores = useMemo(() => {
    const groups: Record<string, Merchant[]> = {};
    stores.forEach(store => {
      const firstLetter = store.name[0].toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(store);
    });
    return groups;
  }, [stores]);

  const sortedKeys = Object.keys(groupedStores).sort((a, b) => {
    if (a === "#") return -1;
    if (b === "#") return 1;
    return a.localeCompare(b);
  });

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {sortedKeys.map(key => (
        <div key={key} id={key} className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
            <span className="text-3xl md:text-4xl font-black text-gray-200">{key}</span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>
          <ul className="space-y-2 md:space-y-4">
            {groupedStores[key].sort((a, b) => a.name.localeCompare(b.name)).map(store => (
              <li key={store.id}>
                <Link 
                  to={`/${store.slug}-coupons`}
                  className="text-gray-600 hover:text-sky-600 font-bold flex justify-between items-center group transition-colors py-1"
                >
                  <span className="text-sm md:text-base truncate mr-2">{store.name}</span>
                  <span className="text-[9px] md:text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity font-black uppercase flex-shrink-0">
                    Live Deals
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};

export const StoresPage = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const data = await getPublicMerchants();
        setMerchants(data);
      } catch (error) {
        console.error('Error fetching merchants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const filteredMerchants = useMemo(() => {
    if (!searchQuery) return merchants;
    return merchants.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [merchants, searchQuery]);

  // Track search on Stores page
  useEffect(() => {
    if (searchQuery.length < 2) return;

    const timer = setTimeout(() => {
      trackSearch({
        search_term: searchQuery,
        results_count: filteredMerchants.length,
        page_type: 'stores'
      });
    }, 1000); // Longer debounce for filter-style search

    return () => clearTimeout(timer);
  }, [searchQuery, filteredMerchants.length]);

  const featuredStores = useMemo(() => {
    const featured = merchants.filter(m => m.is_featured);
    if (featured.length > 0) return featured.slice(0, 4);
    return merchants.slice(0, 4);
  }, [merchants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-sky-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-black">Loading Stores Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO 
        title="All Stores | TopCoupons.ai"
        description="Browse our full list of partner stores and find the best deals for your favorite brands. Verified savings algorithms updated every 60 seconds."
        canonical="/stores"
      />
      <div className="max-w-screen-2xl mx-auto flex">
        {/* SideNavBar - Matching Stitch Design */}
        <aside className="hidden xl:flex flex-col gap-2 p-8 h-full w-64 sticky top-20">
          <div className="mb-8">
            <div className="text-xl font-black text-sky-700 tracking-tighter">TopCoupons.ai</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Smart Savings AI</div>
          </div>
          <nav className="space-y-1">
            <Link to="/" className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-black text-sm transition-all">
              <HomeIcon className="w-5 h-5" /> Home
            </Link>
            <Link to="/stores" className="flex items-center gap-3 p-3 text-sky-700 bg-sky-50 rounded-xl font-black text-sm">
              <Store className="w-5 h-5 fill-current" /> All Stores
            </Link>
            <Link to="/categories" className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-black text-sm transition-all">
              <LayoutGrid className="w-5 h-5" /> Categories
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 lg:px-10 pb-20 w-full overflow-hidden">
          <StoresHero onSearch={setSearchQuery} />
          
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              {searchQuery ? (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                      Search Results for "{searchQuery}"
                    </h2>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-sm font-bold text-sky-600 hover:text-sky-700"
                    >
                      Clear Search
                    </button>
                  </div>
                  
                  {filteredMerchants.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {filteredMerchants.map(store => (
                        <Link 
                          key={store.id} 
                          to={`/${store.slug}-coupons`}
                          className="group bg-white p-6 rounded-2xl transition-all duration-300 hover:shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center"
                        >
                          <div className="w-16 h-16 mb-4">
                            <img 
                              src={store.logo_url || ''} 
                              alt={store.name} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h3 className="font-black text-sm text-gray-900 truncate w-full">{store.name}</h3>
                          <p className="text-emerald-600 font-black text-[10px] mt-1">Trending Deals</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">No stores found matching your search.</p>
                    </div>
                  )}
                </section>
              ) : (
                <>
                  <FeaturedStoresGrid stores={featuredStores} />
                  <AlphabetNav />
                  <StoreDirectory stores={filteredMerchants} />
                </>
              )}
            </div>

            {/* Sidebar: Browse by Category */}
            <aside className="lg:w-80 shrink-0">
              <div className="bg-sky-50/50 rounded-3xl p-8 border border-sky-100 sticky top-24">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-sky-600" /> Browse by Category
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {[
                    { name: 'Fashion', icon: <Shirt className="w-5 h-5" />, slug: 'fashion' },
                    { name: 'Tech', icon: <Monitor className="w-5 h-5" />, slug: 'tech' },
                    { name: 'Home', icon: <HomeIcon className="w-5 h-5" />, slug: 'home-garden' },
                    { name: 'Dining', icon: <Utensils className="w-5 h-5" />, slug: 'dining' },
                    { name: 'Travel', icon: <Plane className="w-5 h-5" />, slug: 'travel' },
                    { name: 'Wellness', icon: <Dumbbell className="w-5 h-5" />, slug: 'wellness' },
                  ].map(cat => (
                    <Link 
                      key={cat.name} 
                      to={`/category/${cat.slug}`} 
                      className="bg-white p-4 rounded-xl flex items-center gap-3 hover:shadow-md transition-all group border border-gray-50"
                    >
                      <div className="text-gray-400 group-hover:text-sky-600 transition-colors">
                        {cat.icon}
                      </div>
                      <span className="font-black text-sm text-gray-900">{cat.name}</span>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-sky-100/50">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-sky-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Bolt className="w-5 h-5 text-emerald-600 fill-current" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</div>
                      <div className="text-xs font-bold text-gray-900">New deals every 60s</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          
          {/* SEO Content Block */}
          <article className="mt-20 md:mt-32 p-6 md:p-12 bg-gray-50 rounded-3xl md:rounded-[2.5rem] border border-gray-100">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-black mb-6 md:mb-8 text-gray-900 tracking-tighter">Your Intelligence-Driven Savings Compass</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-gray-500 leading-relaxed">
                <div>
                  <p className="mb-4 md:mb-6 font-black text-sky-700 uppercase text-[10px] md:text-xs tracking-widest">Precision Filtering Technology</p>
                  <p className="text-xs md:text-sm">
                    TopCoupons.ai isn't just a list; it's a dynamic ecosystem of financial intelligence. Our proprietary AI scans thousands of retailers simultaneously to ensure that every promo code listed under our "All Stores" section is active, verified, and optimized for your specific cart value. We eliminate the frustration of expired codes by using real-time redemption data.
                  </p>
                </div>
                <div>
                  <p className="mb-4 md:mb-6 font-black text-sky-700 uppercase text-[10px] md:text-xs tracking-widest">Merchant Partnerships & Quality Control</p>
                  <p className="text-xs md:text-sm">
                    From global powerhouses like Amazon and Sephora to boutique artisan labels, we maintain a strict editorial standard. Every merchant on this list has passed our "Savings Viability" test—meaning they offer consistent value to our community. Use the A-Z navigation above to explore our extensive library of savings opportunities across every retail category imaginable.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </div>
  );
};
