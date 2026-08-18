import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import type { CompanyRow } from "@/lib/site-types";
import { mapsEmbedSrc } from "@/hooks/use-company";
import { listCompanyAdmins } from "@/lib/public.functions";
import { TeamCarousel } from "@/components/site/TeamCarousel";

type AdminRow = {
  id: string;
  name: string;
  phone: string;
  instagram: string | null;
  photo_url: string | null;
  quote?: string | null;
};

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.81 11.81 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
  </svg>
);

const IG_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export function Contact({ company }: { company?: CompanyRow | null }) {
  const email = company?.email ?? "";
  const address = company?.address ?? "";
  const address_ro = company?.address_ro ?? "";
  const mapSrc = mapsEmbedSrc(company?.maps_embed);
  const mapSrcRO = mapsEmbedSrc(company?.maps_embed_ro);

  const listAdminsFn = useServerFn(listCompanyAdmins);
  const { data: admins = [] } = useQuery<AdminRow[]>({
    queryKey: ["company-admins-public"],
    queryFn: () => listAdminsFn(),
    staleTime: 5 * 60_000,
  });

  return (
    <section id="contact" className="py-28 bg-card/30 border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Hubungi Kami</div>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-tight">
            Siap Mendukung<br /><span className="text-gradient-orange">Kebutuhan Industri Anda?</span>
          </h2>
          <p className="text-muted-foreground mt-5 md:whitespace-nowrap">
            Diskusikan proyek Anda dengan kami. Tim engineering siap memberikan konsultasi dan penawaran terbaik.
          </p>
        </div>

        {admins.length > 0 && <TeamCarousel admins={admins} />}

        {/* Maps with addresses underneath */}
        {(mapSrc || mapSrcRO) && (
          <div className="mb-14 grid md:grid-cols-2 gap-6">
            {mapSrcRO && (
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">Peta Alamat RO</div>
                {address_ro && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{address_ro}</p>
                )}
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <iframe
                    src={mapSrcRO}
                    title="Lokasi kantor RO"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[360px] border-0"
                  />
                </div>
              </div>
            )}
            {mapSrc && (
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold uppercase tracking-wider text-primary">Peta Alamat HO</div>
                {address && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{address}</p>
                )}
                <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                  <iframe
                    src={mapSrc}
                    title="Lokasi kantor HO"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[360px] border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Grid: Email & Jam Operasional */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {email && (
            <a
              href={`mailto:${email}`}
              className="industrial-card p-7 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <svg className="w-6 h-6 text-primary group-hover:text-current transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-1">Email Perusahaan</div>
                <div className="text-sm font-medium text-foreground">{email}</div>
              </div>
            </a>
          )}

          {company?.operating_hours && (
            <div className="industrial-card p-7 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <svg className="w-6 h-6 text-primary group-hover:text-current transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-primary mb-1">Jam Operasional</div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">{company.operating_hours}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
