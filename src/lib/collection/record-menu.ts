import type { MediaFormat, ShelfPresence } from "@/lib/collection/types";
import { explorerQueryFromPressing, explorerSearchHref } from "@/lib/discogs/href";

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
}): RecordMenuAction[] {
  const actions: RecordMenuAction[] = [
    { id: "open", label: `Open ${input.title} in your journal` },
  ];

  if (input.canKeepClose) {
    actions.push({
      id: "keep",
      label: input.isFavorite ? "Stop keeping this close" : "Keep this close",
    });
  }

  appendCopyActions(actions, input.barcode, input.catalogNumber);
  appendTravelActions(actions, input.title, input.shareHref, input.elsewhereHref);

  if (input.canRelease) {
    actions.push({
      id: "release",
      label: "Let this one go",
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
}): RecordMenuAction[] {
  const actions: RecordMenuAction[] = [];

  if (input.presence.status === "absent") {
    if (input.addHref) {
      actions.push({
        id: "add",
        label: `Add ${input.title} to your resonance`,
      });
    }

    if (input.canHold) {
      actions.push({
        id: "hold",
        label: `Keep ${input.title} waiting`,
      });
    }
  } else {
    actions.push({
      id: "open",
      label: `Open ${input.title} in your journal`,
    });

    if (input.presence.status === "wishlist") {
      actions.push({
        id: "shelf",
        label: `Move ${input.title} to your shelf`,
      });
    }
  }

  appendCopyActions(actions, input.barcode, input.catalogNumber);
  appendTravelActions(actions, input.title, input.shareHref, input.elsewhereHref);
  return actions;
}

export function recordMenuReleasePrompt(title: string): string {
  return `${title} will leave your shelf. The memory goes with it.`;
}

export function recordMenuReleaseConfirm(): RecordMenuAction[] {
  return [
    { id: "keep-shelf", label: "Keep it" },
    { id: "confirm-release", label: "Release" },
  ];
}

function appendCopyActions(
  actions: RecordMenuAction[],
  barcode?: string | null,
  catalogNumber?: string | null,
): void {
  const catalog = copyValue(catalogNumber);
  const code = copyValue(barcode);

  if (catalog) {
    actions.push({
      id: "copy-catalog",
      label: "Copy catalog",
      value: catalog,
    });
  }

  if (code) {
    actions.push({
      id: "copy-barcode",
      label: "Copy barcode",
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
  title: string,
  shareHref?: string | null,
  elsewhereHref?: string | null,
): void {
  if (shareHref) {
    actions.push({
      id: "share",
      label: `Share ${title}`,
    });
  }

  if (elsewhereHref) {
    actions.push({
      id: "elsewhere",
      label: `Hear other pressings of ${title}`,
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
