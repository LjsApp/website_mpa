import { useState } from "react";
import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { LazyImage } from "@/components/ui/lazy-image";
import workflowImg from "@/assets/workflow.png";

export function Workflow() {
  const containerRef = useScrollAnimate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="py-16 md:py-20 border-y border-border relative overflow-hidden" ref={containerRef as any}>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-2xl mb-14" data-animate="fade-up">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Alur Kerja</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
              Proses <span className="text-gradient-orange">Kerja Kami</span>
            </h2>
          </div>
          
          <div 
            className="relative rounded-2xl overflow-hidden border border-border shadow-sm md:cursor-default cursor-zoom-in" 
            data-animate="fade-up" 
            style={{ animationDelay: "200ms" }}
            onClick={() => {
              if (window.innerWidth < 768) setIsOpen(true);
            }}
          >
            <LazyImage 
              src={workflowImg} 
              alt="Alur Kerja Morgan Powerindo Amerta" 
              width={1920} 
              height={1080} 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-foreground bg-card/50 hover:bg-card p-3 rounded-full border border-border transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="w-full max-h-screen overflow-auto rounded-lg" onClick={(e) => e.stopPropagation()}>
            <img src={workflowImg} alt="Alur Kerja" className="w-full h-auto" />
          </div>
        </div>
      )}
    </>
  );
}
