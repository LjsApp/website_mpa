import { useScrollAnimate } from "@/hooks/use-scroll-animate";
import { LazyImage } from "@/components/ui/lazy-image";
import workflowImg from "@/assets/workflow.png";

export function Workflow() {
  const containerRef = useScrollAnimate();

  return (
    <section className="py-28 border-y border-border relative overflow-hidden" ref={containerRef as any}>
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="max-w-2xl mb-14" data-animate="fade-up">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Alur Kerja</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase leading-tight">
            Proses <span className="text-gradient-orange">Kerja Kami</span>
          </h2>
        </div>
        
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm" data-animate="fade-up" style={{ animationDelay: "200ms" }}>
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
  );
}
