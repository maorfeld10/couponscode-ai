import React from 'react';
import { Link } from 'react-router-dom';
import { 
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
import { SEO } from '../components/SEO';

export const CategoriesPage = () => {
  const categories = [
    { name: 'Fashion', icon: ShoppingBag, color: 'bg-pink-50 text-pink-600', count: '1,200+' },
    { name: 'Electronics', icon: Zap, color: 'bg-blue-50 text-blue-600', count: '850+' },
    { name: 'Travel', icon: Rocket, color: 'bg-purple-50 text-purple-600', count: '420+' },
    { name: 'Food & Drink', icon: Tag, color: 'bg-orange-50 text-orange-600', count: '630+' },
    { name: 'Health & Beauty', icon: Heart, color: 'bg-emerald-50 text-emerald-600', count: '510+' },
    { name: 'Home & Garden', icon: HomeIcon, color: 'bg-indigo-50 text-indigo-600', count: '940+' },
    { name: 'Tech', icon: Monitor, color: 'bg-sky-50 text-sky-600', count: '720+' },
    { name: 'Dining', icon: Utensils, color: 'bg-red-50 text-red-600', count: '310+' },
    { name: 'Wellness', icon: Dumbbell, color: 'bg-teal-50 text-teal-600', count: '280+' },
    { name: 'Business', icon: Briefcase, color: 'bg-slate-50 text-slate-600', count: '150+' },
    { name: 'Gifts', icon: Gift, color: 'bg-rose-50 text-rose-600', count: '440+' },
    { name: 'Coffee', icon: Coffee, color: 'bg-amber-50 text-amber-600', count: '120+' },
    { name: 'Automotive', icon: Car, color: 'bg-gray-50 text-gray-600', count: '190+' },
    { name: 'Photography', icon: Camera, color: 'bg-cyan-50 text-cyan-600', count: '85+' },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      <SEO 
        title="Coupon Categories | TopCoupons.ai"
        description="Shop by category and find the best coupons for fashion, electronics, home, beauty, and more. Explore thousands of deals organized by what you love most."
        canonical="/categories"
      />
      
      <div className="max-w-screen-2xl mx-auto px-6 pt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-4">
            Browse by <span className="text-sky-600">Category</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Find the best deals and verified promo codes organized by what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map(cat => (
            <Link 
              key={cat.name} 
              to={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} 
              className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <span className="font-black text-gray-900 text-base mb-1">{cat.name}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.count} Deals</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
