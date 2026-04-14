import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchIntelligence } from '../services/supabaseService';
import { Merchant, Coupon } from '../types/database';
import { trackSearch } from '../lib/analytics';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ merchants: Merchant[], coupons: (Coupon & { merchants: Merchant })[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const performSearch = async () => {
      if (query.length < 2) {
        setResults(null);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const data = await searchIntelligence(query);
        setResults(data);
        setShowDropdown(true);
        
        // Track search event
        trackSearch({
          search_term: query,
          results_count: (data.merchants?.length || 0) + (data.coupons?.length || 0),
          page_type: 'header'
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(performSearch, 500); // Increased debounce for analytics
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
    setQuery('');
  }, [location.pathname]);

  const handleSelect = (type: 'merchant' | 'coupon', item: any) => {
    if (type === 'merchant') {
      navigate(`/${item.slug}-coupons`);
    } else {
      navigate(`/${item.merchants.slug}-coupons?couponId=${item.id}`);
    }
    setQuery('');
    setResults(null);
    setShowDropdown(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Stores', path: '/stores' },
    { name: 'Coupons', path: '/coupons' },
    { name: 'Categories', path: '/categories' },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black tracking-tighter text-sky-900 shrink-0">
              TopCoupons.ai
            </Link>
            <nav className="hidden lg:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'text-sky-700 font-bold border-b-2 border-sky-700 pb-1'
                      : 'text-gray-500 hover:text-sky-600 transition-colors'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search & Action */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl ml-8 relative" ref={dropdownRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 w-4 h-4" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowDropdown(true)}
                placeholder="Search for brands or deals..." 
                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-sky-500/20 text-sm outline-none transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showDropdown && results && (results.merchants.length > 0 || results.coupons.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left z-[110]"
                >
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {results.merchants.length > 0 && (
                      <div className="p-3 border-b border-gray-50">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Stores</div>
                        <div className="grid grid-cols-1 gap-1">
                          {results.merchants.map(m => (
                            <button 
                              key={m.id}
                              onClick={() => handleSelect('merchant', m)}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all group"
                            >
                              <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center shadow-sm shrink-0">
                                <img src={m.logo_url || ''} alt={m.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <span className="font-bold text-gray-900 group-hover:text-sky-600 text-sm">{m.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.coupons.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Coupons</div>
                        <div className="grid grid-cols-1 gap-1">
                          {results.coupons.map(c => (
                            <button 
                              key={c.id}
                              onClick={() => handleSelect('coupon', c)}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all group text-left"
                            >
                              <div className="w-8 h-8 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center shadow-sm shrink-0">
                                <img src={c.merchants?.logo_url || ''} alt={c.merchants?.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 group-hover:text-sky-600 line-clamp-1 text-sm">{c.title}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{c.merchants?.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 w-4 h-4" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for brands..." 
                className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
              />
            </div>
            {/* Mobile Search Results */}
            {results && (results.merchants.length > 0 || results.coupons.length > 0) && (
              <div className="max-h-[300px] overflow-y-auto space-y-2 bg-gray-50/50 rounded-xl p-2">
                {results.merchants.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => { handleSelect('merchant', m); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 p-2 w-full text-left"
                  >
                    <img src={m.logo_url || ''} alt={m.name} className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-gray-900">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
            <nav className="flex flex-col gap-4 font-bold text-gray-600">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${
                    isActive(link.path)
                      ? 'text-sky-700'
                      : 'text-gray-500 hover:text-sky-600 transition-colors'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
