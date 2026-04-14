import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Dynamic sitemap and SEO may not work correctly.");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

const SITE_URL = "https://www.topcoupons.ai";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&h=630&q=80";

async function getMetaData(urlPath: string) {
  const meta = {
    title: "TopCoupons.ai | Best Coupons & Promo Codes",
    description: "Find fresh coupon codes, promo offers, and savings tips for top stores like Nike, Sephora, Amazon, and more.",
    image: DEFAULT_IMAGE,
    url: `${SITE_URL}${urlPath}`,
  };

  // Merchant Page Match
  const merchantMatch = urlPath.match(/^\/([^\/]+)-coupons$/);
  if (merchantMatch) {
    const slug = merchantMatch[1];
    const { data: merchant } = await supabase
      .from("merchants")
      .select("name, description, short_description, logo_url")
      .eq("slug", slug)
      .maybeSingle();

    if (merchant) {
      meta.title = `${merchant.name} Coupons & Promo Codes | TopCoupons.ai`;
      meta.description = merchant.description || merchant.short_description || `Save with the latest ${merchant.name} coupons and promo codes. Discover fresh deals and discounts updated regularly.`;
      // Use merchant logo if available, otherwise default
      meta.image = merchant.logo_url || DEFAULT_IMAGE;
    }
  } else if (urlPath === "/stores") {
    meta.title = "All Stores | TopCoupons.ai";
    meta.description = "Browse our full list of partner stores and find the best deals for your favorite brands.";
  } else if (urlPath === "/coupons") {
    meta.title = "Top Coupons & Promo Codes | TopCoupons.ai";
    meta.description = "Browse fresh coupon codes and trending deals from leading brands, updated regularly.";
  } else if (urlPath === "/categories") {
    meta.title = "Coupon Categories | TopCoupons.ai";
    meta.description = "Shop by category and find the best coupons for fashion, electronics, home, beauty, and more. Explore thousands of deals organized by what you love most.";
  } else if (urlPath.startsWith("/category/")) {
    const catSlug = urlPath.replace("/category/", "");
    const catTitle = catSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    meta.title = `${catTitle} Coupons & Promo Codes | TopCoupons.ai`;
    meta.description = `Save on ${catTitle} with our latest verified coupons and promo codes. Discover fresh deals from top brands in ${catTitle} updated daily.`;
  }

  return meta;
}

function generateMetaHtml(meta: any) {
  return `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${meta.url}" />
    <meta name="theme-color" content="#0369a1" />
    
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${meta.url}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:site_name" content="TopCoupons.ai" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${meta.url}" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
  `;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Dynamic Sitemap Route
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const siteUrl = "https://www.topcoupons.ai";
      const lastmod = new Date().toISOString().split("T")[0];

      // 1. Static Pages (Excluding legal pages as requested)
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/stores", priority: "0.8", changefreq: "daily" },
        { url: "/coupons", priority: "0.8", changefreq: "daily" },
        { url: "/categories", priority: "0.7", changefreq: "weekly" },
      ];

      // 2. Fetch Dynamic Data
      const [merchantsResult] = await Promise.all([
        supabase
          .from("merchants")
          .select("slug, updated_at, category")
          .eq("status", "active")
          .eq("is_visible", true)
      ]);

      const merchants = merchantsResult.data || [];

      // 3. Dynamic Category Pages
      const categories = new Set<string>();
      merchants.forEach(m => {
        if (m.category) {
          // Match the slug logic in CategoryPage.tsx
          const catSlug = m.category.toLowerCase().replace(/ & /g, '-and-').replace(/\s+/g, '-');
          categories.add(catSlug);
        }
      });

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      // Add Static Pages
      staticPages.forEach(page => {
        xml += `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      });

      // Add Category Pages
      categories.forEach(catSlug => {
        xml += `  <url>
    <loc>${siteUrl}/category/${catSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });

      // Add Merchant Pages
      merchants.forEach(merchant => {
        const merchantLastmod = merchant.updated_at ? new Date(merchant.updated_at).toISOString().split("T")[0] : lastmod;
        xml += `  <url>
    <loc>${siteUrl}/${merchant.slug}-coupons</loc>
    <lastmod>${merchantLastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
      });

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Sitemap generation error:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false })); // Disable default index serving

    app.get("*", async (req, res) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        if (!fs.existsSync(indexPath)) {
          return res.status(404).send("Index file not found");
        }

        let html = fs.readFileSync(indexPath, "utf-8");
        
        // Get metadata for the current route
        const meta = await getMetaData(req.path);
        const metaHtml = generateMetaHtml(meta);

        // Inject meta tags and remove the default title tag to avoid duplicates
        html = html.replace(/<title>.*?<\/title>/, "");
        html = html.replace("<!-- SEO_TAGS -->", metaHtml);

        res.send(html);
      } catch (error) {
        console.error("Error serving index.html:", error);
        res.status(500).send("Internal Server Error");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
