import { useQuery } from "@tanstack/react-query";
import { getCompany } from "@/lib/public.functions";
import type { CompanyRow } from "@/lib/site-types";

/** Shared company profile data used by the navbar, footer and contact section. */
export function useCompanyState(initial?: CompanyRow | null) {
  const { data, isPending } = useQuery({
    queryKey: ["company-info"],
    queryFn: () => getCompany(),
    staleTime: 5 * 60_000,
    initialData: initial ?? undefined,
  });
  const company = (data ?? initial ?? null) as CompanyRow | null;
  return { company, isLoading: isPending && !company };
}

export function useCompany(initial?: CompanyRow | null) {
  return useCompanyState(initial).company;
}

export type SocialLink = { key: string; label: string; url: string };

const SOCIAL_BASE: Record<string, string> = {
  in: "https://www.linkedin.com/in/",
  ig: "https://www.instagram.com/",
  fb: "https://www.facebook.com/",
  yt: "https://www.youtube.com/@",
};

/** Accepts either a full URL or just a username/handle and returns a full profile URL. */
function toSocialUrl(key: string, raw: string): string {
  const value = raw.trim().replace(/^@/, "");
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(www\.)?(linkedin|instagram|facebook|youtube|youtu)\./i.test(value)) return `https://${value}`;
  return SOCIAL_BASE[key] + encodeURIComponent(value);
}

/** Social media links configured in company management. */
export function socialLinks(company?: CompanyRow | null): SocialLink[] {
  const c = company as Record<string, unknown> | null | undefined;
  const raw: [string, string, unknown][] = [
    ["in", "LinkedIn", c?.linkedin_url],
    ["ig", "Instagram", c?.instagram_url],
    ["fb", "Facebook", c?.facebook_url],
    ["yt", "YouTube", c?.youtube_url],
  ];
  return raw
    .filter(([, , url]) => typeof url === "string" && url.trim().length > 0)
    .map(([key, label, url]) => ({ key, label, url: toSocialUrl(key, url as string) }));
}

export function isoImages(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x) : [];
}

/** Extract a safe Google Maps embed src from a pasted iframe snippet or URL. */
export function mapsEmbedSrc(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  const match = value.match(/src\s*=\s*["']([^"']+)["']/i);
  const url = match ? match[1] : value;
  if (!/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url)) return null;
  return url;
}