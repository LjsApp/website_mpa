import { useEffect, useState } from "react";
import type { WhyUsItem } from "@/lib/site-types";

interface Props {
  item: WhyUsItem;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyUsModal({ item, icon, isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const handleCTA = () => {
    onClose();
    if (item.cta_target) {
      setTimeout(() => {
        const el = document.querySelector(item.cta_target!);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative w-full max-w-2xl bg-card border border-border shadow-2xl transition-all duration-300 ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-background border border-border transition-colors hover:bg-destructive hover:text-destructive-foreground z-10"
          aria-label="Tutup"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        <div className="p-8 sm:p-12 border-b border-border bg-background/50">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-16 h-16 shrink-0 border border-border bg-card flex items-center justify-center text-primary">
              {icon}
            </div>
            <div>
              <div className="font-display text-4xl text-primary/30 mb-1 leading-none">{item.i}</div>
              <h3 className="font-display text-2xl sm:text-3xl uppercase leading-tight">{item.t}</h3>
            </div>
          </div>
          
          {item.tagline && (
            <div className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">
              {item.tagline}
            </div>
          )}
          
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            {item.d}
          </p>
        </div>

        {item.points && item.points.length > 0 && (
          <div className="p-8 sm:p-12 border-b border-border">
            <ul className="space-y-4">
              {item.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-muted-foreground">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-8 sm:p-12 bg-card">
          <button 
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
          >
            {item.cta_label || "Hubungi Kami →"}
          </button>
        </div>
      </div>
    </div>
  );
}
