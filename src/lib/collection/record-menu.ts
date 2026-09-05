import type { MediaFormat, ShelfPresence } from "@/lib/collection/types";
import { explorerQueryFromPressing, explorerSearchHref } from "@/lib/discogs/href";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export type RecordMenuActionId =
  | "open"
  | "keep"
  | "elsewhere"
  | "add"
  | "hold"
  | "shelf"
  | "share"
  | "copy-barcode"
  | "copy-catalog"
  | "release"
  | "keep-shelf"
  | "confirm-release";

export interface RecordMenuAction {
  id: RecordMenuActionId;
  label: string;
  value?: string;
}

export function recordMenuActions(input: {
  title: string;
  isFavorite: boolean;
  canKeepClose?: boolean;
  shareHref?: string | null;
  elsewhereHref?: string | null;
  barcode?: string | null;
  catalogNumber?: string | null;
  canRelease?: boolean;
  locale?: Locale;
}): RecordMenuAction[] {
  const locale = input.locale ?? "en";
  const actions: RecordMenuAction[] = [
    { id: "open", label: t(locale, "menu.open") },
  ];

  if (input.canKeepClose) {
    actions.push({
      id: "keep",
      label: input.isFavorite ? t(locale, "menu.stopKeep") : t(locale, "menu.keep"),
    });
  }

  appendCopyActions(actions, locale, input.barcode, input.catalogNumber);
  appendTravelActions(actions, locale, input.shareHref, input.elsewhereHref);

  if (input.canRelease) {
    actions.push({
      id: "release",
      label: t(locale, "menu.letGo"),
    });
  }

  return actions;
}

export function explorerMenuActions(input: {
  title: string;
  presence: ShelfPresence;
  addHref?: string | null;
  canHold?: boolean;
  shareHref?: string | null;
  elsewhereHref?: string | null;
  barcode?: string | null;
  catalogNumber?: string | null;
  locale?: Locale;
}): RecordMenuAction[] {
  const locale = input.locale ?? "en";
  const actions: RecordMenuAction[] = [];

  if (input.presence.status === "absent") {
    if (input.addHref) {
      actions.push({
        id: "add",
        label: t(locale, "menu.add"),
      });
    }

    if (input.canHold) {
      actions.push({
        id: "hold",
        label: t(locale, "menu.hold"),
      });
    }
  } else {
    actions.push({
      id: "open",
      label: t(locale, "menu.open"),
    });

    if (input.presence.status === "wishlist") {
      actions.push({
        id: "shelf",
        label: t(locale, "menu.shelf"),
      });
    }
  }

  appendCopyActions(actions, locale, input.barcode, input.catalogNumber);
  appendTravelActions(actions, locale, input.shareHref, input.elsewhereHref);
  return actions;
}

export function recordMenuReleasePrompt(title: string, locale: Locale = "en"): string {
  return t(locale, "journal.leaveShelf", { title });
}

export function recordMenuReleaseConfirm(locale: Locale = "en"): RecordMenuAction[] {
  return [
    { id: "keep-shelf", label: t(locale, "menu.keepIt") },
    { id: "confirm-release", label: t(locale, "menu.release") },
  ];
}

function appendCopyActions(
  actions: RecordMenuAction[],
  locale: Locale,
  barcode?: string | null,
  catalogNumber?: string | null,
): void {
  const catalog = copyValue(catalogNumber);
  const code = copyValue(barcode);

  if (catalog) {
    actions.push({
      id: "copy-catalog",
      label: t(locale, "menu.copyCatalog"),
      value: catalog,
    });
  }

  if (code) {
    actions.push({
      id: "copy-barcode",
      label: t(locale, "menu.copyBarcode"),
      value: code,
    });
  }
}

function copyValue(value: string | null | undefined): string | undefined {
  const next = value?.trim() ?? "";
  return next.length > 0 ? next : undefined;
}

function appendTravelActions(
  actions: RecordMenuAction[],
  locale: Locale,
  shareHref?: string | null,
  elsewhereHref?: string | null,
): void {
  if (shareHref) {
    actions.push({
      id: "share",
      label: t(locale, "menu.share"),
    });
  }

  if (elsewhereHref) {
    actions.push({
      id: "elsewhere",
      label: t(locale, "menu.elsewhere"),
    });
  }
}

export function recordMenuElsewhereHref(
  artist: string,
  title: string,
  format?: MediaFormat,
  currentQuery?: string,
): string | null {
  const query = explorerQueryFromPressing(artist, title);

  if (query.length === 0) {
    return null;
  }

  if (currentQuery && currentQuery.trim().toLowerCase() === query.toLowerCase()) {
    return null;
  }

  return explorerSearchHref({ query, format });
}

const RECORD_SWIPE_ACTION_IDS: ReadonlySet<RecordMenuActionId> = new Set([
  "keep",
  "add",
  "hold",
  "shelf",
  "share",
  "elsewhere",
  "release",
  "keep-shelf",
  "confirm-release",
]);

export function recordSwipeActions(actions: readonly RecordMenuAction[]): RecordMenuAction[] {
  return actions.filter((action) => RECORD_SWIPE_ACTION_IDS.has(action.id));
}

const SWIPE_TONE_STEPS = [
  "bg-swipe text-on-primary",
  "bg-swipe-dim text-on-primary",
  "bg-swipe-deep text-on-secondary",
  "bg-swipe-dark text-on-secondary",
] as const;

function isSwipeRelease(id: RecordMenuActionId): boolean {
  return id === "release" || id === "confirm-release";
}

export function recordSwipeToneCount(actions: readonly RecordMenuAction[]): number {
  return actions.filter((action) => !isSwipeRelease(action.id)).length;
}

export function recordSwipeActionClass(
  id: RecordMenuActionId,
  index = 0,
  toneCount: number = SWIPE_TONE_STEPS.length,
): string {
  if (isSwipeRelease(id)) {
    return "bg-error text-on-error";
  }

  if (toneCount <= 1) {
    return SWIPE_TONE_STEPS[0];
  }

  const last = SWIPE_TONE_STEPS.length - 1;
  const step = Math.min(Math.max(Math.round((index / (toneCount - 1)) * last), 0), last);
  return SWIPE_TONE_STEPS[step] ?? SWIPE_TONE_STEPS[0];
}

export function recordMenuMoreClass(isOpen: boolean, placement: "cover" | "row" = "cover"): string {
  const base =
    "z-20 hidden size-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-text outline-none lg:flex hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong";

  if (placement === "row") {
    return `relative shrink-0 ${base}`;
  }

  const cover = `absolute top-2 left-2 ${base}`;

  if (isOpen) {
    return cover;
  }

  return `${cover} lg:pointer-events-none lg:opacity-0 motion-safe:lg:transition-opacity lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100`;
}

const MENU_EDGE = 8;

export function clampMenuPosition(
  x: number,
  y: number,
  menu: { width: number; height: number },
  viewport: { width: number; height: number },
): { left: number; top: number } {
  const maxLeft = Math.max(MENU_EDGE, viewport.width - menu.width - MENU_EDGE);
  const maxTop = Math.max(MENU_EDGE, viewport.height - menu.height - MENU_EDGE);

  return {
    left: Math.min(Math.max(x, MENU_EDGE), maxLeft),
    top: Math.min(Math.max(y, MENU_EDGE), maxTop),
  };
}
