export type AdminRole = 'super_admin' | 'editor' | 'coupon_manager' | 'content_manager';
export type AdminStatus = 'active' | 'inactive' | 'invited';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  updated_at: string;
}

export type SiteUserSource = 'merchant_page' | 'coupon_modal' | 'review_page' | 'homepage_signup' | 'coupons_page' | 'other';
export type SiteUserStatus = 'active' | 'unsubscribed';

export interface SiteUser {
  id: string;
  email: string;
  source: SiteUserSource | null;
  merchant_id: string | null;
  status: SiteUserStatus;
  created_at: string;
  updated_at: string;
}

export type MerchantStatus = 'active' | 'inactive' | 'draft' | 'hidden';

export interface Merchant {
  id: string;
  merchant_id_display: string | null;
  name: string;
  slug: string;
  homepage_link: string | null;
  description: string | null;
  short_description: string | null;
  tracking_link: string | null;
  affiliate_platform_name: string | null;
  category: string | null;
  logo_url: string | null;
  status: MerchantStatus;
  is_visible: boolean;
  is_featured: boolean;
  merchant_brief: string | null;
  about_merchant: string | null;
  store_info: string | null;
  faq_content: any | null;
  buying_guide_preview: string | null;
  savings_guide_preview: string | null;
  popular_searches: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface MerchantPrivateData {
  id: string;
  merchant_id: string;
  merchant_name: string;
  fmtc_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CouponType = 'code' | 'deal' | 'sale' | 'free_shipping';
export type CouponSourceType = 'manual' | 'affiliate' | 'crawler' | 'placeholder';
export type CouponStatus = 'active' | 'expired' | 'hidden' | 'draft';

export interface Coupon {
  id: string;
  coupon_id_display: string | null;
  merchant_id: string;
  title: string;
  short_description: string | null;
  coupon_code: string | null;
  deal_type: CouponType | null;
  tracking_link: string | null;
  deep_link_override: string | null;
  source_type: CouponSourceType | null;
  coupon_status: CouponStatus;
  is_exclusive: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_visible: boolean;
  expiration_date: string | null;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export type LegalPageStatus = 'draft' | 'published';

export interface LegalPage {
  id: string;
  slug: string;
  title: string;
  body_text: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: LegalPageStatus;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = 'draft' | 'published' | 'hidden';

export interface Article {
  id: string;
  article_id_display: string | null;
  merchant_id: string | null;
  title: string;
  subtitle: string | null;
  slug: string;
  author: string | null;
  cover_image_url: string | null;
  body_content: string | null;
  status: ArticleStatus;
  publish_date: string | null;
  created_at: string;
  updated_at: string;
}

export type EditorialPageType = 'top_10_deals' | 'best_stores' | 'comparison';
export type EditorialPageStatus = 'draft' | 'published' | 'hidden';

export interface EditorialPage {
  id: string;
  title: string;
  subtitle: string | null;
  page_type: EditorialPageType | null;
  intro_text: string | null;
  body_content: string | null;
  featured_merchants: string[] | null;
  featured_coupons: string[] | null;
  status: EditorialPageStatus;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'merchant_logo' | 'article_image' | 'editorial_image' | 'generic_asset';

export interface Asset {
  id: string;
  asset_name: string;
  asset_type: AssetType | null;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  file_url: string;
  file_size: string | null;
  upload_date: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export type AuditActionType = 'created' | 'edited' | 'published' | 'hidden' | 'deleted' | 'invited' | 'exported';

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  admin_email: string | null;
  action_type: AuditActionType | null;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  details: string | null;
  created_at: string;
}

export type ReplaceMode = 'first_occurrence' | 'all_occurrences';

export interface KeywordClickoutRule {
  id: string;
  article_id: string | null;
  keyword: string;
  tracking_link: string | null;
  replace_mode: ReplaceMode | null;
  created_at: string;
  updated_at: string;
}
