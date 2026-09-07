"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  confirmSubmitDockClass,
  confirmSubmitFixedClass,
  confirmSubmitGlowClass,
  confirmSubmitSlotClass,
  isScrollNearEnd,
  shouldDockConfirmSubmit,
} from "@/lib/collection/layout";

interface ConfirmSubmitBarProps {
  children: ReactNode;
}

/**
 * Floats the confirm CTA above the thumb chrome while the form is long,
 * then docks into the document once the natural slot is on screen (or the scroll hits the end).
 */
export function ConfirmSubmitBar({ children }: ConfirmSubmitBarProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;

    if (!slot) {
      return;
    }

    let frame = 0;

    function measure() {
      const node = slotRef.current;

      if (!node) {
        return;
      }

      const scrollRoot = resolveScrollRoot(node);
      const rect = node.getBoundingClientRect();
      const viewport = readViewportBounds(scrollRoot);
      const nearEnd = readScrollNearEnd(scrollRoot);
      const next = shouldDockConfirmSubmit({
        slotTop: rect.top,
        slotBottom: rect.bottom,
        viewportTop: viewport.top,
        viewportBottom: viewport.bottom,
        isScrollNearEnd: nearEnd,
      });

      setIsDocked((current) => (current === next ? current : next));
    }

    function scheduleMeasure() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    const scrollRoot = resolveScrollRoot(slot);
    const observer = new IntersectionObserver(
      () => {
        scheduleMeasure();
      },
      {
        root: scrollRoot,
        threshold: [0, 0.01, 1],
      },
    );
    observer.observe(slot);

    scheduleMeasure();

    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener("scroll", scheduleMeasure, { passive: true });
    // Mobile often scrolls the document element; capture both.
    document.addEventListener("scroll", scheduleMeasure, { passive: true, capture: true });
    window.addEventListener("resize", scheduleMeasure);
    window.visualViewport?.addEventListener("resize", scheduleMeasure);
    window.visualViewport?.addEventListener("scroll", scheduleMeasure);

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(slot);
    if (scrollRoot) {
      resizeObserver.observe(scrollRoot);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scrollTarget.removeEventListener("scroll", scheduleMeasure);
      document.removeEventListener("scroll", scheduleMeasure, true);
      window.removeEventListener("resize", scheduleMeasure);
      window.visualViewport?.removeEventListener("resize", scheduleMeasure);
      window.visualViewport?.removeEventListener("scroll", scheduleMeasure);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={slotRef} className={confirmSubmitSlotClass}>
      <div className={isDocked ? confirmSubmitDockClass : confirmSubmitFixedClass}>
        <div className={`inline-flex w-max max-w-[calc(100vw-2rem)] whitespace-nowrap rounded-full ${confirmSubmitGlowClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function resolveScrollRoot(node: Element): HTMLElement | null {
  const root = node.closest("[data-scroll-root]");

  if (!(root instanceof HTMLElement)) {
    return null;
  }

  const overflowY = window.getComputedStyle(root).overflowY;
  return overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay" ? root : null;
}

function readViewportBounds(scrollRoot: HTMLElement | null): { top: number; bottom: number } {
  if (scrollRoot) {
    const rootRect = scrollRoot.getBoundingClientRect();
    return { top: rootRect.top, bottom: rootRect.bottom };
  }

  const viewport = window.visualViewport;
  const height = viewport?.height ?? window.innerHeight;
  const offsetTop = viewport?.offsetTop ?? 0;

  return {
    top: offsetTop,
    bottom: offsetTop + height,
  };
}

function readScrollNearEnd(scrollRoot: HTMLElement | null): boolean {
  if (scrollRoot) {
    return isScrollNearEnd({
      scrollTop: scrollRoot.scrollTop,
      scrollHeight: scrollRoot.scrollHeight,
      clientHeight: scrollRoot.clientHeight,
    });
  }

  const scrolling = document.scrollingElement;

  if (!scrolling) {
    return false;
  }

  return isScrollNearEnd({
    scrollTop: scrolling.scrollTop,
    scrollHeight: scrolling.scrollHeight,
    clientHeight: scrolling.clientHeight,
  });
}
