import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  const siteUrl = 'https://topcoupons.ai';
  const lastmod = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/stores', priority: '0.8', changefreq: 'daily' },
    { url: '/coupons', priority: '0.8', changefreq: 'daily' },
  ];

  try {
    // Fetch all active merchants
    const { data: merchants, error } = await supabase
      .from('merchants')
      .select('slug, updated_at')
      .eq('status', 'active');

    if (error) throw error;

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add merchant pages
    merchants?.forEach(merchant => {
      const merchantLastmod = merchant.updated_at ? new Date(merchant.updated_at).toISOString().split('T')[0] : lastmod;
      sitemap += `  <url>
    <loc>${siteUrl}/${merchant.slug}-coupons</loc>
    <lastmod>${merchantLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    const publicPath = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath);
    }
    
    fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully at public/sitemap.xml');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
