import { asDocs, formatSize } from "@/components/admin/DocumentUpload";

/** Public list of downloadable documents attached to a product or project. */
export function DocumentDownloads({ value, title = "Dokumen" }: { value: unknown; title?: string }) {
  const docs = asDocs(value);
  if (docs.length === 0) return null;
  return (
    <div className="mb-10">
      <h2 className="font-display text-xl uppercase mb-4">{title}</h2>
      <div className="space-y-2">
        {docs.map((d, i) => (
          <a
            key={i}
            href={d.url}
            download={d.name}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 border border-border bg-card/40 px-4 py-3 text-sm hover:border-primary hover:bg-card transition"
          >
            <span className="flex items-center gap-3 min-w-0">
              <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="truncate">{d.name}</span>
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
              {formatSize(d.size)} Unduh ↓
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}