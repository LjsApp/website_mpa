import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useCompanyState } from "@/hooks/use-company";

const sectionLinks = [
  { hash: "home", label: "Beranda" },
  { hash: "about", label: "Tentang" },
  { hash: "contact", label: "Kontak" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const router = useRouter();
  const onHome = router.state.location.pathname === "/";
  const headerRef = useRef<HTMLElement | null>(null);
  const { company, isLoading } = useCompanyState();
  const name = company?.name ?? "";
  const logo = company?.logo_url ?? null;
  const initials = name.replace(/[^A-Za-z\s]/g, "").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Find intersecting section, prioritize sections that take up more of the screen
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    // Observe all sections with IDs
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));
    
    return () => observer.disconnect();
  }, [onHome]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => { setOpen(false); }, [router.state.location.pathname]);

  const scrollToSection = (hash: string, callback?: () => void) => {
    callback?.();
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderSectionLink = (l: { hash: string; label: string }, onClick?: () => void) => {
    const isActive = activeSection === l.hash;
    return onHome ? (
      <button
        key={l.hash}
        type="button"
        onClick={() => scrollToSection(l.hash, onClick)}
        className={`nav-link text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors uppercase tracking-wider ${isActive ? "active text-primary-foreground font-semibold" : ""}`}
      >
        {l.label}
      </button>
    ) : (
      <Link
        key={l.hash}
        to="/"
        onClick={() => {
          onClick?.();
          // After navigation to home, scroll to section
          setTimeout(() => {
            const el = document.getElementById(l.hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }}
        className="nav-link text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors uppercase tracking-wider"
      >
        {l.label}
      </Link>
    );
  };


  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !onHome
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-primary"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-2">
          {isLoading ? (
            <>
              <div className="w-9 h-9 bg-primary-foreground/20 animate-pulse rounded-sm" />
              <div className="h-4 w-40 bg-primary-foreground/20 animate-pulse rounded-sm" />
            </>
          ) : (
            <>
          {logo ? (
            <img src={logo} alt={name} className="h-9 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : initials ? (
            <div className="w-9 h-9 bg-primary-foreground flex items-center justify-center font-display text-xl text-primary transition-transform duration-300 group-hover:rotate-3">{initials}</div>
          ) : null}
          <span className="font-display text-lg tracking-wide text-primary-foreground uppercase">{name}<span className="text-accent">.</span></span>
            </>
          )}
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {renderSectionLink({ hash: "home", label: "Beranda" })}
          {renderSectionLink({ hash: "about", label: "Tentang" })}
          <Link to="/catalog" className={`nav-link text-sm transition-colors uppercase tracking-wider ${onHome && activeSection === "products" ? "active text-primary-foreground font-semibold" : "text-primary-foreground/75 hover:text-primary-foreground"}`} activeProps={{ className: "text-accent font-semibold" }}>
            Katalog
          </Link>
          <Link to="/projects" className={`nav-link text-sm transition-colors uppercase tracking-wider ${onHome && activeSection === "projects" ? "active text-primary-foreground font-semibold" : "text-primary-foreground/75 hover:text-primary-foreground"}`} activeProps={{ className: "text-accent font-semibold" }}>
            Proyek
          </Link>
          <Link to="/blog" className="nav-link text-sm text-primary-foreground/75 hover:text-primary-foreground transition-colors uppercase tracking-wider" activeProps={{ className: "text-accent font-semibold" }}>
            Blog
          </Link>
          {renderSectionLink({ hash: "contact", label: "Kontak" })}
        </nav>
        {onHome ? (
          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            className="btn-shine hidden md:inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-transform duration-300 hover:scale-105"
          >
            Minta Penawaran →
          </button>
        ) : (
          <Link to="/" onClick={() => setTimeout(() => scrollToSection("contact"), 200)} className="btn-shine hidden md:inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-transform duration-300 hover:scale-105">
            Minta Penawaran →
          </Link>
        )}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary-foreground" aria-label="menu">
          <div className={`w-6 h-0.5 bg-primary-foreground mb-1.5 transition-transform duration-300 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <div className={`w-6 h-0.5 bg-primary-foreground mb-1.5 transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
          <div className={`h-0.5 bg-primary-foreground transition-all duration-300 ${open ? "w-6 -translate-y-2 -rotate-45" : "w-4"}`} />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-primary-foreground/15 bg-primary/95 backdrop-blur-md animate-fade-up">
          <div className="px-6 py-4 flex flex-col">
            {/* Beranda */}
            {onHome ? (
              <button type="button" onClick={() => { scrollToSection("home"); setOpen(false); }}
                className={`w-full text-left text-sm uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors ${onHome && activeSection === "home" ? "text-primary-foreground font-semibold underline decoration-accent decoration-2 underline-offset-4" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
                Beranda
              </button>
            ) : (
              <Link to="/" onClick={() => setOpen(false)}
                className="w-full text-left text-sm text-primary-foreground/80 hover:text-primary-foreground uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors">
                Beranda
              </Link>
            )}
            {/* Tentang */}
            {onHome ? (
              <button type="button" onClick={() => { scrollToSection("about"); setOpen(false); }}
                className={`w-full text-left text-sm uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors ${onHome && activeSection === "about" ? "text-primary-foreground font-semibold underline decoration-accent decoration-2 underline-offset-4" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
                Tentang
              </button>
            ) : (
              <Link to="/" onClick={() => { setOpen(false); setTimeout(() => { const el = document.getElementById("about"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 200); }}
                className="w-full text-left text-sm text-primary-foreground/80 hover:text-primary-foreground uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors">
                Tentang
              </Link>
            )}
            <Link to="/catalog" onClick={() => setOpen(false)}
              className={`w-full text-left text-sm uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors ${onHome && activeSection === "products" ? "text-primary-foreground font-semibold underline decoration-accent decoration-2 underline-offset-4" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
              Katalog
            </Link>
            <Link to="/projects" onClick={() => setOpen(false)}
              className={`w-full text-left text-sm uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors ${onHome && activeSection === "projects" ? "text-primary-foreground font-semibold underline decoration-accent decoration-2 underline-offset-4" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
              Proyek
            </Link>
            <Link to="/blog" onClick={() => setOpen(false)}
              className="w-full text-left text-sm text-primary-foreground/80 hover:text-primary-foreground uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors">
              Blog
            </Link>
            {/* Kontak */}
            {onHome ? (
              <button type="button" onClick={() => { scrollToSection("contact"); setOpen(false); }}
                className={`w-full text-left text-sm uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors ${onHome && activeSection === "contact" ? "text-primary-foreground font-semibold underline decoration-accent decoration-2 underline-offset-4" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
                Kontak
              </button>
            ) : (
              <Link to="/" onClick={() => { setOpen(false); setTimeout(() => { const el = document.getElementById("contact"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 200); }}
                className="w-full text-left text-sm text-primary-foreground/80 hover:text-primary-foreground uppercase tracking-wider py-3 border-b border-primary-foreground/10 transition-colors">
                Kontak
              </Link>
            )}
            <div className="pt-4">
              {onHome ? (
                <button type="button" onClick={() => { scrollToSection("contact"); setOpen(false); }}
                  className="w-full bg-accent text-accent-foreground px-5 py-3 text-center text-sm font-semibold uppercase tracking-wider">
                  Minta Penawaran
                </button>
              ) : (
                <Link to="/" onClick={() => { setOpen(false); setTimeout(() => scrollToSection("contact"), 200); }}
                  className="block w-full bg-accent text-accent-foreground px-5 py-3 text-center text-sm font-semibold uppercase tracking-wider">
                  Minta Penawaran
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
