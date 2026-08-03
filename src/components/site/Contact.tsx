import type { CompanyRow } from "@/lib/site-types";
import { mapsEmbedSrc } from "@/hooks/use-company";

export function Contact({ company }: { company?: CompanyRow | null }) {
  const email = company?.email ?? "";
  const phone = company?.phone ?? "";
  const address = company?.address ?? "";
  const wa = (company?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const mapSrc = mapsEmbedSrc(company?.maps_embed);

  return (
    <section id="contact" className="py-28 bg-card/30 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Hubungi Kami</div>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-tight">
            Siap Mendukung<br /><span className="text-gradient-orange">Kebutuhan Industri Anda?</span>
          </h2>
          <p className="text-muted-foreground mt-5">
            Diskusikan proyek Anda dengan kami. Tim engineering siap memberikan konsultasi dan penawaran terbaik.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${email}`} className="bg-primary text-primary-foreground px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:brightness-110 transition glow-orange">
              Hubungi Kami
            </a>
            <a href={`https://wa.me/${wa}`} className="border border-border px-7 py-3.5 font-semibold uppercase tracking-wider text-sm hover:bg-card transition">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-14">
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Kantor Pusat</div>
            <div className="text-sm text-muted-foreground">{address}</div>
          </div>
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Kontak</div>
            <div className="text-sm text-muted-foreground">{phone}<br />{email}</div>
          </div>
          <div className="industrial-card p-7">
            <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Jam Operasional</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {company?.operating_hours ?? "Senin — Jumat · 08:00 – 17:00\nDukungan Darurat 24/7"}
            </div>
          </div>
        </div>

        {mapSrc && (
          <div className="mt-14 overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              src={mapSrc}
              title="Lokasi kantor"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[360px] border-0"
            />
          </div>
        )}
      </div>
    </section>
  );
}
