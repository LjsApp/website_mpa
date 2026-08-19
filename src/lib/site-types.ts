import type { Database } from "@/integrations/supabase/types";

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
export type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
export type CompanyRow = Omit<Database["public"]["Tables"]["company_info"]["Row"], "whatsapp" | "whatsapp_2" | "whatsapp_3">;

export type SpecItem = { label: string; value: string };
export type StatItem = { label: string; value: string };
export type TimelineItem = { year: string; title: string; desc: string };

export interface CompanyStats {
  hero: StatItem[];
  brands: StatItem[];
  clients: StatItem[];
}

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

export function asCompanyStats(v: unknown): CompanyStats {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const obj = v as any;
    // Check if the object has the expected properties to avoid overriding with defaults if it's just empty
    if (obj.hero || obj.brands || obj.clients) {
      return {
        hero: asStats(obj.hero),
        brands: asStats(obj.brands),
        clients: asStats(obj.clients),
      };
    }
  }
  // Default values if missing
  return {
    hero: [
      { value: "10+", label: "TAHUN PENGALAMAN" },
      { value: "150+", label: "PROYEK SELESAI" },
      { value: "80+", label: "KLIEN AKTIF" },
      { value: "24/7", label: "DUKUNGAN" }
    ],
    brands: [
      { value: "80+", label: "Brand Global" },
      { value: "100%", label: "Original Product" }
    ],
    clients: [
      { value: "50+", label: "PERUSAHAAN" },
      { value: "25+", label: "INDUSTRI" },
      { value: "10+", label: "TAHUN PENGALAMAN" }
    ]
  };
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
