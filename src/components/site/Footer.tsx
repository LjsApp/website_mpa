import { Link } from "@tanstack/react-router";
import type { CompanyRow } from "@/lib/site-types";
import { useCompanyState, isoImages, socialLinks } from "@/hooks/use-company";
import { LazyImage } from "@/components/ui/lazy-image";
import { useQuery } from "@tanstack/react-query";
import { listProductCategories } from "@/lib/public.functions";
export function Footer({ company: initial }: { company?: CompanyRow | null }) {
  const { company, isLoading } = useCompanyState(initial);
  const email = company?.email ?? "";
  const phone = company?.phone ?? "";
  const address = company?.address ?? "";
  const wa = (company?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const name = company?.name ?? "";
  const logo = company?.logo_url ?? null;
  const iso = isoImages(company?.iso_images);
  const socials = socialLinks(company);
  const initials = name.replace(/[^A-Za-z\s]/g, "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories-public"],
    queryFn: () => listProductCategories(),
  });

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-5">
            {isLoading ? (
              <>
                <div className="w-9 h-9 bg-primary-foreground/20 animate-pulse rounded-sm" />
                <div className="h-4 w-44 bg-primary-foreground/20 animate-pulse rounded-sm" />
              </>
            ) : (
              <>
            {logo ? (
              <img src={logo} alt={name} className="h-9 w-auto max-w-[140px] object-contain" />
            ) : initials ? (
              <div className="w-9 h-9 bg-primary-foreground flex items-center justify-center font-display text-xl text-primary">{initials}</div>
            ) : null}
            <span className="font-display text-lg tracking-wide uppercase">{name}<span className="text-accent">.</span></span>
              </>
            )}
          </div>
          {company?.about && (
            <p className="text-sm text-primary-foreground/70 leading-relaxed line-clamp-4">{company.about}</p>
          )}
          {socials.length > 0 && (
            <div className="flex gap-3 mt-5">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="w-9 h-9 border border-primary-foreground/25 flex items-center justify-center text-xs uppercase text-primary-foreground/70 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-300 hover:-translate-y-1"
                >
                  {s.key}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-4">Tautan Cepat</div>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/" hash="home" className="hover:text-primary-foreground transition">Beranda</Link></li>
            <li><Link to="/" hash="about" className="hover:text-primary-foreground transition">Tentang</Link></li>
            <li><Link to="/catalog" className="hover:text-primary-foreground transition">Katalog</Link></li>
            <li><Link to="/projects" className="hover:text-primary-foreground transition">Proyek</Link></li>
            <li><Link to="/blog" className="hover:text-primary-foreground transition">Blog</Link></li>
            <li><a href="/#contact" className="hover:text-primary-foreground transition">Kontak</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-4">Produk</div>
          <ul className={`text-sm text-primary-foreground/70 ${categories.length > 5 ? "grid grid-cols-2 gap-x-4 gap-y-2" : "space-y-2"}`}>
            {categories.map((c: any) => (
              <li key={c.id || c.label}>
                <Link to="/catalog" search={{ category: c.label }} className="hover:text-primary-foreground transition">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-accent mb-4">Kontak</div>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {address && <li className="whitespace-pre-line">{address}</li>}
            {phone && <li><a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-primary-foreground transition">{phone}</a></li>}
            {email && <li><a href={`mailto:${email}`} className="hover:text-primary-foreground transition">{email}</a></li>}
            {wa && <li><a href={`https://wa.me/${wa}`} className="text-accent hover:underline">WhatsApp →</a></li>}
          </ul>
        </div>
      </div>
      {iso.length > 0 && (
        <div className="border-t border-primary-foreground/15">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center gap-6">
            <div className="text-xs uppercase tracking-widest text-accent">Sertifikasi</div>
            <div className="flex flex-wrap items-center gap-4">
              {iso.map((src) => (
                <div key={src} className="bg-primary-foreground/95 rounded-xl px-4 py-3 flex items-center justify-center">
                  <LazyImage src={src} alt="Sertifikat ISO" wrapperClassName="h-12 w-24" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="border-t border-primary-foreground/15">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} {name}. Hak Cipta Dilindungi.</div>
          <div className="flex gap-5 text-xs text-primary-foreground/60">
            <a href="#" className="hover:text-primary-foreground">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary-foreground">Syarat Layanan</a>
            <a href="#" className="hover:text-primary-foreground">Legal</a>
          </div>
        </div>
      </div>
      {wa && (
      <a href={`https://wa.me/${wa}`} aria-label="WhatsApp" className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-2xl hover:scale-110 transition z-40 animate-float">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm5.392-3.32c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
      </a>
      )}
    </footer>
  );
}
