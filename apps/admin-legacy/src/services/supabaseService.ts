import { supabase } from '../lib/supabase';
import * as Types from '../types/database';

/**
 * Merchants
 */
export const getMerchants = async () => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as Types.Merchant[];
};

export const getMerchantBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error) throw error;
  return data as Types.Merchant | null;
};

export const getPublicMerchants = async () => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'active')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  // Filter by is_visible manually to handle nulls as true (safe fallback)
  return (data as Types.Merchant[]).filter(m => m.is_visible !== false);
};

export const getFeaturedMerchants = async (limit: number = 8) => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .limit(limit);
  
  if (error) throw error;
  
  let merchants = (data as Types.Merchant[]).filter(m => m.is_visible !== false);
  
  // Fallback if not enough featured merchants
  if (merchants.length < limit) {
    const { data: moreData, error: moreError } = await supabase
      .from('merchants')
      .select('*')
      .eq('status', 'active')
      .limit(limit);
    
    if (!moreError && moreData) {
      const moreMerchants = (moreData as Types.Merchant[]).filter(m => m.is_visible !== false);
      // Combine and remove duplicates
      const combined = [...merchants, ...moreMerchants];
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
      merchants = unique.slice(0, limit);
    }
  }
  
  return merchants;
};

export const createMerchant = async (merchant: Partial<Types.Merchant>) => {
  const { data, error } = await supabase
    .from('merchants')
    .insert([merchant])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Merchant;
};

export const updateMerchant = async (id: string, updates: Partial<Types.Merchant>) => {
  const { data, error } = await supabase
    .from('merchants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Merchant;
};

export const deleteMerchant = async (id: string) => {
  const { error } = await supabase
    .from('merchants')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Merchant Private Data (Admin Only)
 */
export const getMerchantPrivateData = async (merchantId: string) => {
  const { data, error } = await supabase
    .from('merchant_private_data')
    .select('*')
    .eq('merchant_id', merchantId)
    .maybeSingle();
  
  if (error) throw error;
  return data as Types.MerchantPrivateData | null;
};

export const upsertMerchantPrivateData = async (privateData: Partial<Types.MerchantPrivateData>) => {
  const { data, error } = await supabase
    .from('merchant_private_data')
    .upsert([privateData], { onConflict: 'merchant_id' })
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.MerchantPrivateData;
};

/**
 * Coupons
 */
export const getCoupons = async () => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*, merchants(name, logo_url)')
    .order('priority_score', { ascending: false });
  
  if (error) throw error;
  return data as any[];
};

export const getPublicCoupons = async () => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*, merchants(*)')
    .eq('coupon_status', 'active')
    .order('is_featured', { ascending: false })
    .order('priority_score', { ascending: false });
  
  if (error) throw error;
  
  // Filter by is_visible manually to handle nulls as true (safe fallback)
  // Also filter merchants visibility and status
  return (data as any[]).filter(c => 
    c.is_visible !== false && 
    c.merchants && 
    c.merchants.is_visible !== false && 
    c.merchants.status === 'active'
  );
};

export const getTrendingCoupons = async (limit: number = 12) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*, merchants(*)')
    .eq('coupon_status', 'active')
    .order('is_featured', { ascending: false })
    .order('priority_score', { ascending: false })
    .limit(limit * 2); // Fetch more to allow randomization
  
  if (error) throw error;
  
  let coupons = (data as any[]).filter(c => 
    c.is_visible !== false && 
    c.merchants && 
    c.merchants.is_visible !== false && 
    c.merchants.status === 'active'
  );

  // Group by priority and randomize within groups
  const groups: Record<string, any[]> = {};
  coupons.forEach(c => {
    const key = `${c.is_featured ? 'f' : 'n'}_${c.priority_score || 0}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });

  // Sort keys by priority (featured first, then priority_score)
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const [af, ap] = a.split('_');
    const [bf, bp] = b.split('_');
    if (af !== bf) return af === 'f' ? -1 : 1;
    return parseInt(bp) - parseInt(ap);
  });

  const randomized: any[] = [];
  sortedKeys.forEach(key => {
    const group = groups[key];
    // Shuffle group
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
    randomized.push(...group);
  });

  return randomized.slice(0, limit);
};

export const searchIntelligence = async (query: string) => {
  if (!query) return { merchants: [], coupons: [] };

  const [merchantsResult, couponsResult] = await Promise.all([
    supabase
      .from('merchants')
      .select('*')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .limit(5),
    supabase
      .from('coupons')
      .select('*, merchants(*)')
      .eq('coupon_status', 'active')
      .ilike('title', `%${query}%`)
      .limit(5)
  ]);

  const merchants = (merchantsResult.data || []).filter(m => m.is_visible !== false);
  const coupons = (couponsResult.data || []).filter(c => 
    c.is_visible !== false && 
    c.merchants && 
    c.merchants.is_visible !== false && 
    c.merchants.status === 'active'
  );

  return { merchants, coupons };
};

export const getPublicCouponsByMerchant = async (merchantId: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('merchant_id', merchantId)
    .eq('coupon_status', 'active')
    .order('priority_score', { ascending: false });
  
  if (error) throw error;
  
  // Filter by is_visible manually to handle nulls as true (safe fallback)
  return (data as Types.Coupon[]).filter(c => c.is_visible !== false);
};

export const createCoupon = async (coupon: Partial<Types.Coupon>) => {
  const { data, error } = await supabase
    .from('coupons')
    .insert([coupon])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Coupon;
};

export const updateCoupon = async (id: string, updates: Partial<Types.Coupon>) => {
  const { data, error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Coupon;
};

export const deleteCoupon = async (id: string) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Admin Users
 */
export const getAdminUsers = async () => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Types.AdminUser[];
};

export const createAdminUser = async (user: Partial<Types.AdminUser>) => {
  const { data, error } = await supabase
    .from('admin_users')
    .insert([user])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.AdminUser;
};

export const updateAdminUser = async (id: string, updates: Partial<Types.AdminUser>) => {
  const { data, error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.AdminUser;
};

export const deleteAdminUser = async (id: string) => {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getAdminUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) throw error;
  return data as Types.AdminUser | null;
};

/**
 * Site Users
 */
export const getSiteUsers = async () => {
  const { data, error } = await supabase
    .from('site_users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Types.SiteUser[];
};

export const subscribeToNewsletter = async (userData: { email: string, source: Types.SiteUserSource, merchant_id?: string }) => {
  const normalizedEmail = userData.email.trim().toLowerCase();
  const rpcArgs = {
    p_email: normalizedEmail,
    p_source: userData.source,
    p_merchant_id: userData.merchant_id || null,
    p_status: 'active'
  };
  
  try {
    // Dev-friendly logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Newsletter] Calling RPC subscribe_site_user with:', rpcArgs);
    }

    const { data, error } = await supabase.rpc('subscribe_site_user', rpcArgs);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[Newsletter] RPC Response Data:', data);
      console.log('[Newsletter] RPC Response Error:', error);
    }

    if (error) {
      console.error('RPC Error:', error);
      return { data: null, error: new Error('UNKNOWN_ERROR') };
    }

    // Handle both string response and object response (e.g. { code: '...' })
    const responseCode = typeof data === 'string' ? data : data?.code;

    if (responseCode === 'SUBSCRIBED') {
      return { data, error: null };
    } else if (responseCode === 'ALREADY_SUBSCRIBED') {
      return { data: null, error: new Error('ALREADY_SUBSCRIBED') };
    } else if (responseCode === 'INVALID_EMAIL') {
      return { data: null, error: new Error('INVALID_EMAIL') };
    } else {
      console.warn('[Newsletter] Unexpected RPC response code:', responseCode);
      return { data: null, error: new Error('UNKNOWN_ERROR') };
    }
  } catch (err) {
    console.error('Newsletter subscription exception:', err);
    return { data: null, error: new Error('UNKNOWN_ERROR') };
  }
};

/**
 * Legal Pages
 */
export const getLegalPages = async () => {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .order('title', { ascending: true });
  
  if (error) throw error;
  return data as Types.LegalPage[];
};

export const getLegalPageBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  return { data: data as Types.LegalPage, error };
};

export const getMerchantsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .ilike('category', `%${category}%`)
    .eq('status', 'active')
    .order('name');

  if (error) throw error;
  return data as Types.Merchant[];
};

export const getSimilarMerchants = async (category: string, currentMerchantId: string, limit: number = 10) => {
  if (!category) return [];

  const { data, error } = await supabase
    .from('merchants')
    .select('*')
    .ilike('category', `%${category}%`)
    .eq('status', 'active')
    .neq('id', currentMerchantId)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })
    .limit(limit);

  if (error) throw error;
  
  // Filter by is_visible manually to handle nulls as true
  return (data as Types.Merchant[]).filter(m => m.is_visible !== false);
};

export const getCouponsByCategory = async (category: string) => {
  // First get merchants in this category
  const merchants = await getMerchantsByCategory(category);
  if (merchants.length === 0) return [];

  const merchantIds = merchants.map(m => m.id);

  const { data, error } = await supabase
    .from('coupons')
    .select('*, merchants(*)')
    .in('merchant_id', merchantIds)
    .eq('coupon_status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any[];
};

export const upsertLegalPage = async (page: Partial<Types.LegalPage>) => {
  const { data, error } = await supabase
    .from('legal_pages')
    .upsert([page], { onConflict: 'slug' })
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.LegalPage;
};

/**
 * Articles
 */
export const getArticles = async () => {
  const { data, error } = await supabase
    .from('articles')
    .select('*, merchants(name)')
    .order('publish_date', { ascending: false });
  
  if (error) throw error;
  return data as any[];
};

export const createArticle = async (article: Partial<Types.Article>) => {
  const { data, error } = await supabase
    .from('articles')
    .insert([article])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Article;
};

export const updateArticle = async (id: string, updates: Partial<Types.Article>) => {
  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Article;
};

export const deleteArticle = async (id: string) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Editorial Pages
 */
export const getEditorialPages = async () => {
  const { data, error } = await supabase
    .from('editorial_pages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Types.EditorialPage[];
};

export const createEditorialPage = async (page: Partial<Types.EditorialPage>) => {
  const { data, error } = await supabase
    .from('editorial_pages')
    .insert([page])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.EditorialPage;
};

export const updateEditorialPage = async (id: string, updates: Partial<Types.EditorialPage>) => {
  const { data, error } = await supabase
    .from('editorial_pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.EditorialPage;
};

export const deleteEditorialPage = async (id: string) => {
  const { error } = await supabase
    .from('editorial_pages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Assets & Storage
 */
export const getAssets = async () => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('upload_date', { ascending: false });
  
  if (error) throw error;
  return data as Types.Asset[];
};

export const createAsset = async (asset: Partial<Types.Asset>) => {
  const { data, error } = await supabase
    .from('assets')
    .insert([asset])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.Asset;
};

export const deleteAsset = async (id: string) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  return data;
};

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) throw error;
};

export const deleteFileByUrl = async (url: string) => {
  try {
    // Extract bucket and path from URL
    // Format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const bucketIndex = parts.indexOf('public') + 1;
    if (bucketIndex > 0 && bucketIndex < parts.length) {
      const bucket = parts[bucketIndex];
      const path = parts.slice(bucketIndex + 1).join('/');
      await deleteFile(bucket, path);
    }
  } catch (err) {
    console.error('Error deleting file by URL:', err);
  }
};

export const listBuckets = async () => {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  return data;
};

export const createBucket = async (name: string) => {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  });
  if (error) throw error;
  return data;
};

/**
 * Audit Logs
 */
export const getAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Types.AuditLog[];
};

export const createAuditLog = async (log: Partial<Types.AuditLog>) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert([log])
    .select()
    .single();
  
  if (error) throw error;
  return data as Types.AuditLog;
};

export const bulkUpdateMerchantsAbout = async (updates: { id: string, about_merchant: string }[]) => {
  // Supabase doesn't support batch updates with different values in one call easily via the standard JS client
  // without using an RPC or multiple calls.
  // Given the potential size of 'about_merchant' (HTML), we'll do them in small batches or sequentially.
  // For simplicity and reliability with large HTML content, we'll do them sequentially but with Promise.all for small concurrency.
  
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process in chunks of 5 to avoid overwhelming the connection but still be faster than 1-by-1
  const chunkSize = 5;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const promises = chunk.map(update => 
      supabase
        .from('merchants')
        .update({ about_merchant: update.about_merchant })
        .eq('id', update.id)
    );

    const chunkResults = await Promise.all(promises);
    
    chunkResults.forEach((res, idx) => {
      if (res.error) {
        results.failed++;
        results.errors.push(`ID ${chunk[idx].id}: ${res.error.message}`);
      } else {
        results.success++;
      }
    });
  }

  return results;
};
