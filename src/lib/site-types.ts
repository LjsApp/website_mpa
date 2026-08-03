import type { Database } from "@/integrations/supabase/types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
export type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
export type CompanyRow = Database["public"]["Tables"]["company_info"]["Row"];

export type SpecItem = { label: string; value: string };
export type StatItem = { label: string; value: string };
export type TimelineItem = { year: string; title: string; desc: string };

export function asStringList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

/** Normalize article content to an HTML string.
 * Supports new HTML strings and legacy arrays of paragraphs. */
export function asHtmlContent(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    return v
      .filter((x): x is string => typeof x === "string")
      .map((p) => `<p>${p}</p>`)
      .join("");
  }
  return "";
}

export function asSpecs(v: unknown): SpecItem[] {
  if (Array.isArray(v)) {
    return v
      .filter((x): x is SpecItem => !!x && typeof x === "object" && "label" in x && "value" in x)
      .map((x) => ({ label: String(x.label), value: String(x.value) }));
  }
  return [];
}

export function asStats(v: unknown): StatItem[] {
  return asSpecs(v);
}

export function asTimeline(v: unknown): TimelineItem[] {
  if (Array.isArray(v)) {
    return v
      .filter((x): x is TimelineItem => !!x && typeof x === "object")
      .map((x: any) => ({ year: String(x.year ?? ""), title: String(x.title ?? ""), desc: String(x.desc ?? "") }));
  }
  return [];
}

export function formatDateID(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}



export const ARTICLE_CATEGORIES = ["Semua", "Industri", "Teknologi", "Energi", "Manufaktur", "Tips", "Berita"] as const;
