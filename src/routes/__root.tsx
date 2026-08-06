import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
  HeadContent,
  Scripts,
  ScrollRestoration,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useLayoutEffect } from "react";
import { useCompanyState } from "@/hooks/use-company";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

import { getCompany } from "@/lib/public.functions";
import { queryOptions } from "@tanstack/react-query";

const companyQuery = queryOptions({
  queryKey: ["company-info"],
  queryFn: () => getCompany(),
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(companyQuery);
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Industrial Supply & Engineering Solutions" },
      { name: "description", content: "Distributor resmi produk industrial: filter, conveyor, motor, pompa, bearing, dan komponen teknik untuk industri manufaktur dan energi di Indonesia." },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "id_ID" },
      { property: "og:description", content: "Distributor resmi produk industrial untuk manufaktur dan energi di Indonesia." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

import { BackToTop } from "@/components/ui/back-to-top";

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <ScrollRestoration />
        {children}
        <BackToTop />
        <Scripts />
      </body>
    </html>
  );
}

function InnerRootComponent() {
  const { company } = useCompanyState();
  const matches = useMatches();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useLayoutEffect(() => {
    // Memaksa halaman kembali ke paling atas sesaat sebelum komponen baru atau skeleton muncul,
    // agar mencegah halaman tertahan di scroll lama saat navigasi.
    if (isLoading) {
      window.scrollTo(0, 0);
    }
  }, [isLoading, pathname]);

  useLayoutEffect(() => {
    if (company?.name) {
      // Find the deepest route match that has a title in its meta
      const match = [...matches].reverse().find(m => 
        (m.meta as Array<{ title?: string }>)?.some(meta => meta.title)
      );
      
      let title = "Beranda";
      if (match) {
        const titleMeta = (match.meta as Array<{ title?: string }> | undefined)?.find(meta => meta.title);
        if (titleMeta?.title) {
          title = titleMeta.title.split('—')[0].split('-')[0].trim();
        }
      }
      
      document.title = `${title} - ${company.name}`;
    }
  }, [matches, company?.name]);

  useEffect(() => {
    if (company?.logo_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = company.logo_url;
    }
  }, [company?.logo_url]);

  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <InnerRootComponent />
    </QueryClientProvider>
  );
}
