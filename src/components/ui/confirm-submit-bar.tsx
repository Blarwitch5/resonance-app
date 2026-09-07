"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  confirmSubmitDockClass,
  confirmSubmitFixedClass,
  confirmSubmitGlowClass,
  confirmSubmitSlotClass,
} from "@/lib/collection/layout";

interface ConfirmSubmitBarProps {
  children: ReactNode;
}

/** Keeps the confirm CTA on screen, then docks it when its natural slot reaches the thumb. */
export function ConfirmSubmitBar({ children }: ConfirmSubmitBarProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;

    if (!slot) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDocked(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.55,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(slot);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={slotRef}>
      <div className={isDocked ? confirmSubmitDockClass : confirmSubmitFixedClass}>
        <div className={`rounded-full ${confirmSubmitGlowClass}`}>{children}</div>
      </div>
      {isDocked ? null : <div className={confirmSubmitSlotClass} aria-hidden />}
    </div>
  );
}
