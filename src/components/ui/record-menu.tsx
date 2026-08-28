"use client";

import { Barcode, BookmarkPlus, BookOpen, DoorOpen, FaceSlightlySmilingPlus, Hash, Heart, Library, ScanSearch, Share, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { Notice } from "@/components/ui/notice";
import { trapFocus } from "@/components/ui/trap-focus";
import { pressingCopyVoice, type PressingCopyKind } from "@/lib/collection/copy-pressing";
import { LONG_PRESS_MS, pointerLeftPressZone, shouldArmLongPress } from "@/lib/collection/long-press";
import {
  clampMenuPosition,
  explorerMenuActions,
  recordMenuActions,
  recordMenuReleaseConfirm,
  recordMenuReleasePrompt,
  type RecordMenuActionId,
} from "@/lib/collection/record-menu";
import { browserShareHost, offerPressingShare, SHARE_PRESSING_ERROR } from "@/lib/collection/share-pressing";
import type { ShelfPresence } from "@/lib/collection/types";

const DESKTOP_QUERY = "(min-width: 1024px)";
const CLOSE_EVENT = "resonance:close-record-menu";

const ACTION_ICONS: Record<RecordMenuActionId, LucideIcon> = {
  open: BookOpen,
  keep: Heart,
  elsewhere: ScanSearch,
  add: FaceSlightlySmilingPlus,
  hold: BookmarkPlus,
  shelf: Library,
  share: Share,
  "copy-barcode": Barcode,
  "copy-catalog": Hash,
  release: DoorOpen,
  "keep-shelf": Heart,
  "confirm-release": DoorOpen,
};

const FORM_ACTIONS: Partial<Record<RecordMenuActionId, string>> = {
  keep: "data-keep-close",
  hold: "data-hold-waiting",
  shelf: "data-move-shelf",
  "confirm-release": "data-release",
};

const COPY_KIND: Partial<Record<RecordMenuActionId, PressingCopyKind>> = {
  "copy-barcode": "barcode",
  "copy-catalog": "catalog",
};

function subscribeToClient(): () => void {
  return () => undefined;
}

function isDesktopViewport(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

interface RecordMenuProps {
  href: string;
  title: string;
  artist?: string;
  elsewhereHref?: string | null;
  shareHref?: string | null;
  barcode?: string | null;
  catalogNumber?: string | null;
  canKeepClose?: boolean;
  canRelease?: boolean;
  isFavorite?: boolean;
  presence?: ShelfPresence;
  addHref?: string | null;
  canHold?: boolean;
  children: ReactNode;
}

export function RecordMenu({
  href,
  title,
  artist = "",
  elsewhereHref = null,
  shareHref = null,
  barcode = null,
  catalogNumber = null,
  canKeepClose = false,
  canRelease = false,
  isFavorite = false,
  presence,
  addHref = null,
  canHold = false,
  children,
}: RecordMenuProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const ignoreClose = useRef(false);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const pressTimer = useRef(0);
  const suppressClick = useRef(false);
  const menuId = useId();
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [copiedKind, setCopiedKind] = useState<"share" | PressingCopyKind | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isConfirmingRelease, setIsConfirmingRelease] = useState(false);
  const actions = presence
    ? explorerMenuActions({
        title,
        presence,
        addHref,
        canHold,
        shareHref,
        elsewhereHref,
        barcode,
        catalogNumber,
      })
    : recordMenuActions({
        title,
        isFavorite,
        canKeepClose,
        shareHref,
        elsewhereHref,
        barcode,
        catalogNumber,
        canRelease,
      });
  const visibleActions = isConfirmingRelease ? recordMenuReleaseConfirm() : actions;

  const close = useCallback(() => {
    setAnchor(null);
    setIsConfirmingRelease(false);
  }, []);

  const openAt = useCallback((x: number, y: number) => {
    ignoreClose.current = true;
    window.dispatchEvent(new Event(CLOSE_EVENT));
    ignoreClose.current = false;
    setCopiedKind(null);
    setNotice(null);
    setIsConfirmingRelease(false);
    setAnchor({ x, y });
    setPosition({ left: x, top: y });
  }, []);

  useEffect(() => {
    if (!copiedKind) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedKind(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedKind]);

  useEffect(() => {
    function onCloseOthers() {
      if (ignoreClose.current) {
        return;
      }

      close();
    }

    window.addEventListener(CLOSE_EVENT, onCloseOthers);
    return () => window.removeEventListener(CLOSE_EVENT, onCloseOthers);
  }, [close]);

  useLayoutEffect(() => {
    if (!anchor || !menuRef.current) {
      return;
    }

    const box = menuRef.current.getBoundingClientRect();
    setPosition(
      clampMenuPosition(anchor.x, anchor.y, { width: box.width, height: box.height }, {
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    );
  }, [anchor, isConfirmingRelease]);

  useEffect(() => {
    if (!anchor) {
      return;
    }

    const first = menuRef.current?.querySelector<HTMLElement>("[role=menuitem]");
    first?.focus();

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      close();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();

        if (isConfirmingRelease) {
          setIsConfirmingRelease(false);
          return;
        }

        close();
        return;
      }

      if (event.key === "Tab" && menuRef.current) {
        trapFocus(menuRef.current, event);
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        const items = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
        const current = items.findIndex((item) => item === document.activeElement);
        const fallback = event.key === "ArrowDown" ? 0 : items.length - 1;
        const nextIndex =
          current === -1 ? fallback : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items[nextIndex]?.focus();
      }
    }

    function onScroll() {
      close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchor, close, isConfirmingRelease]);

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        window.clearTimeout(pressTimer.current);
      }
    };
  }, []);

  function clearPress() {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = 0;
    }

    pressOrigin.current = null;
  }

  function onContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
    if (actions.length === 0) {
      return;
    }

    event.preventDefault();

    if (!isDesktopViewport()) {
      suppressClick.current = true;
    }

    openAt(event.clientX, event.clientY);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!shouldArmLongPress({ isDesktop: isDesktopViewport(), button: event.button }) || actions.length === 0) {
      return;
    }

    pressOrigin.current = { x: event.clientX, y: event.clientY };
    pressTimer.current = window.setTimeout(() => {
      const origin = pressOrigin.current;
      pressTimer.current = 0;

      if (!origin) {
        return;
      }

      suppressClick.current = true;
      openAt(origin.x, origin.y);
    }, LONG_PRESS_MS);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = pressOrigin.current;

    if (!origin || pressTimer.current === 0) {
      return;
    }

    if (pointerLeftPressZone(origin, { x: event.clientX, y: event.clientY })) {
      clearPress();
    }
  }

  function onPointerUp() {
    clearPress();
  }

  function onClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClick.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }

  function onKeyDownCapture(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (actions.length === 0) {
      return;
    }

    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) {
      return;
    }

    event.preventDefault();
    const box = wrapperRef.current?.getBoundingClientRect();
    openAt(box?.left ?? 0, box?.bottom ?? 0);
  }

  function submitNamedForm(attr: string) {
    const form = wrapperRef.current?.querySelector(`form[${attr}]`);

    if (form instanceof HTMLFormElement) {
      form.requestSubmit();
    }

    close();
  }

  async function onShare(): Promise<void> {
    if (!shareHref) {
      return;
    }

    setNotice(null);

    try {
      const outcome = await offerPressingShare({ href: shareHref, title, artist }, browserShareHost());

      if (outcome === "copied") {
        setCopiedKind("share");
        return;
      }

      if (outcome === "shared") {
        close();
      }
    } catch {
      setNotice(SHARE_PRESSING_ERROR);
    }
  }

  async function onCopy(kind: PressingCopyKind, value: string): Promise<void> {
    const failure = pressingCopyVoice(kind, value, false).error;
    setNotice(null);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable.");
      }

      await navigator.clipboard.writeText(value);
      setCopiedKind(kind);
    } catch {
      setNotice(failure);
    }
  }

  function onAction(id: RecordMenuActionId, value?: string): void {
    if (id === "release") {
      setIsConfirmingRelease(true);
      return;
    }

    if (id === "keep-shelf") {
      setIsConfirmingRelease(false);
      return;
    }

    const copyKind = COPY_KIND[id];

    if (copyKind && value) {
      void onCopy(copyKind, value);
    }
  }

  function actionHref(id: RecordMenuActionId): string {
    if (id === "add") {
      return addHref ?? href;
    }

    if (id === "open") {
      return href;
    }

    return elsewhereHref ?? href;
  }

  function actionLabel(id: RecordMenuActionId, label: string): string {
    if (id === "share" && copiedKind === "share") {
      return "Link copied";
    }

    const copyKind = COPY_KIND[id];

    if (copyKind && copiedKind === copyKind) {
      return pressingCopyVoice(copyKind, "", true).ariaLabel;
    }

    return label;
  }

  return (
    <div
      ref={wrapperRef}
      className="touch-callout-none touch-manipulation select-none lg:select-text"
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDownCapture}
    >
      {children}
      {isClient && anchor
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={isConfirmingRelease ? `Release ${title}` : `Actions for ${title}`}
              className="fixed z-50 min-w-56 rounded-rs-md border border-border bg-surface-elevated p-1"
              style={{ left: position.left, top: position.top }}
            >
              {isConfirmingRelease ? (
                <p role="status" className="px-3 py-2 text-sm leading-6 text-text-secondary">
                  {recordMenuReleasePrompt(title)}
                </p>
              ) : null}
              {visibleActions.map((action) => {
                const Icon = ACTION_ICONS[action.id];
                const formAttr = FORM_ACTIONS[action.id];
                const itemClass =
                  "flex min-h-11 w-full items-center gap-2 rounded-rs-sm px-3 text-left text-sm font-medium text-text outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong";

                if (action.id === "share") {
                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        void onShare();
                      }}
                      className={itemClass}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {actionLabel(action.id, action.label)}
                    </button>
                  );
                }

                if (action.id === "release" || action.id === "keep-shelf" || COPY_KIND[action.id]) {
                  const copyKind = COPY_KIND[action.id];
                  const copyVoice =
                    copyKind && action.value
                      ? pressingCopyVoice(copyKind, action.value, copiedKind === copyKind)
                      : null;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      aria-label={copyVoice?.ariaLabel}
                      onClick={() => onAction(action.id, action.value)}
                      className={itemClass}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {actionLabel(action.id, action.label)}
                    </button>
                  );
                }

                if (formAttr) {
                  return (
                    <button
                      key={action.id}
                      type="button"
                      role="menuitem"
                      onClick={() => submitNamedForm(formAttr)}
                      className={itemClass}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${action.id === "keep" && isFavorite ? "fill-current" : ""}`}
                        aria-hidden
                      />
                      {action.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={action.id}
                    href={actionHref(action.id)}
                    role="menuitem"
                    className={itemClass}
                    onClick={close}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {action.label}
                  </Link>
                );
              })}
              {notice ? (
                <div className="px-3 py-2">
                  <Notice tone="error">{notice}</Notice>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
