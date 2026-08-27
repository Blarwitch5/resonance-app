"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";

import { ListeningWave } from "@/components/ui/listening-wave";
import { PULL_REFRESH_THRESHOLD, pullProgress, resistedPull, shouldReleaseRefresh } from "@/lib/motion/pull";

const DESKTOP_QUERY = "(min-width: 1024px)";

interface PullToRefreshProps {
  children: ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const isDesktop = useSyncExternalStore(subscribeDesktop, desktopSnapshot, serverSnapshot);
  const [distance, setDistance] = useState(0);
  const [isRefreshing, startTransition] = useTransition();
  const startY = useRef(0);
  const isPulling = useRef(false);
  const distanceRef = useRef(0);

  useEffect(() => {
    if (isDesktop) {
      return;
    }

    function onStart(event: TouchEvent) {
      if (isRefreshing) {
        return;
      }

      if (window.scrollY > 0) {
        return;
      }

      if (isBlockedTarget(event.target)) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      startY.current = touch.clientY;
      isPulling.current = true;
    }

    function onMove(event: TouchEvent) {
      if (!isPulling.current) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const delta = touch.clientY - startY.current;

      if (delta <= 8 || window.scrollY > 0) {
        if (distanceRef.current !== 0) {
          distanceRef.current = 0;
          setDistance(0);
        }

        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      distanceRef.current = delta;
      setDistance(delta);
    }

    function onEnd() {
      if (!isPulling.current) {
        return;
      }

      isPulling.current = false;
      const released = distanceRef.current;
      distanceRef.current = 0;
      setDistance(0);

      if (!shouldReleaseRefresh(released)) {
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    }

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [isDesktop, isRefreshing, router]);

  const offset = isRefreshing ? PULL_REFRESH_THRESHOLD : resistedPull(distance);
  const progress = isRefreshing ? 1 : pullProgress(distance);
  const isVisible = offset > 4 || isRefreshing;
  const label = isRefreshing
    ? "Listening again…"
    : progress >= 1
      ? "Release to listen again"
      : "Pull to listen again";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isDesktop && isVisible ? (
        <div
          className="flex items-end justify-center overflow-hidden"
          style={{ height: offset }}
          aria-hidden={!isRefreshing}
        >
          <ListeningWave label={label} progress={progress} isActive={isRefreshing} compact />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function subscribeDesktop(onChange: () => void): () => void {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function desktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function serverSnapshot(): boolean {
  return true;
}

function isBlockedTarget(target: EventTarget | null): boolean {
  if (document.querySelector("[aria-modal='true']")) {
    return true;
  }

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}
