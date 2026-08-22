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

export interface WhyUsItem {
  i: string;
  t: string;
  d: string;
  tagline?: string;
  points?: string[];
  cta_label?: string;
  cta_target?: string;
}

export const DEFAULT_WHY_US: WhyUsItem[] = [
  { 
    i: "01", t: "Keahlian Teknis", d: "Tim engineering berpengalaman dengan pemahaman industri mendalam.",
    tagline: "Konsultasi Teknis Tanpa Biaya Tambahan",
    points: ["Konsultasi pemilihan produk sesuai spesifikasi mesin", "Analisis teknis permasalahan di lapangan", "Rekomendasi lintas brand berdasarkan kebutuhan", "Support via telepon, WhatsApp & kunjungan langsung"],
    cta_label: "Konsultasikan Sekarang",
    cta_target: "#contact"
  },
  { 
    i: "02", t: "Pengadaan Cepat", d: "Sistem sourcing efisien dengan jaringan supplier yang kuat.",
    tagline: "Konfirmasi Ketersediaan dalam 1×24 Jam",
    points: ["Stok ready untuk item fast-moving", "Jaringan supplier global (Eropa, Asia, Amerika)", "Indent terpantau real-time"],
    cta_label: "Cek Ketersediaan",
    cta_target: "#contact"
  },
  { 
    i: "03", t: "Produk Original", d: "Produk asli bersertifikat dari brand resmi terpercaya.",
    tagline: "100% Asli, Bersertifikat, Bergaransi",
    points: ["Certificate of Authenticity (COA) dari pabrik", "Authorized distributor brand internasional", "Garansi sesuai ketentuan pabrikan", "Tidak menjual produk KW / replika / grey market"],
    cta_label: "Lihat Brand Kami",
    cta_target: "#brands"
  },
  { 
    i: "04", t: "Pengiriman Nasional", d: "Cakupan ke seluruh wilayah utama di Indonesia.",
  },
  { 
    i: "05", t: "Dukungan After Sales", d: "Layanan maintenance teknis dan support berkelanjutan.",
    tagline: "Kami Ada Setelah Penjualan, Bukan Hanya Saat Penjualan",
    points: ["Penanganan garansi & klaim produk", "Technical support via WhatsApp & email", "Panduan instalasi & troubleshooting", "Kunjungan teknis ke lokasi (untuk order tertentu)"],
    cta_label: "Hubungi Tim Support",
    cta_target: "#contact"
  },
  { 
    i: "06", t: "Harga Kompetitif", d: "Solusi biaya efisien tanpa mengorbankan kualitas.",
    tagline: "Harga Terbaik Tanpa Mengorbankan Kualitas",
    points: ["Pembelian langsung tanpa perantara berlebih", "Harga transparan, tidak ada biaya tersembunyi", "Diskon khusus untuk bulk order", "Harga kontrak untuk pelanggan reguler"],
    cta_label: "Minta Penawaran Harga",
    cta_target: "#contact"
  },
];

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

export function asWhyUsItems(v: unknown): WhyUsItem[] {
  if (Array.isArray(v) && v.length > 0) {
    return v.map((x: any) => ({
      i: String(x.i ?? ""),
      t: String(x.t ?? ""),
      d: String(x.d ?? ""),
      tagline: x.tagline ? String(x.tagline) : undefined,
      points: Array.isArray(x.points) ? x.points.map(String) : undefined,
      cta_label: x.cta_label ? String(x.cta_label) : undefined,
      cta_target: x.cta_target ? String(x.cta_target) : undefined,
    }));
  }
  return DEFAULT_WHY_US;
}

export function formatDateID(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}



export const ARTICLE_CATEGORIES = ["Semua", "Industri", "Teknologi", "Energi", "Manufaktur", "Tips", "Berita"] as const;
