import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowRight, ShieldCheck, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Merchant as DbMerchant, Coupon as DbCoupon } from '../types/database';
import { Merchant as MockMerchant, Coupon as MockCoupon } from '../data/mockData';

import { trackCouponClick } from '../lib/analytics';
import { NewsletterForm } from './NewsletterForm';

type Merchant = DbMerchant | MockMerchant;
type Coupon = DbCoupon | MockCoupon;

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  merchant: Merchant | null;
}

export const CouponModal = ({ isOpen, onClose, coupon, merchant }: CouponModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  if (!coupon || !merchant) return null;

  // Helper to get field values regardless of whether it's mock or DB data
  const getMerchantLogo = (m: Merchant) => (m as DbMerchant).logo_url || (m as MockMerchant).logo || 'https://picsum.photos/seed/merchant/200/200';
  const getCouponCode = (c: Coupon) => (c as DbCoupon).coupon_code || (c as MockCoupon).code;
  const getCouponType = (c: Coupon) => (c as DbCoupon).deal_type || (c as MockCoupon).type;
  const getCouponDescription = (c: Coupon) => (c as DbCoupon).short_description || (c as MockCoupon).description || 'Save big on your next purchase with this exclusive offer.';
  const getStoreUrl = (c: Coupon, m: Merchant) => {
    const dbC = c as DbCoupon;
    const dbM = m as DbMerchant;
    const mockM = m as MockMerchant;
    return dbC.tracking_link || dbM.tracking_link || dbM.homepage_link || mockM.tracking_link || mockM.homepage_url || '#';
  };

  const handleCopy = () => {
    const code = getCouponCode(coupon);
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
    }
  };

  const handleContinueToStore = () => {
    trackCouponClick({
      merchant_id: (merchant as DbMerchant).id,
      merchant_name: merchant.name,
      coupon_id: (coupon as DbCoupon).id,
      coupon_title: coupon.title,
      coupon_code: getCouponCode(coupon),
      deal_type: getCouponType(coupon),
      page_type: 'modal',
      click_type: 'continue_to_store',
      tracking_link: getStoreUrl(coupon, merchant)
    });
  };

  const storeUrl = getStoreUrl(coupon, merchant);
  const couponCode = getCouponCode(coupon);
  const couponType = getCouponType(coupon);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg max-h-full md:max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header - Fixed at top */}
            <div className="flex items-center justify-between px-5 py-3 md:py-4 border-b border-gray-100 bg-white shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 p-1.5">
                  <img 
                    src={getMerchantLogo(merchant)} 
                    alt={merchant.name} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Merchant</span>
                  <p className="text-sm md:text-base font-black text-gray-900 leading-none">{merchant.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 md:py-8">
              <div className="text-center md:text-left mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Verified by AI</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                  {coupon.title}
                </h2>
                <p className="mt-1.5 text-gray-500 text-xs leading-relaxed">
                  {getCouponDescription(coupon)}
                </p>
              </div>

              {/* Coupon Box Cluster */}
              <div className="space-y-3 mb-8">
                {couponType === 'code' && couponCode ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                    <div 
                      className="flex-1 rounded-xl flex items-center justify-between px-5 py-3.5 bg-sky-50 border-2 border-dashed border-sky-200 cursor-pointer group"
                      onClick={handleCopy}
                    >
                      <span className="text-2xl font-black tracking-[0.15em] text-sky-700 font-mono">{couponCode}</span>
                      <Copy className="w-4 h-4 text-sky-400 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`px-6 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 min-w-[120px] text-sm cursor-pointer ${
                        copied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-sky-700 text-white hover:bg-sky-800'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : null}
                      {copied ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>
                ) : null}
                
                <a 
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleContinueToStore}
                  className="w-full bg-gradient-to-r from-sky-600 to-sky-500 text-white py-4 rounded-xl font-black text-base hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  Continue to Store
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Newsletter Section */}
              <div className="bg-sky-50/50 rounded-2xl p-4 md:p-5 mb-6 border border-sky-100 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-100/50 rounded-full blur-2xl" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base font-black text-sky-900 leading-tight">Get fresh deals in your inbox</h3>
                    <p className="text-[11px] text-sky-700 font-medium mt-0.5">
                      Weekly savings from top stores. No spam.
                    </p>
                  </div>
                  <div className="w-full sm:w-[280px] shrink-0">
                    <NewsletterForm 
                      source="coupon_modal"
                      merchantId={(merchant as DbMerchant).id}
                      placeholder="Email address"
                      buttonText="Join Now"
                      inputClassName="bg-white border-sky-100 focus:ring-sky-500/10 h-10 text-xs py-0"
                      buttonClassName="bg-sky-700 text-white hover:bg-sky-800 shadow-sm h-10 text-xs px-4 min-w-[90px] py-0"
                    />
                  </div>
                </div>
              </div>

              {/* Details Accordion */}
              <div className="border-t border-gray-100 pt-4">
                <button 
                  onClick={() => setShowTerms(!showTerms)}
                  className="flex items-center justify-between w-full text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">Details & Terms</span>
                  {showTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {showTerms && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 text-[10px] leading-relaxed text-gray-400 space-y-1.5 pb-1">
                        <p>• Offer valid on select styles only. Discount applies at checkout.</p>
                        <p>• Cannot be combined with other promotional codes or offers.</p>
                        <p>• Limited time offer. Some exclusions may apply.</p>
                        <p>• Verified status is checked regularly by our Editorial Intelligence system.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Modal Footer (Trust Bar) */}
            <div className="px-5 py-3 bg-gray-50 flex justify-center items-center gap-6">
              <div className="flex items-center gap-1.5 opacity-40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black tracking-widest uppercase">Secure Site</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-40">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black tracking-widest uppercase">Fast Reveal</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
