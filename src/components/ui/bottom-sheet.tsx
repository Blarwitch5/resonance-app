"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { trapFocus } from "@/components/ui/trap-focus";
import { useT } from "@/components/locale-provider";

interface BottomSheetProps {
  id?: string;
  title: string;
  description?: string;
  onClose: () => void;
  dismissOnDesktop?: boolean;
  children: ReactNode;
}

function subscribeToClient(): () => void {
  return () => undefined;
}

export function BottomSheet({
  id,
  title,
  description,
  onClose,
  dismissOnDesktop = false,
  children,
}: BottomSheetProps) {
  const t = useT();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && panelRef.current) {
        trapFocus(panelRef.current, event);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (!dismissOnDesktop) {
      return;
    }

    const media = window.matchMedia("(min-width: 1024px)");

    function onChange() {
      if (media.matches) {
        onClose();
      }
    }

    if (media.matches) {
      onClose();
      return;
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [dismissOnDesktop, onClose]);

  if (!isClient) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-4 ${
        dismissOnDesktop ? "lg:hidden" : ""
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-overlay"
        aria-label={t("common.dismiss")}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 flex max-h-[85dvh] w-full flex-col rounded-t-rs-lg bg-surface-elevated px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:max-w-lg lg:rounded-rs-lg lg:pb-6"
      >
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-border-strong lg:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold text-text">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm leading-6 text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="mt-5 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
