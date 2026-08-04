import { createAPIFileRoute } from "@tanstack/react-start/api";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_URL = process.env.VITE_SITE_URL ?? "";

function escXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc: string, lastmod?: string | null, priority = "0.7", changefreq = "weekly") {
  return `  <url>
    <loc>${SITE_URL}${escXml(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const APIRoute = createAPIFileRoute("/sitemap.xml")({
  GET: async () => {
    const staticPages = [
      urlEntry("/", undefined, "1.0", "daily"),
      urlEntry("/catalog", undefined, "0.9", "weekly"),
      urlEntry("/projects", undefined, "0.8", "weekly"),
      urlEntry("/blog", undefined, "0.9", "daily"),
    ];

    // Fetch dynamic pages
    const [{ data: products }, { data: articles }, { data: projects }] = await Promise.all([
      supabaseAdmin.from("products").select("slug, updated_at").order("updated_at", { ascending: false }),
      supabaseAdmin.from("articles").select("slug, published_at").order("published_at", { ascending: false }),
      supabaseAdmin.from("projects").select("slug, updated_at").order("updated_at", { ascending: false }),
    ]);

    const productUrls = (products ?? []).map((p) =>
      urlEntry(`/products/${p.slug}`, p.updated_at, "0.8", "monthly")
    );
    const articleUrls = (articles ?? []).map((a) =>
      urlEntry(`/blog/${a.slug}`, a.published_at, "0.8", "weekly")
    );
    const projectUrls = (projects ?? []).map((p) =>
      urlEntry(`/projects/${p.slug}`, p.updated_at, "0.7", "monthly")
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...productUrls, ...articleUrls, ...projectUrls].join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  },
});
