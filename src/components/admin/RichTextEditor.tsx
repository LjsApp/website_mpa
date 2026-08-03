import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { asHtmlContent } from "@/lib/site-types";

/** Lightweight WYSIWYG editor that outputs HTML. Client-only. */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: unknown;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const html = asHtmlContent(value);

  // Sync external value into the editor only when it differs (avoids caret jumps).
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const tools: { label: string; cmd: string; arg?: string; title: string }[] = [
    { label: "B", cmd: "bold", title: "Tebal" },
    { label: "I", cmd: "italic", title: "Miring" },
    { label: "U", cmd: "underline", title: "Garis bawah" },
    { label: "H2", cmd: "formatBlock", arg: "H2", title: "Judul" },
    { label: "H3", cmd: "formatBlock", arg: "H3", title: "Sub judul" },
    { label: "P", cmd: "formatBlock", arg: "P", title: "Paragraf" },
    { label: "• List", cmd: "insertUnorderedList", title: "Daftar" },
    { label: "1. List", cmd: "insertOrderedList", title: "Daftar bernomor" },
    { label: "❝", cmd: "formatBlock", arg: "BLOCKQUOTE", title: "Kutipan" },
  ];

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/30 p-1.5">
        {tools.map((t) => (
          <Button
            key={t.label}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            title={t.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd, t.arg)}
          >
            {t.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          title="Tautan"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt("Masukkan URL:");
            if (url) exec("createLink", url);
          }}
        >
          🔗
        </Button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose-content min-h-[220px] max-h-[480px] overflow-y-auto px-4 py-3 text-sm leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
      />
    </div>
  );
}