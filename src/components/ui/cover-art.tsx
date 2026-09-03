import Image from "next/image";

interface CoverArtProps {
  url: string | null;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  isInteractive?: boolean;
}

export function CoverArt({
  url,
  alt,
  sizes = "(max-width: 768px) 50vw, 200px",
  className = "w-full",
  priority = false,
  isInteractive = false,
}: CoverArtProps) {
  const listenClass = isInteractive
    ? "motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
    : "";

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-rs-sm bg-surface-pressed ${className}`.trim()}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          width={600}
          height={600}
          sizes={sizes}
          unoptimized
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className={`absolute inset-0 size-full object-cover ${listenClass}`.trim()}
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
