import { createAPIFileRoute } from "@tanstack/react-start/api";

const SITE_URL = process.env.VITE_SITE_URL ?? "";

export const APIRoute = createAPIFileRoute("/robots.txt")({
  GET: async () => {
    const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /setup
Disallow: /api/

# Admin bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

${SITE_URL ? `Sitemap: ${SITE_URL}/sitemap.xml` : "# Sitemap: set VITE_SITE_URL env var to enable"}
`;

    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  },
});
