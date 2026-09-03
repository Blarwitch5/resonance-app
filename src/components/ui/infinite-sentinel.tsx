"use client";

import { ChevronLeft } from "lucide-react";
import { useEffect, useRef } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { bodyClass } from "@/components/ui/type";
import { FEED_ROOT_MARGIN, feedObserverRoot } from "@/lib/collection/feed";

interface InfiniteSentinelProps {
  label: string;
  hasFurther: boolean;
  isPending: boolean;
  error: string | null;
  further: string;
  end: string;
  listening: string;
  onVisible: () => void;
  earlierHref?: string;
  earlierLabel?: string;
}

export function InfiniteSentinel({
  label,
  hasFurther,
  isPending,
  error,
  further,
  end,
  listening,
  onVisible,
  earlierHref,
  earlierLabel,
}: InfiniteSentinelProps) {
  const node = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const target = node.current;

    if (!target || !hasFurther || isPending || error) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onVisible();
        }
      },
      { root: feedObserverRoot(target), rootMargin: FEED_ROOT_MARGIN },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [error, hasFurther, isPending, onVisible]);

  return (
    <nav aria-label={label} className="flex flex-col gap-3">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {earlierHref && earlierLabel ? (
        <ButtonLink href={earlierHref} variant="ghost" className="self-start">
          <ChevronLeft className="size-4 shrink-0" aria-hidden />
          {earlierLabel}
        </ButtonLink>
      ) : null}
      {hasFurther ? (
        <button
          ref={node}
          type="button"
          onClick={onVisible}
          disabled={isPending}
          className={`min-h-12 rounded-rs-md text-left outline-none focus-visible:ring-2 focus-visible:ring-border-strong disabled:text-text-tertiary ${bodyClass}`}
        >
          {isPending ? listening : further}
        </button>
      ) : (
        <p role="status" className={bodyClass}>
          {end}
        </p>
      )}
    </nav>
  );
}
