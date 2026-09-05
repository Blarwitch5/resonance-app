"use client";

import { PenLine, ScanBarcode, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { useBarcodeScan } from "@/app/explorer/barcode-scanner";
import { useT } from "@/components/locale-provider";
import { FormatPlusIcon } from "@/components/ui/format-plus-icon";
import { addPressingFormatGlyph, shouldShowAddPressing } from "@/lib/collection/add-pressing";
import type { MediaFormat } from "@/lib/collection/types";

interface AddPressingFabProps {
  isSignedIn: boolean;
  defaultFormat?: MediaFormat | null;
}

const fabClass =
  "group flex size-14 items-center justify-center rounded-full bg-primary text-on-primary outline-none standalone:size-12 hover:bg-primary-hover active:bg-primary-active focus-visible:ring-2 focus-visible:ring-border-strong";

const satelliteClass =
  "flex size-12 items-center justify-center rounded-full border border-border bg-surface-elevated text-text outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong";

export function AddPressingFab({ isSignedIn, defaultFormat = null }: AddPressingFabProps) {
  const t = useT();
  const pathname = usePathname();
  const openScan = useBarcodeScan();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const isVisible = shouldShowAddPressing(pathname, isSignedIn);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-[calc(var(--rs-bottom-chrome)+max(0.75rem,env(safe-area-inset-bottom)))] z-30 flex flex-col items-end gap-3 lg:right-6 lg:bottom-6"
    >
      {isOpen ? (
        <div id={menuId} className="flex flex-col items-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2"
            aria-label={t("explorer.scanAria")}
            onClick={() => {
              setIsOpen(false);
              openScan();
            }}
          >
            <span className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-text">
              {t("explorer.scan")}
            </span>
            <span className={satelliteClass} aria-hidden>
              <ScanBarcode className="size-5" />
            </span>
          </button>
          <Link href="/explorer/manual" className="flex items-center gap-2" aria-label={t("explorer.writeIn")}>
            <span className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-text">
              {t("explorer.writeIn")}
            </span>
            <span className={satelliteClass} aria-hidden>
              <PenLine className="size-5" />
            </span>
          </Link>
        </div>
      ) : null}
      <button
        type="button"
        className={fabClass}
        aria-label={isOpen ? t("common.close") : t("collection.addAria")}
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
      >
        {isOpen ? (
          <X className="size-6" aria-hidden />
        ) : (
          <FormatPlusIcon format={addPressingFormatGlyph(defaultFormat)} />
        )}
      </button>
    </div>
  );
}
