type Variant = "brand" | "client";

const palette = [
  { bg: "#0EA5E9", fg: "#ffffff" }, // sky
  { bg: "#16A34A", fg: "#ffffff" }, // green
  { bg: "#DC2626", fg: "#ffffff" }, // red
  { bg: "#F59E0B", fg: "#0a0a0a" }, // amber
  { bg: "#7C3AED", fg: "#ffffff" }, // violet
  { bg: "#0F172A", fg: "#F97316" }, // navy + orange
  { bg: "#E11D48", fg: "#ffffff" }, // rose
  { bg: "#0D9488", fg: "#ffffff" }, // teal
  { bg: "#1E40AF", fg: "#ffffff" }, // indigo
  { bg: "#65A30D", fg: "#ffffff" }, // lime
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  const parts = name.replace(/[^A-Za-z\s]/g, "").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? "")).toUpperCase();
}

export function LogoBadge({
  name,
  variant = "brand",
  logoUrl,
}: {
  name: string;
  variant?: Variant;
  logoUrl?: string | null;
}) {
  const c = palette[hash(name) % palette.length];
  const init = initials(name);
  const isClient = variant === "client";

  return (
    <div
      className="group flex flex-col items-center justify-center gap-3 p-5 bg-background border border-border hover:border-primary transition-all hover:-translate-y-0.5"
      title={name}
    >
      {logoUrl ? (
        <div className="w-14 h-14 flex items-center justify-center">
          <img
            src={logoUrl}
            alt={name}
            loading="lazy"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div
        className="w-14 h-14 flex items-center justify-center font-display tracking-wider shadow-md"
        style={{
          background: isClient ? "transparent" : c.bg,
          color: isClient ? c.bg : c.fg,
          border: isClient ? `2px solid ${c.bg}` : "none",
          borderRadius: isClient ? "999px" : "6px",
          fontSize: init.length > 2 ? 14 : 18,
        }}
        >
          {init}
        </div>
      )}
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition text-center leading-tight">
        {name}
      </div>
    </div>
  );
}