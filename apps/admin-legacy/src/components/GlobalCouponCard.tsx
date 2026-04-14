import React from 'react';
import { ShieldCheck, Star, ArrowRight } from 'lucide-react';
import { Coupon, Merchant } from '../types/database';

interface GlobalCouponCardProps {
  coupon: Coupon;
  merchant: Merchant;
  onShowCode: (coupon: Coupon, merchant: Merchant) => void;
  isFeatured?: boolean;
}

export const GlobalCouponCard = ({ coupon, merchant, onShowCode, isFeatured }: GlobalCouponCardProps) => {
  // Extract discount info from title if possible
  const discountMatch = coupon.title.match(/(\d+%|\$\d+)\s+OFF/i);
  const discountValue = discountMatch ? discountMatch[1] : 'DEAL';

  if (isFeatured) {
    return (
      <article className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-white transition-all hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex flex-col md:flex-row border border-gray-50">
        <div className="w-full md:w-2/5 relative h-48 md:h-auto overflow-hidden bg-gray-50 flex items-center justify-center p-6 md:p-8">
          {/* Branded Logo Presentation */}
          <div className="relative z-10 w-32 h-32 md:w-full md:aspect-square bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <img 
              className="w-full h-full object-contain" 
              src={merchant.logo_url || 'https://picsum.photos/seed/merchant/200/200'} 
              alt={merchant.name}
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Subtle background pattern/glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white -z-0"></div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-100/50 rounded-full blur-3xl"></div>
          
          <div className="absolute top-4 left-4 bg-sky-100 text-sky-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm z-20">
            <Star className="w-3 h-3 fill-current" />
            FEATURED EXCLUSIVE
          </div>
        </div>
        <div className="p-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="bg-gray-50 p-3 rounded-2xl w-16 h-16 flex items-center justify-center border border-gray-100">
                <img 
                  className="w-full h-auto object-contain" 
                  src={merchant.logo_url || 'https://picsum.photos/seed/merchant/200/200'} 
                  alt={merchant.name}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-emerald-50 text-tertiary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                Verified
              </div>
            </div>
            <h3 className="text-3xl font-black mb-2 tracking-tighter text-gray-900 group-hover:text-primary transition-colors">
              {coupon.title}
            </h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed font-sans">
              {coupon.short_description || `Save big on ${merchant.name} with this exclusive offer.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onShowCode(coupon, merchant)}
              className="flex-1 bg-gradient-to-br from-primary to-sky-500 text-white py-4 px-6 rounded-xl font-black flex items-center justify-center gap-2 group-hover:shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>{coupon.deal_type === 'code' ? 'SHOW CODE' : 'GET DEAL'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white rounded-[2rem] p-6 transition-all hover:shadow-[0px_12px_32px_rgba(25,28,30,0.06)] flex flex-col border border-gray-50">
      <div className="flex justify-between items-start mb-8">
        <div className="bg-gray-50 p-3 rounded-2xl w-14 h-14 flex items-center justify-center border border-gray-100">
          <img 
            className="w-full h-auto object-contain" 
            src={merchant.logo_url || 'https://picsum.photos/seed/merchant/200/200'} 
            alt={merchant.name}
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-tertiary font-black text-2xl tracking-tighter">{discountValue}</span>
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck className="text-tertiary w-4 h-4 fill-emerald-50" />
          <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Verified Today</span>
        </div>
        <h3 className="text-xl font-black tracking-tighter mb-2 text-gray-900 group-hover:text-primary transition-colors">
          {coupon.title}
        </h3>
        <p className="text-gray-500 text-sm font-sans leading-relaxed line-clamp-2">
          {coupon.short_description || `Save big on ${merchant.name} with this exclusive offer.`}
        </p>
      </div>
      <button 
        onClick={() => onShowCode(coupon, merchant)}
        className="mt-auto w-full bg-secondary text-white py-3 rounded-xl font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
      >
        {coupon.deal_type === 'code' ? 'SHOW CODE' : 'GET DEAL'}
      </button>
    </article>
  );
};
