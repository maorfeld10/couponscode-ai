export interface Tag {
  text: string;
  color: string;
}

export interface Coupon {
  id: string | number;
  merchant_id: string | number;
  title: string;
  description: string;
  code?: string;
  type: 'code' | 'deal' | 'sale' | 'free shipping';
  discount: string;
  status: 'active' | 'expired' | 'hidden' | 'draft';
  tags: Tag[];
  exclusive?: boolean;
  verified?: boolean;
  featured?: boolean;
  expiration_date?: string;
  priority?: number;
  tracking_link?: string;
  source_type?: 'manual' | 'affiliate' | 'crawler' | 'placeholder';
  updated_at?: string;
}

export interface Merchant {
  id: string | number;
  name: string;
  slug: string;
  logo: string;
  description: string;
  short_description?: string;
  homepage_url?: string;
  tracking_link?: string;
  affiliate_platform?: string;
  savings_tips: { text: string; bold: string }[];
  category: string;
  status: 'active' | 'inactive';
  is_hidden?: boolean;
  is_featured?: boolean;
  merchant_brief?: string;
  about_merchant?: string;
  store_info?: string;
  faq?: { question: string; answer: string }[];
  buying_guide_preview?: string;
  savings_guide_preview?: string;
  popular_searches?: string[];
  updated_at?: string;
}

export const MERCHANTS: Merchant[] = [
  {
    id: 1,
    name: "Nike",
    slug: "nike-coupons",
    logo: "https://picsum.photos/seed/nike/200/200",
    description: "Save on footwear, apparel, and more with our latest deals. Curated by AI, verified by humans.",
    category: "Fashion",
    status: "active",
    savings_tips: [
      { text: "Join the Nike Membership for free shipping and early access to drops.", bold: "Nike Membership" },
      { text: "Check the Sale section on Tuesday mornings when new items are often added.", bold: "Sale section" },
      { text: "Students and first responders can unlock a consistent 10% discount through SheerID.", bold: "10% discount" },
    ]
  },
  {
    id: 2,
    name: "Amazon",
    slug: "amazon-coupons",
    logo: "https://picsum.photos/seed/amazon/200/200",
    description: "Find the best deals on electronics, home goods, books, and more at the world's largest online retailer.",
    category: "Electronics",
    status: "active",
    savings_tips: [
      { text: "Check the 'Today's Deals' section for limited-time lightning deals.", bold: "Today's Deals" },
      { text: "Use Amazon Warehouse for deep discounts on open-box and pre-owned items.", bold: "Amazon Warehouse" },
      { text: "Subscribe & Save can save you up to 15% on recurring household essentials.", bold: "Subscribe & Save" },
    ]
  },
  {
    id: 3,
    name: "Best Buy",
    slug: "best-buy-coupons",
    logo: "https://picsum.photos/seed/bestbuy/200/200",
    description: "Your destination for the latest technology, appliances, and expert advice.",
    category: "Electronics",
    status: "active",
    savings_tips: [
      { text: "Join My Best Buy for exclusive member-only pricing and free shipping.", bold: "My Best Buy" },
      { text: "Check the 'Deal of the Day' for significant savings on popular tech.", bold: "Deal of the Day" },
      { text: "Open-box items offer like-new quality at a fraction of the original price.", bold: "Open-box" },
    ]
  },
  {
    id: 4,
    name: "Sephora",
    slug: "sephora-coupons",
    logo: "https://picsum.photos/seed/sephora/200/200",
    description: "Discover the best in makeup, skincare, fragrance, and more from top beauty brands.",
    category: "Beauty",
    status: "active",
    savings_tips: [
      { text: "Beauty Insider members earn points on every purchase for free rewards.", bold: "Beauty Insider" },
      { text: "Check the 'Sale' section for up to 50% off top beauty brands.", bold: "Sale" },
      { text: "Choose two free samples with every online order.", bold: "free samples" },
    ]
  },
  {
    id: 5,
    name: "Lowe’s",
    slug: "lowes-coupons",
    logo: "https://picsum.photos/seed/lowes/200/200",
    description: "Everything you need for your home improvement projects, from tools to appliances.",
    category: "Home",
    status: "active",
    savings_tips: [
      { text: "Check the 'Savings' tab for current promotions and clearance items.", bold: "Savings" },
      { text: "Military members get a 10% discount on most full-priced items.", bold: "10% discount" },
      { text: "Sign up for Lowe's emails to receive exclusive offers and project ideas.", bold: "exclusive offers" },
    ]
  },
  {
    id: 6,
    name: "Kohl’s",
    slug: "kohls-coupons",
    logo: "https://picsum.photos/seed/kohls/200/200",
    description: "Shop for clothing, home decor, and more while earning Kohl's Cash on every purchase.",
    category: "Fashion",
    status: "active",
    savings_tips: [
      { text: "Earn $10 in Kohl's Cash for every $50 spent during promotional periods.", bold: "Kohl's Cash" },
      { text: "Sign up for Kohl's Rewards to earn 5% back on every purchase.", bold: "Kohl's Rewards" },
      { text: "Stack up to four coupons on a single order for maximum savings.", bold: "Stack" },
    ]
  },
  {
    id: 7,
    name: "Adidas",
    slug: "adidas-coupons",
    logo: "https://picsum.photos/seed/adidas/200/200",
    description: "Premium sportswear and footwear for athletes and creators.",
    category: "Fashion",
    status: "active",
    savings_tips: []
  },
  {
    id: 8,
    name: "Apple",
    slug: "apple-coupons",
    logo: "https://picsum.photos/seed/apple/200/200",
    description: "Innovative technology, from iPhone to Mac.",
    category: "Electronics",
    status: "active",
    savings_tips: []
  },
  {
    id: 9,
    name: "Banana Republic",
    slug: "banana-republic-coupons",
    logo: "https://picsum.photos/seed/banana/200/200",
    description: "Modern, refined clothing and accessories.",
    category: "Fashion",
    status: "active",
    savings_tips: []
  },
  {
    id: 10,
    name: "Costco",
    slug: "costco-coupons",
    logo: "https://picsum.photos/seed/costco/200/200",
    description: "Wholesale savings on everything you need.",
    category: "Home",
    status: "active",
    savings_tips: []
  },
  {
    id: 11,
    name: "Dell",
    slug: "dell-coupons",
    logo: "https://picsum.photos/seed/dell/200/200",
    description: "Computers, monitors, and technology solutions.",
    category: "Electronics",
    status: "active",
    savings_tips: []
  },
  {
    id: 12,
    name: "eBay",
    slug: "ebay-coupons",
    logo: "https://picsum.photos/seed/ebay/200/200",
    description: "The world's online marketplace.",
    category: "Electronics",
    status: "active",
    savings_tips: []
  },
  {
    id: 13,
    name: "Gap",
    slug: "gap-coupons",
    logo: "https://picsum.photos/seed/gap/200/200",
    description: "Casual clothing for the whole family.",
    category: "Fashion",
    status: "active",
    savings_tips: []
  },
  {
    id: 14,
    name: "Home Depot",
    slug: "home-depot-coupons",
    logo: "https://picsum.photos/seed/homedepot/200/200",
    description: "Home improvement, tools, and hardware.",
    category: "Home",
    status: "active",
    savings_tips: []
  },
  {
    id: 15,
    name: "IKEA",
    slug: "ikea-coupons",
    logo: "https://picsum.photos/seed/ikea/200/200",
    description: "Affordable furniture and home decor.",
    category: "Home",
    status: "active",
    savings_tips: []
  },
  {
    id: 16,
    name: "Macy's",
    slug: "macys-coupons",
    logo: "https://picsum.photos/seed/macys/200/200",
    description: "Department store for fashion, home, and beauty.",
    category: "Fashion",
    status: "active",
    savings_tips: []
  },
  {
    id: 17,
    name: "Nordstrom",
    slug: "nordstrom-coupons",
    logo: "https://picsum.photos/seed/nordstrom/200/200",
    description: "Luxury fashion and beauty retailer.",
    category: "Fashion",
    status: "active",
    savings_tips: []
  },
  {
    id: 18,
    name: "Target",
    slug: "target-coupons",
    logo: "https://picsum.photos/seed/target/200/200",
    description: "Expect more. Pay less.",
    category: "Home",
    status: "active",
    savings_tips: []
  },
  {
    id: 19,
    name: "Walmart",
    slug: "walmart-coupons",
    logo: "https://picsum.photos/seed/walmart/200/200",
    description: "Save money. Live better.",
    category: "Home",
    status: "active",
    savings_tips: []
  }
];

export const COUPONS: Coupon[] = [
  // Nike Coupons
  { id: 1, merchant_id: 1, discount: "25% OFF", title: "Extra 25% Off Select Styles", description: "Shop the latest Nike footwear and apparel. Exclusions apply. Limited time only.", type: "code", code: "SAVE25", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }, { text: "Trending", color: "bg-sky-50 text-sky-600" }] },
  { id: 2, merchant_id: 1, discount: "10% OFF", title: "Student Discount: 10% Off", description: "Verify your student status with SheerID to receive a unique promo code.", type: "code", code: "STUDENT10", status: "active", tags: [{ text: "Expiring Soon", color: "bg-red-50 text-red-600" }] },
  { id: 3, merchant_id: 1, discount: "FREE SHIP", title: "Free Shipping for Nike Members", description: "Sign in or join Nike Membership for free to get free shipping on all orders.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },
  { id: 4, merchant_id: 1, discount: "40% OFF", title: "Up to 40% Off Clearance", description: "No code needed. Huge savings on end-of-season footwear and training gear.", type: "deal", status: "active", tags: [{ text: "Top Choice", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 5, merchant_id: 1, discount: "20% OFF", title: "20% Off Your First Order", description: "New members get 20% off their first purchase of $100 or more.", type: "code", code: "WELCOME20", status: "active", tags: [{ text: "New", color: "bg-blue-50 text-blue-600" }] },
  { id: 6, merchant_id: 1, discount: "$20 OFF", title: "$20 Off Orders Over $120", description: "Limited time offer on select full-priced items.", type: "code", code: "NIKE20", status: "active", tags: [{ text: "Verified", color: "bg-emerald-50 text-emerald-600" }] },
  
  // Amazon Coupons
  { id: 7, merchant_id: 2, discount: "$15 OFF", title: "$15 Off Grocery Orders Over $50", description: "Limited time offer for Amazon Fresh members.", type: "code", code: "FRESH15", status: "active", tags: [{ text: "Exclusive", color: "bg-sky-50 text-sky-600" }] },
  { id: 8, merchant_id: 2, discount: "20% OFF", title: "20% Off Amazon Basics", description: "Save on household essentials, electronics, and more.", type: "deal", status: "active", tags: [{ text: "Trending", color: "bg-sky-50 text-sky-600" }] },
  { id: 9, merchant_id: 2, discount: "50% OFF", title: "Up to 50% Off Kindle E-books", description: "Daily deals on best-selling titles across all genres.", type: "deal", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 10, merchant_id: 2, discount: "$10 OFF", title: "$10 Off Your First App Purchase", description: "Download the Amazon app and save on your first order.", type: "code", code: "APP10", status: "active", tags: [{ text: "New User", color: "bg-blue-50 text-blue-600" }] },
  { id: 11, merchant_id: 2, discount: "15% OFF", title: "15% Off Subscribe & Save", description: "Save on recurring deliveries of your favorite products.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },

  // Best Buy Coupons
  { id: 12, merchant_id: 3, discount: "$100 OFF", title: "$100 Off Select MacBook Pro Models", description: "Limited time savings on the latest Apple laptops.", type: "deal", status: "active", tags: [{ text: "Top Choice", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 13, merchant_id: 3, discount: "20% OFF", title: "20% Off Small Kitchen Appliances", description: "Save on blenders, coffee makers, and more.", type: "code", code: "KITCHEN20", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 14, merchant_id: 3, discount: "FREE SHIP", title: "Free Shipping on Orders $35+", description: "Get free standard shipping on thousands of items.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },
  { id: 15, merchant_id: 3, discount: "10% OFF", title: "10% Off for My Best Buy Plus Members", description: "Exclusive member-only savings on select tech.", type: "deal", status: "active", tags: [{ text: "Exclusive", color: "bg-sky-50 text-sky-600" }] },
  { id: 16, merchant_id: 3, discount: "50% OFF", title: "Up to 50% Off Clearance Items", description: "Huge savings on end-of-life electronics and appliances.", type: "deal", status: "active", tags: [{ text: "Trending", color: "bg-sky-50 text-sky-600" }] },

  // Sephora Coupons
  { id: 17, merchant_id: 4, discount: "20% OFF", title: "20% Off Your Entire Purchase", description: "Seasonal savings event for Beauty Insider members.", type: "code", code: "SAVINGS", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 18, merchant_id: 4, discount: "FREE GIFT", title: "Free Trial-Size Gift with $25 Purchase", description: "Choose from select luxury beauty samples.", type: "code", code: "LUXURY", status: "active", tags: [{ text: "Trending", color: "bg-sky-50 text-sky-600" }] },
  { id: 19, merchant_id: 4, discount: "10% OFF", title: "10% Off Your First Order", description: "Sign up for Sephora emails and save on your first purchase.", type: "code", code: "WELCOME10", status: "active", tags: [{ text: "New User", color: "bg-blue-50 text-blue-600" }] },
  { id: 20, merchant_id: 4, discount: "50% OFF", title: "Up to 50% Off Sale Items", description: "Save on top-rated makeup, skincare, and hair care.", type: "deal", status: "active", tags: [{ text: "Top Choice", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 21, merchant_id: 4, discount: "FREE SHIP", title: "Free Shipping on All Orders", description: "No minimum spend required for Beauty Insider members.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },

  // Lowe's Coupons
  { id: 22, merchant_id: 5, discount: "$20 OFF", title: "$20 Off Your Next Purchase of $100+", description: "Exclusive offer for new email subscribers.", type: "code", code: "LOWES20", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 23, merchant_id: 5, discount: "10% OFF", title: "10% Military Discount", description: "Active duty, veterans, and their families save every day.", type: "deal", status: "active", tags: [{ text: "Exclusive", color: "bg-sky-50 text-sky-600" }] },
  { id: 24, merchant_id: 5, discount: "30% OFF", title: "Up to 30% Off Major Appliances", description: "Save on refrigerators, washers, dryers, and more.", type: "deal", status: "active", tags: [{ text: "Trending", color: "bg-sky-50 text-sky-600" }] },
  { id: 25, merchant_id: 5, discount: "FREE SHIP", title: "Free Shipping on Orders $45+", description: "Get free standard shipping on most home improvement items.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },
  { id: 26, merchant_id: 5, discount: "50% OFF", title: "Up to 50% Off Clearance Tools", description: "Limited time savings on top tool brands.", type: "deal", status: "active", tags: [{ text: "Expiring Soon", color: "bg-red-50 text-red-600" }] },

  // Kohl's Coupons
  { id: 27, merchant_id: 6, discount: "15% OFF", title: "15% Off Your Entire Purchase", description: "Use this code at checkout for sitewide savings.", type: "code", code: "ENJOY15", status: "active", tags: [{ text: "Verified Today", color: "bg-emerald-50 text-emerald-600" }] },
  { id: 28, merchant_id: 6, discount: "$10 OFF", title: "$10 Off Orders of $50+", description: "Limited time offer on select home and apparel items.", type: "code", code: "SAVE10", status: "active", tags: [{ text: "Trending", color: "bg-sky-50 text-sky-600" }] },
  { id: 29, merchant_id: 6, discount: "30% OFF", title: "30% Off for Kohl's Cardholders", description: "Exclusive savings for Kohl's charge card members.", type: "code", code: "CHARGE30", status: "active", tags: [{ text: "Exclusive", color: "bg-sky-50 text-sky-600" }] },
  { id: 30, merchant_id: 6, discount: "FREE SHIP", title: "Free Shipping on Orders $49+", description: "Get free standard shipping on your Kohl's order.", type: "deal", status: "active", tags: [{ text: "Storewide", color: "bg-gray-100 text-gray-600" }] },
  { id: 31, merchant_id: 6, discount: "70% OFF", title: "Up to 70% Off Clearance", description: "Huge savings on clothing, home, and more.", type: "deal", status: "active", tags: [{ text: "Top Choice", color: "bg-emerald-50 text-emerald-600" }] },
];

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'coupon_manager' | 'content_manager';
  status: 'active' | 'inactive' | 'invited';
  created_at: string;
}

export interface SiteUser {
  id: number;
  email: string;
  source: 'Merchant Page' | 'Coupon Modal' | 'Review Page' | 'Homepage Signup';
  merchant_id?: number;
  status: 'subscribed' | 'unsubscribed';
  created_at?: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 1, email: 'yogev@intango.com', full_name: 'Yogev Admin', role: 'super_admin', status: 'active', created_at: '2024-01-01T10:00:00Z' },
  { id: 2, email: 'editor@topcoupons.ai', full_name: 'Jane Editor', role: 'editor', status: 'active', created_at: '2024-02-15T14:30:00Z' },
  { id: 3, email: 'manager@topcoupons.ai', full_name: 'Bob Manager', role: 'coupon_manager', status: 'invited', created_at: '2024-03-20T09:15:00Z' },
];

export const SITE_USERS: SiteUser[] = [
  { id: 1, email: 'user1@gmail.com', source: 'Merchant Page', merchant_id: 1, status: 'subscribed', created_at: '2024-03-25T11:20:00Z' },
  { id: 2, email: 'user2@yahoo.com', source: 'Coupon Modal', merchant_id: 2, status: 'subscribed', created_at: '2024-03-26T15:45:00Z' },
  { id: 3, email: 'user3@outlook.com', source: 'Homepage Signup', status: 'unsubscribed', created_at: '2024-03-27T08:10:00Z' },
  { id: 4, email: 'user4@gmail.com', source: 'Review Page', status: 'subscribed', created_at: '2024-03-28T19:30:00Z' },
];

export interface LegalPage {
  id: string;
  title: string;
  body: string;
  last_updated: string;
  status: 'draft' | 'published';
}

export const LEGAL_PAGES: LegalPage[] = [
  { id: 'contact', title: 'Contact Us', body: 'Contact information and form details...', last_updated: '2024-03-01T10:00:00Z', status: 'published' },
  { id: 'privacy', title: 'Privacy Policy', body: 'Our privacy policy details...', last_updated: '2024-03-15T12:00:00Z', status: 'published' },
  { id: 'terms', title: 'Terms & Conditions', body: 'Our terms and conditions...', last_updated: '2024-03-20T15:00:00Z', status: 'draft' },
];

export interface Article {
  id: string | number;
  merchant_id: string | number;
  title: string;
  subtitle: string;
  slug: string;
  author: string;
  cover_image: string;
  body: string;
  status: 'draft' | 'published' | 'hidden';
  publish_date: string;
  updated_at?: string;
}

export const ARTICLES: Article[] = [
  { id: 1, merchant_id: 1, title: 'How to Save at Nike', subtitle: 'A comprehensive guide to Nike discounts', slug: 'how-to-save-at-nike', author: 'Admin', cover_image: 'https://picsum.photos/seed/nike-article/800/400', body: 'Article content here...', status: 'published', publish_date: '2024-03-25T10:00:00Z' },
  { id: 2, merchant_id: 2, title: 'Amazon Prime Day Tips', subtitle: 'Maximize your savings this Prime Day', slug: 'amazon-prime-day-tips', author: 'Editor', cover_image: 'https://picsum.photos/seed/amazon-article/800/400', body: 'Article content here...', status: 'draft', publish_date: '2024-07-10T10:00:00Z' },
];

export interface EditorialPage {
  id: string | number;
  type: 'top_10' | 'best_stores' | 'comparison';
  title: string;
  subtitle: string;
  intro_text: string;
  body: string;
  featured_merchants: (string | number)[];
  featured_coupons: (string | number)[];
  status: 'draft' | 'published';
  updated_at?: string;
}

export const EDITORIAL_PAGES: EditorialPage[] = [
  { id: 1, type: 'top_10', title: 'Top 10 Fashion Deals', subtitle: 'The best clothing discounts this month', intro_text: 'Check out our top picks...', body: 'Detailed content...', featured_merchants: [1, 6, 7], featured_coupons: [1, 27], status: 'published' },
];

export interface AuditLogEntry {
  id: number;
  user_email: string;
  action: 'created' | 'edited' | 'published' | 'hidden' | 'deleted';
  entity_type: 'merchant' | 'coupon' | 'legal' | 'article' | 'editorial' | 'admin_user';
  entity_name: string;
  timestamp: string;
  details?: string;
}

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: 1, user_email: 'yogev@intango.com', action: 'published', entity_type: 'article', entity_name: 'How to Save at Nike', timestamp: '2024-03-25T10:00:00Z' },
  { id: 2, user_email: 'jane@topcoupons.ai', action: 'edited', entity_type: 'coupon', entity_name: 'Extra 25% Off Select Styles', timestamp: '2024-03-26T11:30:00Z' },
  { id: 3, user_email: 'yogev@intango.com', action: 'created', entity_type: 'merchant', entity_name: 'New Store', timestamp: '2024-03-27T09:00:00Z' },
];

export interface MediaAsset {
  id: number;
  name: string;
  url: string;
  type: 'merchant_logo' | 'article_image' | 'editorial_image' | 'generic_asset';
  mime_type: string;
  size: string;
  linked_entity_type?: 'merchant' | 'article' | 'editorial';
  linked_entity_name?: string;
  upload_date: string;
  usage_count: number;
}

export const MEDIA_ASSETS: MediaAsset[] = [
  { id: 1, name: 'nike-logo.png', url: 'https://picsum.photos/seed/nike/200/200', type: 'merchant_logo', mime_type: 'image/png', size: '12 KB', linked_entity_type: 'merchant', linked_entity_name: 'Nike', upload_date: '2024-01-10T10:00:00Z', usage_count: 5 },
  { id: 2, name: 'amazon-logo.png', url: 'https://picsum.photos/seed/amazon/200/200', type: 'merchant_logo', mime_type: 'image/png', size: '15 KB', linked_entity_type: 'merchant', linked_entity_name: 'Amazon', upload_date: '2024-01-12T11:30:00Z', usage_count: 3 },
  { id: 3, name: 'nike-savings-guide.jpg', url: 'https://picsum.photos/seed/nike-article/800/400', type: 'article_image', mime_type: 'image/jpeg', size: '145 KB', linked_entity_type: 'article', linked_entity_name: 'How to Save at Nike', upload_date: '2024-03-20T09:15:00Z', usage_count: 1 },
  { id: 4, name: 'fashion-roundup.jpg', url: 'https://picsum.photos/seed/top10/800/400', type: 'editorial_image', mime_type: 'image/jpeg', size: '210 KB', linked_entity_type: 'editorial', linked_entity_name: 'Top 10 Fashion Deals', upload_date: '2024-03-22T14:45:00Z', usage_count: 2 },
  { id: 5, name: 'generic-banner.png', url: 'https://picsum.photos/seed/banner/1200/300', type: 'generic_asset', mime_type: 'image/png', size: '85 KB', upload_date: '2024-03-25T16:20:00Z', usage_count: 0 },
];
