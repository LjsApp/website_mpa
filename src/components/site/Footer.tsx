import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CompanyRow } from "@/lib/site-types";
import { useCompanyState, isoImages, socialLinks } from "@/hooks/use-company";
import { LazyImage } from "@/components/ui/lazy-image";
import { useQuery } from "@tanstack/react-query";
import { listProductCategories } from "@/lib/public.functions";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/public.functions";

export function Footer({ company: initial }: { company?: CompanyRow | null }) {
  const { company, isLoading } = useCompanyState(initial);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subscribeFn = useServerFn(subscribeNewsletter);

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
      <div className="border-b border-primary-foreground/15">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-display text-2xl mb-2">Berlangganan Newsletter</h3>
            <p className="text-sm text-primary-foreground/70">Dapatkan informasi terbaru mengenai produk, penawaran khusus, dan wawasan industri langsung ke kotak masuk Anda.</p>
          </div>
          {isSubscribed ? (
            <div className="flex items-center gap-3 bg-primary-foreground/10 text-primary-foreground px-6 py-4 animate-in fade-in zoom-in duration-300">
              <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span className="font-semibold tracking-wide">Terima kasih telah berlangganan!</span>
            </div>
          ) : (
            <form
              className="flex flex-col sm:flex-row w-full md:w-auto gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const emailInput = form.querySelector("input[type=email]") as HTMLInputElement;
                if (!emailInput.value) return;

                try {
                  setIsSubmitting(true);
                  await subscribeFn({ data: { email: emailInput.value } });
                  setIsSubscribed(true);
                } catch (err: any) {
                  import("sonner").then(({ toast }) => toast.error(err.message || "Terjadi kesalahan."));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                type="email"
                placeholder="Alamat Email Anda"
                required
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground px-4 py-3 min-w-[250px] placeholder:text-primary-foreground/40 focus:outline-none focus:border-accent disabled:opacity-50"
              />
              <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-accent text-accent-foreground px-6 py-3 font-semibold uppercase tracking-wider text-sm hover:brightness-110 transition disabled:opacity-50 shrink-0">
                {isSubmitting ? "..." : "Daftar"}
              </button>
            </form>
          )}
        </div>
      </div>
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

        </div>
      </div>
    </footer>
  );
}
