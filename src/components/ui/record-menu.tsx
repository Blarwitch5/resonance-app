"use client";

import { Barcode, BookmarkPlus, BookOpen, DoorOpen, Ellipsis, FaceSlightlySmilingPlus, Hash, Heart, Library, ScanSearch, Share, type LucideIcon } from "lucide-react";
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
import { useLocale, useT } from "@/components/locale-provider";
import { pressingCopyVoice, type PressingCopyKind } from "@/lib/collection/copy-pressing";
import { LONG_PRESS_MS, pointerLeftPressZone, shouldArmLongPress } from "@/lib/collection/long-press";
import {
  clampMenuPosition,
  explorerMenuActions,
  recordMenuActions,
  recordMenuMoreClass,
  recordMenuReleaseConfirm,
  recordMenuReleasePrompt,
  recordSwipeActions,
  type RecordMenuActionId,
} from "@/lib/collection/record-menu";
import { browserShareHost, offerPressingShare } from "@/lib/collection/share-pressing";
import type { ShelfPresence } from "@/lib/collection/types";
import {
  clampSwipeOffset,
  shouldArmSwipe,
  snapSwipeOffset,
  SWIPE_ACTION_WIDTH,
  swipeAxis,
  swipeOffsetFromPointer,
  swipeRevealWidth,
  type SwipeAxis,
} from "@/lib/motion/swipe";

const DESKTOP_QUERY = "(min-width: 1024px)";
const CLOSE_EVENT = "resonance:close-record-menu";
const CLOSE_SWIPE_EVENT = "resonance:close-record-swipe";

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

function swipeActionClass(id: RecordMenuActionId): string {
  if (id === "release" || id === "confirm-release") {
    return "bg-error-soft text-error";
  }

  if (id === "keep" || id === "keep-shelf") {
    return "bg-primary-soft text-on-primary-soft";
  }

  return "bg-surface-elevated text-text";
}

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
  canSwipe?: boolean;
  layout?: "list" | "grid";
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
  canSwipe = false,
  layout = "grid",
  children,
}: RecordMenuProps) {
  const t = useT();
  const locale = useLocale();
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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const swipeSheetRef = useRef<HTMLDivElement>(null);
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);
  const swipeStartOffset = useRef(0);
  const swipeAxisRef = useRef<SwipeAxis>("undecided");
  const swipeOffsetRef = useRef(0);
  const ignoreSwipeClose = useRef(false);
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
        locale,
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
        locale,
      });
  const visibleActions = isConfirmingRelease ? recordMenuReleaseConfirm(locale) : actions;
  const swipeActions = recordSwipeActions(visibleActions);
  const reveal = swipeRevealWidth(swipeActions.length);
  const showSwipe = canSwipe && swipeActions.length > 0;
  const morePlacement = layout === "list" ? "row" : "cover";
  const revealRef = useRef(reveal);
  revealRef.current = reveal;

  const applySwipeOffset = useCallback((next: number) => {
    const offset = clampSwipeOffset(next, revealRef.current);
    swipeOffsetRef.current = offset;
    if (swipeSheetRef.current) {
      swipeSheetRef.current.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
  }, []);

  const restSwipe = useCallback(() => {
    applySwipeOffset(0);
    setSwipeOffset(0);
    setIsSwipeDragging(false);
    setIsConfirmingRelease(false);
  }, [applySwipeOffset]);

  const restSwipeRef = useRef(restSwipe);
  restSwipeRef.current = restSwipe;

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
    restSwipeRef.current();
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

  useEffect(() => {
    function onCloseOtherSwipes() {
      if (ignoreSwipeClose.current) {
        return;
      }

      restSwipeRef.current();
    }

    window.addEventListener(CLOSE_SWIPE_EVENT, onCloseOtherSwipes);
    return () => window.removeEventListener(CLOSE_SWIPE_EVENT, onCloseOtherSwipes);
  }, []);

  useLayoutEffect(() => {
    applySwipeOffset(swipeOffsetRef.current === 0 ? 0 : reveal);
    setSwipeOffset(swipeOffsetRef.current);
  }, [applySwipeOffset, reveal]);

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

  useEffect(() => {
    function onScroll() {
      restSwipeRef.current();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      restSwipeRef.current();
    }

    if (swipeOffset === 0 && !isSwipeDragging) {
      return;
    }

    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isSwipeDragging, swipeOffset]);

  function clearPress() {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = 0;
    }

    pressOrigin.current = null;
  }

  function openFromMore(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (anchor) {
      close();
      return;
    }

    const box = event.currentTarget.getBoundingClientRect();
    openAt(box.left, box.bottom);
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
    if (event.target instanceof Element && event.target.closest("[data-swipe-action]")) {
      return;
    }

    ignoreSwipeClose.current = true;
    window.dispatchEvent(new Event(CLOSE_SWIPE_EVENT));
    ignoreSwipeClose.current = false;

    if (showSwipe && shouldArmSwipe({ isDesktop: isDesktopViewport(), button: event.button })) {
      swipeOrigin.current = { x: event.clientX, y: event.clientY };
      swipeStartOffset.current = swipeOffsetRef.current;
      swipeAxisRef.current = "undecided";
    }

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

    if (origin && pressTimer.current !== 0 && pointerLeftPressZone(origin, { x: event.clientX, y: event.clientY })) {
      clearPress();
    }

    const swipeFrom = swipeOrigin.current;

    if (!swipeFrom || !showSwipe) {
      return;
    }

    const dx = event.clientX - swipeFrom.x;
    const dy = event.clientY - swipeFrom.y;

    if (swipeAxisRef.current === "undecided") {
      const axis = swipeAxis(dx, dy);

      if (axis === "undecided") {
        return;
      }

      if (axis === "vertical") {
        swipeOrigin.current = null;
        swipeAxisRef.current = "vertical";
        return;
      }

      swipeAxisRef.current = "horizontal";
      clearPress();
      close();
      suppressClick.current = true;
      setIsSwipeDragging(true);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort; the row still follows the finger.
      }
    }

    if (swipeAxisRef.current !== "horizontal") {
      return;
    }

    applySwipeOffset(swipeOffsetFromPointer(swipeFrom.x, event.clientX, swipeStartOffset.current, reveal));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    clearPress();

    const wasDragging = swipeAxisRef.current === "horizontal";
    const tappedClosed =
      !wasDragging &&
      swipeOffsetRef.current > 0 &&
      !(event.target instanceof Element && event.target.closest("[data-swipe-action]"));

    if (wasDragging || tappedClosed) {
      const snapped = tappedClosed
        ? 0
        : snapSwipeOffset(swipeOffsetRef.current, reveal, swipeStartOffset.current > 0);
      applySwipeOffset(snapped);
      setSwipeOffset(snapped);
      setIsSwipeDragging(false);
      suppressClick.current = true;

      if (snapped === 0) {
        setIsConfirmingRelease(false);
      }

      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // The capture may already have been released with the pointer.
      }
    }

    swipeOrigin.current = null;
    swipeAxisRef.current = "undecided";
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
    restSwipe();
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
      setNotice(t("share.error"));
    }
  }

  async function onCopy(kind: PressingCopyKind, value: string): Promise<void> {
    const failure = pressingCopyVoice(kind, value, false, locale).error;
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
      restSwipe();
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
      return t("menu.copiedLink");
    }

    const copyKind = COPY_KIND[id];

    if (copyKind && copiedKind === copyKind) {
      return pressingCopyVoice(copyKind, "", true, locale).ariaLabel;
    }

    return label;
  }

  const swipeFrame = showSwipe ? (
    <div className="relative overflow-hidden rounded-rs-md lg:overflow-visible">
      <div
        className="absolute inset-y-0 right-0 flex lg:hidden"
        role="group"
        aria-label={t("menu.actionsFor", { title })}
        inert={isSwipeDragging || swipeOffset === 0}
      >
        {isConfirmingRelease ? (
          <p role="status" className="sr-only">
            {recordMenuReleasePrompt(title, locale)}
          </p>
        ) : null}
        {swipeActions.map((action) => {
          const Icon = ACTION_ICONS[action.id];
          const formAttr = FORM_ACTIONS[action.id];
          const className = `flex h-full min-h-12 flex-col items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-strong ${swipeActionClass(action.id)}`;
          const style = { width: SWIPE_ACTION_WIDTH };

          if (action.id === "release" || action.id === "keep-shelf") {
            return (
              <button
                key={action.id}
                type="button"
                data-swipe-action=""
                aria-label={action.label}
                onClick={() => onAction(action.id)}
                className={className}
                style={style}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            );
          }

          if (formAttr) {
            return (
              <button
                key={action.id}
                type="button"
                data-swipe-action=""
                aria-label={action.label}
                onClick={() => submitNamedForm(formAttr)}
                className={className}
                style={style}
              >
                <Icon className={`size-4 ${action.id === "keep" && isFavorite ? "fill-current" : ""}`} aria-hidden />
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={actionHref(action.id)}
              data-swipe-action=""
              aria-label={action.label}
              onClick={() => {
                close();
                restSwipe();
              }}
              className={className}
              style={style}
            >
              <Icon className="size-4" aria-hidden />
            </Link>
          );
        })}
      </div>
      <div
        ref={swipeSheetRef}
        className={`relative bg-background ${isSwipeDragging ? "" : "transition-transform duration-200 ease-out"}`}
        style={{ transform: `translate3d(${-swipeOffset}px, 0, 0)` }}
      >
        {children}
      </div>
    </div>
  ) : (
    children
  );

  return (
    <div
      ref={wrapperRef}
      data-record-swipe={
        showSwipe ? (isSwipeDragging ? "dragging" : swipeOffset > 0 ? "open" : "rest") : undefined
      }
      className={`group relative touch-callout-none touch-manipulation select-none lg:select-text${
        layout === "list" ? " flex items-center gap-2" : ""
      }${showSwipe ? " touch-pan-y lg:touch-auto" : ""}`}
      onContextMenu={onContextMenu}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onKeyDown={onKeyDownCapture}
    >
      {layout === "list" ? <div className="min-w-0 flex-1">{swipeFrame}</div> : swipeFrame}
      {actions.length > 0 ? (
        <button
          type="button"
          className={recordMenuMoreClass(anchor !== null, morePlacement)}
          aria-haspopup="menu"
          aria-expanded={anchor !== null}
          aria-controls={anchor ? menuId : undefined}
          aria-label={t("menu.more", { title })}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={openFromMore}
        >
          <Ellipsis className="size-4" aria-hidden />
        </button>
      ) : null}
      {isClient && anchor
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={isConfirmingRelease ? t("menu.releaseFor", { title }) : t("menu.actionsFor", { title })}
              className="fixed z-50 min-w-56 rounded-rs-md border border-border bg-surface-elevated p-1"
              style={{ left: position.left, top: position.top }}
            >
              {isConfirmingRelease ? (
                <p role="status" className="px-3 py-2 text-sm leading-6 text-text-secondary">
                  {recordMenuReleasePrompt(title, locale)}
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
                      ? pressingCopyVoice(copyKind, action.value, copiedKind === copyKind, locale)
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
