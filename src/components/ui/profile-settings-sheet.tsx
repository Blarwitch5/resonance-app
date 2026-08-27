"use client";

import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useId, type ReactNode } from "react";

import { BottomSheet } from "@/components/ui/bottom-sheet";

interface ProfileSettingsSheetProps {
  isOpen: boolean;
  href: string;
  closeHref: string;
  children: ReactNode;
}

export function ProfileSettingsSheet({ isOpen, href, closeHref, children }: ProfileSettingsSheetProps) {
  const router = useRouter();
  const dialogId = useId();

  const close = useCallback(() => {
    try {
      router.replace(closeHref, { scroll: false });
    } catch {
      // Navigation was cancelled — stay with the panel open.
    }
  }, [closeHref, router]);

  const toggle = useCallback(() => {
    try {
      router.replace(isOpen ? closeHref : href, { scroll: false });
    } catch {
      // Navigation was cancelled — stay on this listen.
    }
  }, [closeHref, href, isOpen, router]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        aria-label="Settings"
        onClick={toggle}
        className="group inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <Settings className="size-5 motion-safe:group-hover:vibrato" aria-hidden />
      </button>
      {isOpen ? (
        <BottomSheet
          id={dialogId}
          title="Your resonance"
          description="Theme, formats, password, and a copy to take with you."
          onClose={close}
        >
          <div className="flex flex-col gap-8">{children}</div>
        </BottomSheet>
      ) : null}
    </>
  );
}
