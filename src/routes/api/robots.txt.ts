import { createFileRoute } from "@tanstack/react-router";

const SITE_URL = process.env.VITE_SITE_URL ?? "";

export const Route = createFileRoute("/api/robots/txt")({
  server: {
    handlers: {
      GET: async () => {
        const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /setup
Disallow: /api/

# Block AI bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

${SITE_URL ? `Sitemap: ${SITE_URL}/api/sitemap.xml` : "# Sitemap: set VITE_SITE_URL env var"}
`;
        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
