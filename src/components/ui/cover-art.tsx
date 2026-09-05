import Image from "next/image";

import { canOptimizeCoverUrl, coverDisplaySrc, coverSlotFromSizes } from "@/lib/collection/cover-src";

interface CoverArtProps {
  url: string | null;
  compactUrl?: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  isInteractive?: boolean;
}

export function CoverArt({
  url,
  compactUrl = null,
  alt,
  sizes = "(max-width: 768px) 50vw, 200px",
  className = "w-full",
  priority = false,
  isInteractive = false,
}: CoverArtProps) {
  const listenClass = isInteractive
    ? "motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
    : "";
  const stillClass = `absolute inset-0 size-full object-cover ${listenClass}`.trim();

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-rs-sm bg-surface-pressed ${className}`.trim()}
    >
      {url && canOptimizeCoverUrl(url) ? (
        <Image
          src={url}
          alt={alt}
          width={600}
          height={600}
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className={stillClass}
        />
      ) : url ? (
        <CoverStill
          url={url}
          compactUrl={compactUrl}
          alt={alt}
          sizes={sizes}
          priority={priority}
          className={stillClass}
        />
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center text-[0.65rem] tracking-[0.2em] text-text-tertiary uppercase ${listenClass}`.trim()}
          aria-hidden
        >
          Resonance
        </div>
      )}
    </div>
  );
}

function CoverStill({
  url,
  compactUrl,
  alt,
  sizes,
  priority,
  className,
}: {
  url: string;
  compactUrl: string | null;
  alt: string;
  sizes: string;
  priority: boolean;
  className: string;
}) {
  const display = coverDisplaySrc({ url, compactUrl, slot: coverSlotFromSizes(sizes) });

  return (
    // Discogs signs each size. Next cannot fetch or resize those URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={display.src}
      srcSet={display.srcSet}
      sizes={sizes}
      alt={alt}
      width={600}
      height={600}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={className}
    />
  );
}
