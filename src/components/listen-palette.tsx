"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { emptyStoredReturns, listReturnFromLocation, readStoredReturns } from "@/components/return-path";
import { useLocale, useT } from "@/components/locale-provider";
import { focusListenField } from "@/components/ui/focus-listen";
import { FOCUS_SEARCH_KEY, focusSearchField } from "@/components/ui/focus-search";
import { trapFocus } from "@/components/ui/trap-focus";
import {
  KEYS_HELP_EVENT,
  PALETTE_QUERY_MAX,
  paletteGoHref,
  paletteRows,
  type PaletteCommand,
  type PaletteNavContext,
  type PaletteRecord,
} from "@/lib/collection/palette";
import type { MediaFormat } from "@/lib/collection/types";

const DESKTOP_QUERY = "(min-width: 1024px)";

function isDesktopViewport(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function subscribeToClient(): () => void {
  return () => undefined;
}

interface ListenPaletteProps {
  records?: PaletteRecord[];
  formats?: MediaFormat[];
}

export function ListenPalette({ records = [], formats = [] }: ListenPaletteProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = listReturnFromLocation(pathname, searchParams.toString());
  const titleId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const nav: PaletteNavContext = {
    location: { pathname, search: searchParams.toString() },
    stored: isClient ? readStoredReturns() : emptyStoredReturns(),
  };
  const rows = paletteRows(query, records, formats, from, nav, locale);
  const safeIndex = rows.length === 0 ? 0 : Math.min(activeIndex, rows.length - 1);
  const active = rows[safeIndex];

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const goTo = useCallback(
    async (href: string) => {
      close();

      try {
        await router.push(href);
      } catch {
        // Navigation was cancelled — stay on the current page.
      }
    },
    [close, router],
  );

  const focusSearch = useCallback(() => {
    close();

    window.requestAnimationFrame(() => {
      if (focusSearchField()) {
        return;
      }

      try {
        sessionStorage.setItem(FOCUS_SEARCH_KEY, "1");
      } catch {
        // Private mode can refuse storage — still try to open Collection.
      }

      void router.push(paletteGoHref("c", [], nav) ?? "/collection");
    });
  }, [close, nav, router]);

  const run = useCallback(
    (command: PaletteCommand | undefined) => {
      if (!command) {
        return;
      }

      if (command.href) {
        void goTo(command.href);
        return;
      }

      if (command.action === "focus-search") {
        focusSearch();
        return;
      }

      if (command.action === "focus-listen") {
        close();
        window.requestAnimationFrame(() => {
          focusListenField();
        });
        return;
      }

      if (command.action === "keys") {
        close();
        window.dispatchEvent(new Event(KEYS_HELP_EVENT));
      }
    },
    [close, focusSearch, goTo],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!isDesktopViewport()) {
        return;
      }

      const hasModifier = event.metaKey || event.ctrlKey;

      if (hasModifier && event.key.toLowerCase() === "k" && !event.altKey && !event.shiftKey) {
        event.preventDefault();

        if (isOpen) {
          close();
          return;
        }

        setIsOpen(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close, isOpen]);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);

    function onChange() {
      if (!media.matches) {
        close();
      }
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [close]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, pathname]);

  if (!isClient || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-overlay"
        aria-label={t("palette.dismiss")}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col rounded-rs-lg bg-surface-elevated p-4"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
          }

          if (event.key === "Tab") {
            trapFocus(panelRef.current ?? event.currentTarget, event.nativeEvent);
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % Math.max(rows.length, 1));
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + Math.max(rows.length, 1)) % Math.max(rows.length, 1));
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            run(active);
          }
        }}
      >
        <h2 id={titleId} className="sr-only">
          {t("palette.jump")}
        </h2>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
          <input
            ref={inputRef}
            id={`${listId}-q`}
            type="search"
            value={query}
            maxLength={PALETTE_QUERY_MAX}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("palette.placeholder")}
            aria-label={t("palette.jump")}
            aria-controls={listId}
            aria-expanded
            aria-autocomplete="list"
            aria-activedescendant={active ? `${listId}-${active.id}` : undefined}
            role="combobox"
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-12 w-full rounded-rs-sm border border-border bg-surface py-3 pr-4 pl-10 text-base font-normal text-text outline-none ring-border-strong focus:ring-2"
          />
        </div>
        <ul id={listId} role="listbox" aria-label={t("palette.quietPaths")} className="mt-3 max-h-80 overflow-y-auto">
          {rows.map((command, index) => {
            const isActive = index === safeIndex;

            return (
              <li key={command.id} role="presentation">
                <button
                  type="button"
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => run(command)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-rs-sm px-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-border-strong ${
                    isActive
                      ? "bg-primary-soft text-on-primary-soft"
                      : "text-text hover:bg-surface-pressed"
                  }`}
                >
                  <span className="min-w-0 truncate">{command.label}</span>
                  {command.hint ? (
                    <kbd className="hidden shrink-0 rounded-rs-sm border border-border bg-surface px-2 py-0.5 font-mono text-xs text-text-secondary sm:inline">
                      {command.hint}
                    </kbd>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
