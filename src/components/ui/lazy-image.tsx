import { useState } from "react";
import { cn } from "@/lib/utils";

type LazyImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  alt: string;
  /** Wrapper class; the image always fills the wrapper. */
  wrapperClassName?: string;
  eager?: boolean;
};

/** Image with a skeleton placeholder that fades in once loaded. */
export function LazyImage({ src, alt, className, wrapperClassName, eager, ...rest }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={cn("bg-muted/40", wrapperClassName ?? "w-full h-full")} aria-hidden />;
  }
  return (
    <div className={cn("relative overflow-hidden", wrapperClassName ?? "w-full h-full")}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted/60" aria-hidden />}
      <img
        {...rest}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className ?? "w-full h-full object-cover",
        )}
      />
    </div>
  );
}
