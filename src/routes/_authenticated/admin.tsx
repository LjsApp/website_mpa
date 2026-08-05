import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { adminStats, checkAdminRole } from "@/lib/admin.functions";
import { CrudManager, type CrudConfig } from "@/components/admin/CrudManager";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { adminList, adminUpsert } from "@/lib/admin.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ObjectListEditor, ImageListEditor } from "@/components/admin/field-editors";
import { DocumentListEditor } from "@/components/admin/DocumentUpload";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel" }] }),
  beforeLoad: async () => {
    // Skip role check during SSR — the auth token is stored in localStorage
    // which is unavailable server-side. The _authenticated parent already guards
    // unauthenticated access. Server functions are still protected by requireSupabaseAuth.
    if (typeof window === "undefined") return;

    // Verify the logged-in user has admin role before rendering the page
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminPage,
});

type Tab =
  | "dashboard"
  | "projects"
  | "products"
  | "articles"
  | "brands"
  | "clients"
  | "testimonials"
  | "company";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "projects", label: "Proyek" },
  { id: "products", label: "Produk" },
  { id: "articles", label: "Blog" },
  { id: "brands", label: "Brand" },
  { id: "clients", label: "Klien" },
  { id: "testimonials", label: "Testimoni" },
  { id: "company", label: "Perusahaan" },
];

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  const onLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const NavList = ({ onPick }: { onPick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <div className="text-xs font-semibold text-muted-foreground px-3 pt-2 mb-4">MENU</div>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => { setTab(t.id); onPick?.(); }}
          className={`text-left px-3 py-2 text-sm uppercase tracking-wider transition ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="top-right" />
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden shrink-0" aria-label="menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <NavList onPick={() => setNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-display tracking-wide truncate uppercase">Admin Panel</Link>
          </div>
          <Button size="sm" variant="outline" onClick={onLogout}>Logout</Button>
        </div>
      </header>
      <div className="flex-1 flex">
        <aside className="w-56 border-r border-border bg-card/30 p-4 hidden md:block">
          <NavList />
        </aside>
        <main className="flex-1 p-4 md:p-10 max-w-6xl min-w-0 w-full">
          {tab === "dashboard" && <Dashboard />}
          {tab === "projects" && <CrudManager config={projectsConfig} />}
          {tab === "products" && <CrudManager config={productsConfig} />}
          {tab === "articles" && <CrudManager config={articlesConfig} />}
          {tab === "brands" && <CrudManager config={brandsConfig} />}
          {tab === "clients" && <CrudManager config={clientsConfig} />}
          {tab === "testimonials" && <CrudManager config={testimonialsConfig} />}
          {tab === "company" && <CompanyForm />}
        </main>
      </div>
    </div>
  );
}

function Dashboard() {
  const statsFn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => statsFn() });
  const items = [
    { k: "projects", label: "Proyek" },
    { k: "products", label: "Produk" },
    { k: "articles", label: "Artikel" },
    { k: "brands", label: "Brand" },
    { k: "clients", label: "Klien" },
  ] as const;
  return (
    <div>
      <h2 className="text-2xl font-display uppercase mb-6">Dashboard</h2>
      {isLoading ? (
        <div className="text-muted-foreground">Memuat...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {items.map((i) => (
            <div key={i.k} className="border border-border p-5 bg-card">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{i.label}</div>
              <div className="font-display text-4xl text-primary mt-2">{data?.[i.k] ?? 0}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-10 p-6 border border-border bg-card/50">
        <h3 className="font-display uppercase text-lg mb-2">Selamat datang di admin panel</h3>
        <p className="text-sm text-muted-foreground">
          Gunakan menu di samping untuk mengelola konten website. Semua perubahan akan langsung tersimpan dan tampil di halaman publik.
        </p>
      </div>
    </div>
  );
}

function CompanyForm() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminList);
  const upsertFn = useServerFn(adminUpsert);
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["admin", "company_info"], queryFn: () => listFn({ data: { table: "company_info" } }) });
  const row = (rows as any[])[0];
  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => { if (row) setForm(row); }, [row]);

  const mut = useMutation({
    mutationFn: (payload: Record<string, any>) => upsertFn({ data: { table: "company_info", row: payload } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "company_info"] });
      qc.invalidateQueries({ queryKey: ["company-info"] });
      qc.invalidateQueries({ queryKey: ["home-data"] });
      toast.success("Tersimpan");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!row?.id) { toast.error("Data perusahaan belum termuat, coba lagi."); return; }
    const payload: Record<string, any> = { ...form, id: row.id };
    if (!Array.isArray(payload.timeline)) payload.timeline = [];
    if (!Array.isArray(payload.iso_images)) payload.iso_images = [];
    if (!Array.isArray(payload.documents)) payload.documents = [];
    mut.mutate(payload);
  };

  if (isLoading) return <div>Memuat...</div>;

  const field = (name: string, label: string, type: "text" | "textarea" = "text") => {
    const val = form[name] ?? "";
    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        {type === "textarea" ? (
          <Textarea rows={3} value={val} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
        ) : (
          <Input value={val} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-display uppercase mb-6">Informasi Perusahaan</h2>
      <form onSubmit={onSubmit} className="space-y-5 max-w-3xl">
        {field("name", "Nama Perusahaan")}
        <div className="space-y-1">
          <Label>Logo Perusahaan</Label>
          <ImageUpload value={form.logo_url ?? ""} onChange={(url) => setForm({ ...form, logo_url: url })} />
          <p className="text-xs text-muted-foreground">Tampil di navbar dan footer website.</p>
        </div>
        {field("about", "Tentang", "textarea")}
        {field("vision", "Visi", "textarea")}
        {field("mission", "Misi", "textarea")}
        <div className="grid md:grid-cols-2 gap-4">
          {field("linkedin_url", "LinkedIn (LN)")}
          {field("instagram_url", "Instagram (IG)")}
          {field("facebook_url", "Facebook (FB)")}
          {field("youtube_url", "YouTube (YT)")}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {field("address", "Alamat", "textarea")}
          <div className="space-y-4">
            {field("phone", "Telepon")}
            {field("email", "Email")}
            {field("whatsapp", "WhatsApp")}
          </div>
        </div>
        <div className="space-y-1">
          <Label>Google Maps Embed</Label>
          <Textarea
            rows={3}
            value={form.maps_embed ?? ""}
            placeholder='Tempel kode <iframe src="https://www.google.com/maps/embed?..."> dari Google Maps → Bagikan → Sematkan peta'
            onChange={(e) => setForm({ ...form, maps_embed: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Peta akan tampil di section Kontak halaman beranda.</p>
        </div>
        <div className="space-y-1">
          <Label>Jam Operasional</Label>
          <Input
            value={form.operating_hours ?? ""}
            placeholder="Senin — Jumat : 08:00 – 17:00, Dukungan 24/7"
            onChange={(e) => setForm({ ...form, operating_hours: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Tampil di halaman kontak.</p>
        </div>
        <div className="space-y-1">
          <Label>Foto Sertifikat ISO</Label>
          <ImageListEditor value={form.iso_images} onChange={(v) => setForm({ ...form, iso_images: v })} />
          <p className="text-xs text-muted-foreground">Tampil pada bagian footer website.</p>
        </div>
        <div className="space-y-1">
          <Label>Dokumen Perusahaan (Company Profile dll)</Label>
          <DocumentListEditor value={form.documents} onChange={(v) => setForm({ ...form, documents: v })} />
          <p className="text-xs text-muted-foreground">Batas total 2MB. Tampil di halaman beranda (Tentang).</p>
        </div>
        <div className="space-y-1">
          <Label>Linimasa Perusahaan</Label>
          <ObjectListEditor
            value={form.timeline}
            columns={[{ key: "year", label: "Tahun" }, { key: "title", label: "Judul" }, { key: "desc", label: "Deskripsi", multiline: true }]}
            onChange={(v) => setForm({ ...form, timeline: v })}
          />
        </div>
        <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Menyimpan..." : "Simpan Perubahan"}</Button>
      </form>
    </div>
  );
}

const projectsConfig: CrudConfig = {
  table: "projects",
  title: "Manajemen Proyek",
  primaryField: "title",
  columns: [
    { name: "title", label: "Judul" },
    { name: "category", label: "Kategori" },
    { name: "client", label: "Klien" },
    { name: "project_date", label: "Tanggal" },
    { name: "status", label: "Status" },
  ],
  defaults: { status: "Selesai", category: "Otomasi", gallery: [], sort_order: 0 },
  fields: [
    { name: "title", label: "Judul", required: true },
    { name: "slug", label: "Slug (URL)", required: true, placeholder: "otomasi-pabrik-x", hidden: true },
    {
      name: "category",
      label: "Kategori",
      required: true,
      type: "db-select",
      optionsTable: "project_categories",
      optionValue: "name",
      optionLabel: "name",
      manage: true,
      manageTitle: "Kelola Kategori Proyek",
      manageDefaults: { sort_order: 0 },
      manageFields: [{ key: "name", label: "Nama Kategori", placeholder: "cth: Otomasi" }],
    },
    { name: "client", label: "Klien / Pemberi Kerja" },
    { name: "project_date", label: "Tanggal Proyek", type: "date" },
    { name: "duration", label: "Durasi Pengerjaan", placeholder: "cth: 6 bulan" },
    { name: "location", label: "Lokasi", placeholder: "cth: Semarang" },
    { name: "status", label: "Status", type: "select", options: ["Selesai", "Berjalan"] },
    { name: "description", label: "Penjelasan Singkat Proyek", type: "textarea", placeholder: "Deskripsi singkat yang tampil di awal halaman" },
    { name: "gallery", label: "Galeri Gambar", type: "image-list" },
    { name: "documents", label: "Dokumen (maks 2MB per file)", type: "doc-list" },
  ],
};

const productsConfig: CrudConfig = {
  table: "products",
  title: "Manajemen Katalog Produk",
  primaryField: "name",
  columns: [
    { name: "name", label: "Nama" },
    { name: "category_label", label: "Kategori" },
    { name: "brand", label: "Brand" },
    { name: "stock", label: "Stok" },
  ],
  defaults: { stock: "Ready", specs: [], features: [], applications: [], documents: [], sort_order: 0 },
  fields: [
    { name: "name", label: "Nama Produk", required: true },
    { name: "sku", label: "SKU", placeholder: "Opsional, cth: DA83D6D0" },
    { name: "slug", label: "Slug", required: true, hidden: true },
    {
      name: "category",
      label: "Kategori",
      required: true,
      type: "db-select",
      optionsTable: "product_categories",
      optionValue: "label",
      optionLabel: "label",
      manage: true,
      manageTitle: "Kelola Kategori Produk",
      manageDefaults: { sort_order: 0 },
      manageFields: [
        { key: "label", label: "Nama Kategori", placeholder: "cth: Mechanical System" },
      ],
    },
    {
      name: "brand",
      label: "Brand",
      required: true,
      type: "db-select",
      optionsTable: "brands",
      optionValue: "name",
      optionLabel: "name",
      manage: true,
      manageTitle: "Kelola Brand",
      manageDefaults: { sort_order: 0 },
      manageFields: [{ key: "name", label: "Nama Brand", placeholder: "cth: SKF" }],
    },
    { name: "stock", label: "Status Stok", type: "select", options: ["Ready", "Indent", "Pre-Order"] },
    { name: "gallery", label: "Galeri Gambar", type: "image-list" },
    { name: "description", label: "Deskripsi Produk", type: "textarea" },
    { name: "specs", label: "Spesifikasi", type: "object-list", columns: [{ key: "label", label: "Label" }, { key: "value", label: "Nilai" }] },
    { name: "features", label: "Fitur", type: "list", placeholder: "Contoh: Material baja chrome" },
    { name: "applications", label: "Aplikasi", type: "list", placeholder: "Contoh: Motor Listrik" },
    { name: "documents", label: "Dokumen (maks 2MB per file)", type: "doc-list" },
  ],
};

const articlesConfig: CrudConfig = {
  table: "articles",
  title: "Manajemen Blog",
  primaryField: "title",
  columns: [
    { name: "title", label: "Judul" },
    { name: "category", label: "Kategori" },
    { name: "published_at", label: "Tanggal" },
  ],
  defaults: { category: "Berita", author: "Tim Redaksi", tags: [], content: "", read_minutes: 5 },
  fields: [
    { name: "title", label: "Judul", required: true },
    { name: "slug", label: "Slug", required: true, hidden: true },
    {
      name: "category",
      label: "Kategori",
      required: true,
      type: "db-select",
      optionsTable: "article_categories",
      optionValue: "name",
      optionLabel: "name",
      manage: true,
      manageTitle: "Kelola Kategori Blog",
      manageDefaults: { sort_order: 0 },
      manageFields: [{ key: "name", label: "Nama Kategori", placeholder: "cth: Teknologi" }],
    },
    { name: "published_at", label: "Tanggal Terbit", type: "date" },
    { name: "image_url", label: "Gambar Cover", type: "image" },
    { name: "excerpt", label: "Ringkasan", type: "textarea" },
    { name: "content", label: "Isi Artikel", type: "html", placeholder: "Tulis isi artikel di sini..." },
    { name: "tags", label: "Tags", type: "tags", placeholder: "Pisahkan dengan koma, cth: Maintenance, Industri" },
  ],
};

const brandsConfig: CrudConfig = {
  table: "brands",
  title: "Manajemen Brand",
  primaryField: "name",
  columns: [
    { name: "name", label: "Nama" },
    { name: "logo_url", label: "Logo" },
  ],
  defaults: { sort_order: 0 },
  fields: [
    { name: "name", label: "Nama Brand", required: true },
    { name: "logo_url", label: "Logo", type: "image" },
  ],
};

const clientsConfig: CrudConfig = {
  table: "clients",
  title: "Manajemen Klien",
  primaryField: "name",
  columns: [
    { name: "name", label: "Nama" },
    { name: "logo_url", label: "Logo" },
  ],
  defaults: { sort_order: 0 },
  fields: [
    { name: "name", label: "Nama Klien", required: true },
    { name: "logo_url", label: "Logo", type: "image" },
  ],
};

const testimonialsConfig: CrudConfig = {
  table: "testimonials",
  title: "Manajemen Testimoni",
  primaryField: "name",
  columns: [
    { name: "name", label: "Nama" },
    { name: "role", label: "Jabatan" },
    { name: "quote", label: "Kutipan" },
  ],
  defaults: { sort_order: 0 },
  fields: [
    { name: "name", label: "Nama", required: true },
    { name: "role", label: "Jabatan / Perusahaan" },
    { name: "quote", label: "Kutipan Testimoni", type: "textarea", required: true },
  ],
};


