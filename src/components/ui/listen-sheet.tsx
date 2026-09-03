"use client";

import { SlidersHorizontal } from "lucide-react";
import { useCallback, useId, useState, type ReactNode } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ButtonLink } from "@/components/ui/button";
import { useT } from "@/components/locale-provider";

interface ListenSheetProps {
  count: number;
  title: string;
  description: string;
  clearHref?: string;
  clearLabel?: string;
  children: ReactNode;
}

interface CollectionListenSheetProps {
  count: number;
  clearHref?: string;
  children: ReactNode;
}

export function ListenSheet({
  count,
  title,
  description,
  clearHref,
  clearLabel,
  children,
}: ListenSheetProps) {
  const t = useT();
  const resolvedClear = clearLabel ?? t("common.showWholeShelf");
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        aria-label={count > 0 ? t("collection.listenActive", { count }) : t("collection.listenTitle")}
        onClick={() => setIsOpen(true)}
        className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong lg:hidden ${
          count > 0
            ? "border-transparent bg-primary-soft text-on-primary-soft"
            : "border-border text-text-secondary"
        }`}
      >
        <SlidersHorizontal className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
        {t("common.listen")}
        {count > 0 ? (
          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-primary">
            {count}
          </span>
        ) : null}
      </button>
      {isOpen ? (
        <BottomSheet id={dialogId} title={title} description={description} onClose={close} dismissOnDesktop>
          <div className="flex flex-col gap-5">
            {children}
            {clearHref ? (
              <ButtonLink href={clearHref} variant="ghost" className="self-start">
                {resolvedClear}
              </ButtonLink>
            ) : null}
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}

export function CollectionListenSheet({ count, clearHref, children }: CollectionListenSheetProps) {
  const t = useT();

  return (
    <ListenSheet
      count={count}
      title={t("collection.listenTitle")}
      description={t("collection.listenDescription")}
      clearHref={clearHref}
      clearLabel={t("common.showWholeShelf")}
    >
      {children}
    </ListenSheet>
  );
}
