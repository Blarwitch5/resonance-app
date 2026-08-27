"use client";

import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { detailBackHref, readStoredReturns } from "@/components/return-path";
import { focusListenField } from "@/components/ui/focus-listen";
import { FOCUS_SEARCH_KEY, focusSearchField } from "@/components/ui/focus-search";
import { trapFocus } from "@/components/ui/trap-focus";
import { KEYS_HELP_EVENT, paletteGoHref, type PaletteNavContext } from "@/lib/collection/palette";
import type { MediaFormat } from "@/lib/collection/types";

const DESKTOP_QUERY = "(min-width: 1024px)";
const GO_CHORD_MS = 800;

function isDesktopViewport(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (target instanceof HTMLInputElement) {
    const type = target.type;
    return type !== "button" && type !== "submit" && type !== "checkbox" && type !== "radio" && type !== "file";
  }

  return false;
}

function listRecordLinks(): HTMLAnchorElement[] {
  return [...document.querySelectorAll<HTMLAnchorElement>("main a[data-record-link]")].filter(
    (link) => link.getClientRects().length > 0,
  );
}

function moveThroughShelf(delta: number): void {
  const links = listRecordLinks();

  if (links.length === 0) {
    return;
  }

  const active = document.activeElement;
  const currentIndex = links.findIndex((link) => link === active || link.contains(active));
  const fallback = delta > 0 ? 0 : links.length - 1;
  const nextIndex =
    currentIndex === -1 ? fallback : (currentIndex + delta + links.length) % links.length;

  links[nextIndex]?.focus();
}

function submitKeepClose(form: Element): HTMLButtonElement | null {
  const button = form.querySelector("button[type=submit]");

  if (!(button instanceof HTMLButtonElement) || button.disabled) {
    return null;
  }

  return button;
}

function keepCloseButtonNear(node: Element | null): HTMLButtonElement | null {
  if (!node) {
    return null;
  }

  const inForm = node.closest("form[data-keep-close]");

  if (inForm) {
    return submitKeepClose(inForm);
  }

  const row = node.closest("li");
  const inRow = row?.querySelector("form[data-keep-close]");

  if (inRow) {
    return submitKeepClose(inRow);
  }

  return null;
}

function toggleKeepClose(event: KeyboardEvent): void {
  const active = document.activeElement;
  const scoped = keepCloseButtonNear(active instanceof Element ? active : null);

  if (scoped) {
    event.preventDefault();
    scoped.click();
    return;
  }

  if (active instanceof HTMLElement && active.closest("a[data-record-link]")) {
    return;
  }

  const forms = document.querySelectorAll("main form[data-keep-close]");

  if (forms.length !== 1) {
    return;
  }

  const only = forms[0];

  if (!only) {
    return;
  }

  const button = submitKeepClose(only);

  if (!button) {
    return;
  }

  event.preventDefault();
  button.click();
}

function followShelfNeighbor(direction: "before" | "after", event: KeyboardEvent): void {
  const neighbor = document.querySelector<HTMLAnchorElement>(`a[data-shelf-neighbor="${direction}"]`);

  if (!neighbor) {
    return;
  }

  event.preventDefault();
  neighbor.click();
}

function modifierSearchLabel(): string {
  const platform = navigator.platform || navigator.userAgent;
  return /Mac|iPhone|iPad/i.test(platform) ? "⌘K" : "Ctrl+K";
}

function subscribeToClient(): () => void {
  return () => undefined;
}

function clientSnapshot(): boolean {
  return true;
}

function serverSnapshot(): boolean {
  return false;
}

interface KeyboardShortcutsProps {
  formats?: MediaFormat[];
}

export function KeyboardShortcuts({ formats = [] }: KeyboardShortcutsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const goArmedRef = useRef(false);
  const goTimerRef = useRef<number | undefined>(undefined);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const isClient = useSyncExternalStore(subscribeToClient, clientSnapshot, serverSnapshot);

  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const clearGoChord = useCallback(() => {
    goArmedRef.current = false;

    if (goTimerRef.current !== undefined) {
      window.clearTimeout(goTimerRef.current);
      goTimerRef.current = undefined;
    }
  }, []);

  const armGoChord = useCallback(() => {
    goArmedRef.current = true;

    if (goTimerRef.current !== undefined) {
      window.clearTimeout(goTimerRef.current);
    }

    goTimerRef.current = window.setTimeout(() => {
      goArmedRef.current = false;
      goTimerRef.current = undefined;
    }, GO_CHORD_MS);
  }, []);

  const goTo = useCallback(
    async (href: string) => {
      try {
        await router.push(href);
      } catch {
        // Navigation was cancelled — stay on the current page.
      }
    },
    [router],
  );

  const paletteNav = useCallback((): PaletteNavContext => {
    return {
      location: { pathname, search: window.location.search },
      stored: readStoredReturns(),
    };
  }, [pathname]);

  const focusSearch = useCallback(() => {
    if (focusSearchField()) {
      return;
    }

    try {
      sessionStorage.setItem(FOCUS_SEARCH_KEY, "1");
    } catch {
      // Private mode can refuse storage — still try to open Collection.
    }

    void goTo(paletteGoHref("c", [], paletteNav()) ?? "/collection");
  }, [goTo, paletteNav]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(FOCUS_SEARCH_KEY) !== "1") {
        return;
      }

      sessionStorage.removeItem(FOCUS_SEARCH_KEY);
    } catch {
      return;
    }

    let timeoutId: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (focusSearchField()) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        focusSearchField();
      }, 120);
    });

    return () => {
      window.cancelAnimationFrame(frame);

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    function onOpenKeys() {
      setIsHelpOpen(true);
    }

    window.addEventListener(KEYS_HELP_EVENT, onOpenKeys);
    return () => window.removeEventListener(KEYS_HELP_EVENT, onOpenKeys);
  }, []);

  useEffect(() => {
    if (!isHelpOpen) {
      return;
    }

    clearGoChord();
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [clearGoChord, isHelpOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!isDesktopViewport()) {
        return;
      }

      if (isHelpOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeHelp();
          return;
        }

        if (event.key === "Tab" && dialogRef.current) {
          trapFocus(dialogRef.current, event);
        }

        return;
      }

      if (document.querySelector("[aria-modal='true']")) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        clearGoChord();
        return;
      }

      if (event.key === "Escape") {
        clearGoChord();
        const href = detailBackHref(pathname, window.location.search);

        if (!href) {
          return;
        }

        event.preventDefault();
        void goTo(href);
        return;
      }

      if (goArmedRef.current) {
        const href = paletteGoHref(event.key.toLowerCase(), formats, paletteNav());
        clearGoChord();

        if (href) {
          event.preventDefault();
          void goTo(href);
          return;
        }
      }

      if (event.key === "?") {
        event.preventDefault();
        setIsHelpOpen(true);
        return;
      }

      if (event.key === "/") {
        event.preventDefault();
        clearGoChord();
        focusSearch();
        return;
      }

      if (event.key === "l" || event.key === "L") {
        event.preventDefault();
        clearGoChord();
        focusListenField();
        return;
      }

      if (event.key === "g" || event.key === "G") {
        event.preventDefault();
        armGoChord();
        return;
      }

      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        void goTo(paletteGoHref("e", formats, paletteNav()) ?? "/explorer");
        return;
      }

      if (event.key === "f" || event.key === "F") {
        toggleKeepClose(event);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        moveThroughShelf(1);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        moveThroughShelf(-1);
        return;
      }

      if (event.key === "ArrowLeft") {
        followShelfNeighbor("before", event);
        return;
      }

      if (event.key === "ArrowRight") {
        followShelfNeighbor("after", event);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearGoChord();
    };
  }, [armGoChord, clearGoChord, closeHelp, focusSearch, formats, goTo, isHelpOpen, paletteNav, pathname]);

  if (!isClient || !isHelpOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close keys"
        onClick={closeHelp}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-sm rounded-rs-lg bg-surface-elevated p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold text-text">
              Keys
            </h2>
            <p className="text-sm leading-6 text-text-secondary">Quiet paths through the shelf.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeHelp}
            aria-label="Close"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          <ShortcutRow keys={modifierSearchLabel()} action="Jump" />
          <ShortcutRow keys="/" action="Search" />
          <ShortcutRow keys="l" action="Shape this listen" />
          <ShortcutRow keys="g c" action="Collection" />
          {formats.length > 1 && formats.includes("vinyl") ? (
            <ShortcutRow keys="g v" action="Vinyl" />
          ) : null}
          {formats.length > 1 && formats.includes("cassette") ? (
            <ShortcutRow keys="g a" action="Cassette" />
          ) : null}
          {formats.length > 1 && formats.includes("cd") ? (
            <ShortcutRow keys="g d" action="CD" />
          ) : null}
          <ShortcutRow keys="g t" action="Tonight" />
          <ShortcutRow keys="g e" action="Explorer" />
          <ShortcutRow keys="g p" action="Profile" />
          <ShortcutRow keys="g k" action="Kept close" />
          <ShortcutRow keys="g w" action="Waiting" />
          <ShortcutRow keys="g s" action="Settings" />
          <ShortcutRow keys="Space" action="Hear a sample" />
          <ShortcutRow keys="n" action="Add a record" />
          <ShortcutRow keys="f" action="Keep this close" />
          <ShortcutRow keys="↑ ↓ ← →" action="Through the shelf" />
          <ShortcutRow keys="?" action="These keys" />
          <ShortcutRow keys="Esc" action="Close or back" />
        </ul>
      </div>
    </div>,
    document.body,
  );
}

function ShortcutRow({ keys, action }: { keys: string; action: string }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-sm text-text">{action}</span>
      <kbd className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-rs-sm border border-border bg-surface px-2 font-mono text-xs text-text">
        {keys}
      </kbd>
    </li>
  );
}
