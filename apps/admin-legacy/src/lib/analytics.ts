// Analytics utility for TopCoupons.ai
// Centralizes GA4 and internal event tracking

import { supabase } from './supabase';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = 'G-403CVLGNPQ';

/**
 * Track a page view event
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window.gtag !== 'function') return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] Page View: ${path} (${title || 'No Title'})`);
  }

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    send_to: MEASUREMENT_ID
  });
};

/**
 * Track a coupon click event to GA4 and Supabase
 */
export const trackCouponClick = async (params: {
  merchant_id?: string | null;
  merchant_name: string;
  coupon_id?: string | null;
  coupon_title: string;
  coupon_code?: string | null;
  deal_type: string | null;
  page_type: 'homepage' | 'coupons' | 'merchant' | 'modal' | 'category';
  click_type?: 'show_code' | 'get_deal' | 'continue_to_store';
  tracking_link?: string | null;
}) => {
  // 1. Track to GA4
  if (typeof window.gtag === 'function') {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Coupon Click (GA4):', params);
    }

    window.gtag('event', 'coupon_click', {
      ...params,
      send_to: MEASUREMENT_ID
    });
  }

  // 2. Track to Supabase (Internal)
  try {
    // Determine click_type if not provided
    const clickType = params.click_type || (params.deal_type === 'code' ? 'show_code' : 'get_deal');

    const { error } = await supabase
      .from('click_events')
      .insert([
        {
          merchant_id: params.merchant_id,
          merchant_name: params.merchant_name,
          coupon_id: params.coupon_id,
          coupon_title: params.coupon_title,
          coupon_code: params.coupon_code,
          deal_type: params.deal_type,
          page_type: params.page_type,
          click_type: clickType,
          tracking_link: params.tracking_link,
          page_path: window.location.pathname + window.location.search,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        },
      ]);

    if (error && process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Supabase Insert Error:', error);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Unexpected Error during Supabase tracking:', err);
    }
  }
};

/**
 * Track a search event
 */
export const trackSearch = (params: {
  search_term: string;
  results_count?: number;
  page_type: string;
}) => {
  if (typeof window.gtag !== 'function') return;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Search:', params);
  }

  window.gtag('event', 'search', {
    ...params,
    send_to: MEASUREMENT_ID
  });
};
