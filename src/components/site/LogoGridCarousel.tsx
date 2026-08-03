import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LazyImage } from "@/components/ui/lazy-image";

export type LogoItem = { id: string | number; name: string; logo_url?: string | null };

function useColumns() {
  const [cols, setCols] = useState(6);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 768 ? 2 : w < 1024 ? 4 : 6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

/** Grid of logos limited to `rows` rows per page, paginated as a carousel. */
export function LogoGridCarousel({
  items,
  rows = 2,
  variant = "light",
}: {
  items: LogoItem[];
  rows?: number;
  variant?: "light" | "dark";
}) {
  const cols = useColumns();
  const perPage = cols * rows;
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    const out: LogoItem[][] = [];
    for (let i = 0; i < items.length; i += perPage) out.push(items.slice(i, i + perPage));
    return out.length ? out : [[]];
  }, [items, perPage]);

  useEffect(() => {
    setPage((p) => Math.min(p, pages.length - 1));
  }, [pages.length]);

  const isDark = variant === "dark";
  const navClass = isDark
    ? "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
    : "border-border text-muted-foreground hover:border-primary hover:text-primary";

  const shadow = isDark
    ? "shadow-[0_2px_12px_-6px_rgb(0_0_0_/_0.25)] hover:shadow-[0_24px_44px_-20px_rgb(0_0_0_/_0.45)] hover:border-accent/50"
    : "shadow-[0_2px_12px_-6px_rgb(16_51_41_/_0.25)] hover:shadow-[0_24px_44px_-20px_rgb(16_51_41_/_0.45)] hover:border-primary/40";

  if (items.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((group, gi) => (
            <div
              key={gi}
              className="w-full shrink-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start"
            >
              {group.map((b) => (
                <div
                  key={b.id}
                  className={`group h-[140px] rounded-[18px] bg-white border border-transparent flex flex-col items-center justify-center gap-3 px-4 transition-all duration-300 hover:-translate-y-1.5 ${shadow}`}
                >
                  {b.logo_url ? (
                    <>
                      <LazyImage
                        src={b.logo_url}
                        alt={b.name}
                        wrapperClassName="h-14 w-full"
                        className="max-h-14 w-full object-contain grayscale opacity-75 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground text-center leading-tight line-clamp-2">
                        {b.name}
                      </div>
                    </>
                  ) : (
                    <div className="font-display text-xl md:text-2xl tracking-wide text-foreground/80 transition group-hover:text-primary text-center">
                      {b.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {pages.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => setPage((p) => (p - 1 + pages.length) % pages.length)}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 ${navClass}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Halaman ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === page
                    ? `w-6 ${isDark ? "bg-accent" : "bg-primary"}`
                    : `w-2 ${isDark ? "bg-primary-foreground/35" : "bg-border"}`
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Berikutnya"
            onClick={() => setPage((p) => (p + 1) % pages.length)}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 ${navClass}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}