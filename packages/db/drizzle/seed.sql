-- Seed data for couponscode.ai (extracted from legacy mockData.ts)
-- 19 merchants + 31 coupons + 5 categories + 3 legal pages
-- Idempotent: uses ON CONFLICT DO NOTHING throughout. Safe to re-run.
-- Logos sourced from Clearbit (free brand logo API) — replace with uploaded assets later.
--
-- Run AFTER all migrations 0000 through 0006 have been applied.

BEGIN;

-- ============================================================================
-- CATEGORIES
-- ============================================================================
INSERT INTO categories (slug, name, description, sort_order) VALUES
  ('fashion', 'Fashion', 'Clothing, footwear, and accessories.', 10),
  ('electronics', 'Electronics', 'Laptops, phones, appliances, and tech.', 20),
  ('beauty', 'Beauty', 'Makeup, skincare, fragrance, and personal care.', 30),
  ('home', 'Home', 'Home improvement, furniture, and household goods.', 40),
  ('marketplace', 'Marketplace', 'General marketplaces and department stores.', 50)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- MERCHANTS (19 total)
-- ============================================================================
INSERT INTO merchants (
  merchant_id_display, name, slug, description, short_description,
  homepage_link, tracking_link, affiliate_platform_name, category, logo_url,
  status, is_visible, is_featured,
  about_merchant, faq_content
) VALUES
  ('seed-001', 'Nike', 'nike-coupons',
    'Save on footwear, apparel, and more with our latest deals. Curated by AI, verified by humans.',
    'Footwear, apparel, and sporting goods.',
    'https://www.nike.com', 'https://www.nike.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/nike.com',
    'active', TRUE, TRUE,
    '<p>Nike is the world''s largest athletic apparel and footwear brand. From running and training to basketball and lifestyle, Nike delivers innovation for every athlete.</p>',
    '[{"text":"Join the Nike Membership for free shipping and early access to drops.","bold":"Nike Membership"},{"text":"Check the Sale section on Tuesday mornings when new items are often added.","bold":"Sale section"},{"text":"Students and first responders can unlock a consistent 10% discount through SheerID.","bold":"10% discount"}]'::jsonb),

  ('seed-002', 'Amazon', 'amazon-coupons',
    'Find the best deals on electronics, home goods, books, and more at the world''s largest online retailer.',
    'The world''s largest online retailer.',
    'https://www.amazon.com', 'https://www.amazon.com', 'placeholder', 'Electronics',
    'https://logo.clearbit.com/amazon.com',
    'active', TRUE, TRUE,
    '<p>Amazon is the world''s largest online marketplace, offering millions of products across every category, from electronics and home goods to books and groceries.</p>',
    '[{"text":"Check the ''Today''s Deals'' section for limited-time lightning deals.","bold":"Today''s Deals"},{"text":"Use Amazon Warehouse for deep discounts on open-box and pre-owned items.","bold":"Amazon Warehouse"},{"text":"Subscribe & Save can save you up to 15% on recurring household essentials.","bold":"Subscribe & Save"}]'::jsonb),

  ('seed-003', 'Best Buy', 'best-buy-coupons',
    'Your destination for the latest technology, appliances, and expert advice.',
    'Electronics, appliances, and expert tech advice.',
    'https://www.bestbuy.com', 'https://www.bestbuy.com', 'placeholder', 'Electronics',
    'https://logo.clearbit.com/bestbuy.com',
    'active', TRUE, TRUE,
    '<p>Best Buy is a leading consumer electronics retailer offering the latest laptops, phones, TVs, appliances, and expert Geek Squad support.</p>',
    '[{"text":"Join My Best Buy for exclusive member-only pricing and free shipping.","bold":"My Best Buy"},{"text":"Check the ''Deal of the Day'' for significant savings on popular tech.","bold":"Deal of the Day"},{"text":"Open-box items offer like-new quality at a fraction of the original price.","bold":"Open-box"}]'::jsonb),

  ('seed-004', 'Sephora', 'sephora-coupons',
    'Discover the best in makeup, skincare, fragrance, and more from top beauty brands.',
    'Makeup, skincare, and fragrance from top brands.',
    'https://www.sephora.com', 'https://www.sephora.com', 'placeholder', 'Beauty',
    'https://logo.clearbit.com/sephora.com',
    'active', TRUE, TRUE,
    '<p>Sephora is a global beauty retailer offering the most sought-after makeup, skincare, fragrance, and haircare brands.</p>',
    '[{"text":"Beauty Insider members earn points on every purchase for free rewards.","bold":"Beauty Insider"},{"text":"Check the ''Sale'' section for up to 50% off top beauty brands.","bold":"Sale"},{"text":"Choose two free samples with every online order.","bold":"free samples"}]'::jsonb),

  ('seed-005', 'Lowe''s', 'lowes-coupons',
    'Everything you need for your home improvement projects, from tools to appliances.',
    'Home improvement, tools, and appliances.',
    'https://www.lowes.com', 'https://www.lowes.com', 'placeholder', 'Home',
    'https://logo.clearbit.com/lowes.com',
    'active', TRUE, TRUE,
    '<p>Lowe''s is a leading home improvement retailer offering tools, appliances, building materials, and expert advice for every DIY project.</p>',
    '[{"text":"Check the ''Savings'' tab for current promotions and clearance items.","bold":"Savings"},{"text":"Military members get a 10% discount on most full-priced items.","bold":"10% discount"},{"text":"Sign up for Lowe''s emails to receive exclusive offers and project ideas.","bold":"exclusive offers"}]'::jsonb),

  ('seed-006', 'Kohl''s', 'kohls-coupons',
    'Shop for clothing, home decor, and more while earning Kohl''s Cash on every purchase.',
    'Clothing, home decor, and Kohl''s Cash rewards.',
    'https://www.kohls.com', 'https://www.kohls.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/kohls.com',
    'active', TRUE, TRUE,
    '<p>Kohl''s is a department store chain offering clothing, home goods, beauty, and exclusive Kohl''s Cash rewards on every purchase.</p>',
    '[{"text":"Earn $10 in Kohl''s Cash for every $50 spent during promotional periods.","bold":"Kohl''s Cash"},{"text":"Sign up for Kohl''s Rewards to earn 5% back on every purchase.","bold":"Kohl''s Rewards"},{"text":"Stack up to four coupons on a single order for maximum savings.","bold":"Stack"}]'::jsonb),

  ('seed-007', 'Adidas', 'adidas-coupons',
    'Premium sportswear and footwear for athletes and creators.',
    'Premium sportswear and footwear.',
    'https://www.adidas.com', 'https://www.adidas.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/adidas.com',
    'active', TRUE, FALSE,
    '<p>Adidas is a global sportswear leader offering performance footwear, apparel, and accessories for athletes and lifestyle enthusiasts.</p>',
    NULL),

  ('seed-008', 'Apple', 'apple-coupons',
    'Innovative technology, from iPhone to Mac.',
    'iPhones, Macs, iPads, and accessories.',
    'https://www.apple.com', 'https://www.apple.com', 'placeholder', 'Electronics',
    'https://logo.clearbit.com/apple.com',
    'active', TRUE, FALSE,
    '<p>Apple designs and sells the iPhone, iPad, Mac, Apple Watch, and a wide ecosystem of software and services.</p>',
    NULL),

  ('seed-009', 'Banana Republic', 'banana-republic-coupons',
    'Modern, refined clothing and accessories.',
    'Modern, refined apparel and accessories.',
    'https://bananarepublic.gap.com', 'https://bananarepublic.gap.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/bananarepublic.com',
    'active', TRUE, FALSE,
    '<p>Banana Republic offers modern, refined clothing and accessories for work, weekend, and everything in between.</p>',
    NULL),

  ('seed-010', 'Costco', 'costco-coupons',
    'Wholesale savings on everything you need.',
    'Wholesale club with savings on everything.',
    'https://www.costco.com', 'https://www.costco.com', 'placeholder', 'Marketplace',
    'https://logo.clearbit.com/costco.com',
    'active', TRUE, FALSE,
    '<p>Costco is a members-only wholesale club offering bulk groceries, electronics, home goods, and exclusive member pricing.</p>',
    NULL),

  ('seed-011', 'Dell', 'dell-coupons',
    'Computers, monitors, and technology solutions.',
    'Laptops, desktops, and monitors.',
    'https://www.dell.com', 'https://www.dell.com', 'placeholder', 'Electronics',
    'https://logo.clearbit.com/dell.com',
    'active', TRUE, FALSE,
    '<p>Dell offers a full range of business and consumer computers, monitors, and technology solutions with flexible configuration options.</p>',
    NULL),

  ('seed-012', 'eBay', 'ebay-coupons',
    'The world''s online marketplace.',
    'Online marketplace for new and used goods.',
    'https://www.ebay.com', 'https://www.ebay.com', 'placeholder', 'Marketplace',
    'https://logo.clearbit.com/ebay.com',
    'active', TRUE, FALSE,
    '<p>eBay is a global online marketplace where millions of buyers and sellers trade new and pre-owned items across every category.</p>',
    NULL),

  ('seed-013', 'Gap', 'gap-coupons',
    'Casual clothing for the whole family.',
    'Casual clothing for the whole family.',
    'https://www.gap.com', 'https://www.gap.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/gap.com',
    'active', TRUE, FALSE,
    '<p>Gap offers timeless casual clothing for men, women, and kids, focused on American essentials and everyday comfort.</p>',
    NULL),

  ('seed-014', 'Home Depot', 'home-depot-coupons',
    'Home improvement, tools, and hardware.',
    'Home improvement, tools, and hardware.',
    'https://www.homedepot.com', 'https://www.homedepot.com', 'placeholder', 'Home',
    'https://logo.clearbit.com/homedepot.com',
    'active', TRUE, FALSE,
    '<p>The Home Depot is the world''s largest home improvement retailer, offering tools, building materials, appliances, and project services.</p>',
    NULL),

  ('seed-015', 'IKEA', 'ikea-coupons',
    'Affordable furniture and home decor.',
    'Affordable furniture and home decor.',
    'https://www.ikea.com', 'https://www.ikea.com', 'placeholder', 'Home',
    'https://logo.clearbit.com/ikea.com',
    'active', TRUE, FALSE,
    '<p>IKEA offers affordable, well-designed furniture and home accessories, with flat-pack shipping and DIY assembly as core values.</p>',
    NULL),

  ('seed-016', 'Macy''s', 'macys-coupons',
    'Department store for fashion, home, and beauty.',
    'Department store for fashion, home, and beauty.',
    'https://www.macys.com', 'https://www.macys.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/macys.com',
    'active', TRUE, FALSE,
    '<p>Macy''s is a leading American department store offering clothing, accessories, cosmetics, home furnishings, and more.</p>',
    NULL),

  ('seed-017', 'Nordstrom', 'nordstrom-coupons',
    'Luxury fashion and beauty retailer.',
    'Luxury fashion and beauty.',
    'https://www.nordstrom.com', 'https://www.nordstrom.com', 'placeholder', 'Fashion',
    'https://logo.clearbit.com/nordstrom.com',
    'active', TRUE, FALSE,
    '<p>Nordstrom is a leading fashion specialty retailer, offering premium apparel, shoes, cosmetics, and accessories with exceptional customer service.</p>',
    NULL),

  ('seed-018', 'Target', 'target-coupons',
    'Expect more. Pay less.',
    'Everyday essentials, clothing, and home.',
    'https://www.target.com', 'https://www.target.com', 'placeholder', 'Marketplace',
    'https://logo.clearbit.com/target.com',
    'active', TRUE, FALSE,
    '<p>Target is a general merchandise retailer offering apparel, home goods, electronics, groceries, and exclusive in-house brands.</p>',
    NULL),

  ('seed-019', 'Walmart', 'walmart-coupons',
    'Save money. Live better.',
    'Everyday low prices on everything.',
    'https://www.walmart.com', 'https://www.walmart.com', 'placeholder', 'Marketplace',
    'https://logo.clearbit.com/walmart.com',
    'active', TRUE, FALSE,
    '<p>Walmart is the world''s largest retailer, offering everyday low prices on groceries, apparel, electronics, and home goods across more than 10,000 stores worldwide.</p>',
    NULL)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- MERCHANT_CATEGORIES (M:N links)
-- ============================================================================
INSERT INTO merchant_categories (merchant_id, category_id)
SELECT m.id, c.id
FROM merchants m
JOIN categories c ON LOWER(m.category) = c.slug
WHERE m.merchant_id_display LIKE 'seed-%'
ON CONFLICT (merchant_id, category_id) DO NOTHING;

-- ============================================================================
-- COUPONS (31 total)
-- Helper: use coupon_id_display as idempotency key
-- ============================================================================

-- Nike (6 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-001', id, 'Extra 25% Off Select Styles', 'Shop the latest Nike footwear and apparel. Exclusions apply. Limited time only.', 'SAVE25', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-002', id, 'Student Discount: 10% Off', 'Verify your student status with SheerID to receive a unique promo code.', 'STUDENT10', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 90, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-003', id, 'Free Shipping for Nike Members', 'Sign in or join Nike Membership for free to get free shipping on all orders.', NULL, 'free_shipping', 'placeholder', 'active', TRUE, FALSE, TRUE, 80, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-004', id, 'Up to 40% Off Clearance', 'No code needed. Huge savings on end-of-season footwear and training gear.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-005', id, '20% Off Your First Order', 'New members get 20% off their first purchase of $100 or more.', 'WELCOME20', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 70, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-006', id, '$20 Off Orders Over $120', 'Limited time offer on select full-priced items.', 'NIKE20', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 60, 'https://www.nike.com' FROM merchants WHERE slug = 'nike-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- Amazon (5 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-007', id, '$15 Off Grocery Orders Over $50', 'Limited time offer for Amazon Fresh members.', 'FRESH15', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.amazon.com' FROM merchants WHERE slug = 'amazon-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-008', id, '20% Off Amazon Basics', 'Save on household essentials, electronics, and more.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.amazon.com' FROM merchants WHERE slug = 'amazon-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-009', id, 'Up to 50% Off Kindle E-books', 'Daily deals on best-selling titles across all genres.', NULL, 'sale', 'placeholder', 'active', TRUE, FALSE, TRUE, 85, 'https://www.amazon.com' FROM merchants WHERE slug = 'amazon-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-010', id, '$10 Off Your First App Purchase', 'Download the Amazon app and save on your first order.', 'APP10', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 70, 'https://www.amazon.com' FROM merchants WHERE slug = 'amazon-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-011', id, '15% Off Subscribe & Save', 'Save on recurring deliveries of your favorite products.', NULL, 'deal', 'placeholder', 'active', TRUE, FALSE, TRUE, 75, 'https://www.amazon.com' FROM merchants WHERE slug = 'amazon-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- Best Buy (5 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-012', id, '$100 Off Select MacBook Pro Models', 'Limited time savings on the latest Apple laptops.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.bestbuy.com' FROM merchants WHERE slug = 'best-buy-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-013', id, '20% Off Small Kitchen Appliances', 'Save on blenders, coffee makers, and more.', 'KITCHEN20', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.bestbuy.com' FROM merchants WHERE slug = 'best-buy-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-014', id, 'Free Shipping on Orders $35+', 'Get free standard shipping on thousands of items.', NULL, 'free_shipping', 'placeholder', 'active', TRUE, FALSE, TRUE, 85, 'https://www.bestbuy.com' FROM merchants WHERE slug = 'best-buy-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-015', id, '10% Off for My Best Buy Plus Members', 'Exclusive member-only savings on select tech.', NULL, 'deal', 'placeholder', 'active', TRUE, FALSE, TRUE, 75, 'https://www.bestbuy.com' FROM merchants WHERE slug = 'best-buy-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-016', id, 'Up to 50% Off Clearance Items', 'Huge savings on end-of-life electronics and appliances.', NULL, 'sale', 'placeholder', 'active', TRUE, FALSE, TRUE, 80, 'https://www.bestbuy.com' FROM merchants WHERE slug = 'best-buy-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- Sephora (5 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-017', id, '20% Off Your Entire Purchase', 'Seasonal savings event for Beauty Insider members.', 'SAVINGS', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.sephora.com' FROM merchants WHERE slug = 'sephora-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-018', id, 'Free Trial-Size Gift with $25 Purchase', 'Choose from select luxury beauty samples.', 'LUXURY', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 90, 'https://www.sephora.com' FROM merchants WHERE slug = 'sephora-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-019', id, '10% Off Your First Order', 'Sign up for Sephora emails and save on your first purchase.', 'WELCOME10', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 70, 'https://www.sephora.com' FROM merchants WHERE slug = 'sephora-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-020', id, 'Up to 50% Off Sale Items', 'Save on top-rated makeup, skincare, and hair care.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.sephora.com' FROM merchants WHERE slug = 'sephora-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-021', id, 'Free Shipping on All Orders', 'No minimum spend required for Beauty Insider members.', NULL, 'free_shipping', 'placeholder', 'active', TRUE, FALSE, TRUE, 80, 'https://www.sephora.com' FROM merchants WHERE slug = 'sephora-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- Lowe's (5 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-022', id, '$20 Off Your Next Purchase of $100+', 'Exclusive offer for new email subscribers.', 'LOWES20', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.lowes.com' FROM merchants WHERE slug = 'lowes-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-023', id, '10% Military Discount', 'Active duty, veterans, and their families save every day.', NULL, 'deal', 'placeholder', 'active', TRUE, FALSE, TRUE, 85, 'https://www.lowes.com' FROM merchants WHERE slug = 'lowes-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-024', id, 'Up to 30% Off Major Appliances', 'Save on refrigerators, washers, dryers, and more.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.lowes.com' FROM merchants WHERE slug = 'lowes-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-025', id, 'Free Shipping on Orders $45+', 'Get free standard shipping on most home improvement items.', NULL, 'free_shipping', 'placeholder', 'active', TRUE, FALSE, TRUE, 80, 'https://www.lowes.com' FROM merchants WHERE slug = 'lowes-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-026', id, 'Up to 50% Off Clearance Tools', 'Limited time savings on top tool brands.', NULL, 'sale', 'placeholder', 'active', TRUE, FALSE, TRUE, 75, 'https://www.lowes.com' FROM merchants WHERE slug = 'lowes-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- Kohl's (5 coupons)
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-027', id, '15% Off Your Entire Purchase', 'Use this code at checkout for sitewide savings.', 'ENJOY15', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 100, 'https://www.kohls.com' FROM merchants WHERE slug = 'kohls-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-028', id, '$10 Off Orders of $50+', 'Limited time offer on select home and apparel items.', 'SAVE10', 'code', 'placeholder', 'active', TRUE, FALSE, TRUE, 90, 'https://www.kohls.com' FROM merchants WHERE slug = 'kohls-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-029', id, '30% Off for Kohl''s Cardholders', 'Exclusive savings for Kohl''s charge card members.', 'CHARGE30', 'code', 'placeholder', 'active', TRUE, TRUE, TRUE, 95, 'https://www.kohls.com' FROM merchants WHERE slug = 'kohls-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-030', id, 'Free Shipping on Orders $49+', 'Get free standard shipping on your Kohl''s order.', NULL, 'free_shipping', 'placeholder', 'active', TRUE, FALSE, TRUE, 80, 'https://www.kohls.com' FROM merchants WHERE slug = 'kohls-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;
INSERT INTO coupons (coupon_id_display, merchant_id, title, short_description, coupon_code, deal_type, source_type, coupon_status, is_verified, is_featured, is_visible, priority_score, tracking_link)
SELECT 'seed-c-031', id, 'Up to 70% Off Clearance', 'Huge savings on clothing, home, and more.', NULL, 'sale', 'placeholder', 'active', TRUE, TRUE, TRUE, 98, 'https://www.kohls.com' FROM merchants WHERE slug = 'kohls-coupons'
ON CONFLICT (coupon_id_display) DO NOTHING;

-- ============================================================================
-- LEGAL PAGES (placeholders — update via admin)
-- ============================================================================
INSERT INTO legal_pages (slug, title, body_text, status) VALUES
  ('contact',  'Contact Us',       '<p>Have a question or want to get in touch? Email us at <a href="mailto:hello@couponscode.ai">hello@couponscode.ai</a>.</p>', 'published'),
  ('privacy',  'Privacy Policy',   '<p>Placeholder — update via the admin panel. This site is an affiliate aggregator that does not sell user data.</p>', 'published'),
  ('terms',    'Terms of Service', '<p>Placeholder — update via the admin panel. By using this site you agree to the terms outlined here.</p>', 'published'),
  ('affiliate-disclosure', 'Affiliate Disclosure', '<p>couponscode.ai participates in affiliate programs and may earn a commission when you click out to merchants and make a purchase. This does not affect the price you pay.</p>', 'published')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Populate merchants.last_updated to NOW (for SEO freshness signal)
-- ============================================================================
UPDATE merchants SET last_updated = NOW() WHERE merchant_id_display LIKE 'seed-%';

COMMIT;

-- Verification queries (commented — run manually to check):
-- SELECT count(*) FROM merchants WHERE merchant_id_display LIKE 'seed-%';  -- expect 19
-- SELECT count(*) FROM coupons WHERE coupon_id_display LIKE 'seed-c-%';    -- expect 31
-- SELECT count(*) FROM categories;                                          -- expect 5
-- SELECT count(*) FROM merchant_categories;                                 -- expect 19
-- SELECT count(*) FROM legal_pages;                                         -- expect 4
