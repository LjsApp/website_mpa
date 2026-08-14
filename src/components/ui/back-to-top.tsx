import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCompanyState } from "@/hooks/use-company";

export function BackToTop() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isWaOpen, setIsWaOpen] = useState(false);
  const { company } = useCompanyState();
  const wa = (company?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const wa2 = (company?.whatsapp_2 ?? "").replace(/[^0-9]/g, "");
  const wa3 = (company?.whatsapp_3 ?? "").replace(/[^0-9]/g, "");

  const hasWa = !!(wa || wa2 || wa3);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPage =
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    pathname !== "/tracking";

  useEffect(() => {
    setIsMounted(true);
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't render on server to avoid hydration mismatch
  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none flex flex-col items-end">
      {/* Tracking Button */}
      {isPublicPage && (
        <div
          className={`absolute right-0 flex flex-col items-end pointer-events-auto transition-all duration-300 ${
            isVisible ? "bottom-32" : "bottom-16"
          }`}
        >
          <Link
            to="/tracking"
            aria-label="Cek Status Pengiriman"
            title="Lacak Pesanan"
            className="w-12 h-12 rounded-sm bg-[#E85D04] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
          >
            {/* Package/tracking icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
              <path d="m7.5 4.27 9 5.15" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
              <circle cx="18.5" cy="15.5" r="2.5" />
              <path d="M20.27 17.27 22 19" />
            </svg>
          </Link>
        </div>
      )}

      {hasWa && (
        <div
          className={`absolute right-0 flex flex-col items-end pointer-events-auto transition-all duration-300 ${
            isVisible ? "bottom-16" : "bottom-0"
          }`}
        >
          {isWaOpen && (
            <div className="bg-card border border-border shadow-xl rounded-sm p-2 flex flex-col mb-3 w-40 text-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="font-semibold px-3 py-2 border-b border-border/50 text-foreground mb-1 text-xs uppercase tracking-wider text-primary">
                Hubungi Admin
              </div>
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsWaOpen(false)}
                  className="px-3 py-2 hover:bg-primary/10 rounded-sm flex items-center gap-2 transition-colors text-foreground text-sm"
                >
                  Admin 1
                </a>
              )}
              {wa2 && (
                <a
                  href={`https://wa.me/${wa2}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsWaOpen(false)}
                  className="px-3 py-2 hover:bg-primary/10 rounded-sm flex items-center gap-2 transition-colors text-foreground text-sm"
                >
                  Admin 2
                </a>
              )}
              {wa3 && (
                <a
                  href={`https://wa.me/${wa3}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsWaOpen(false)}
                  className="px-3 py-2 hover:bg-primary/10 rounded-sm flex items-center gap-2 transition-colors text-foreground text-sm"
                >
                  Admin 3
                </a>
              )}
            </div>
          )}
          <button
            onClick={() => setIsWaOpen(!isWaOpen)}
            aria-label="WhatsApp"
            className="w-12 h-12 rounded-sm bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm5.392-3.32c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
            </svg>
          </button>
        </div>
      )}

      <button
        onClick={scrollToTop}
        className={`w-12 h-12 bg-primary text-primary-foreground shadow-lg transition-all duration-300 rounded-sm hover:brightness-110 flex items-center justify-center pointer-events-auto absolute right-0 bottom-0 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Kembali ke atas"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
}
