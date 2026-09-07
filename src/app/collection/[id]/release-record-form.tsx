"use client";

import { Trash2, Undo2 } from "lucide-react";
import { useActionState, useEffect, useId, useState, type ReactNode } from "react";

import { releaseItemAction, type ReleaseItemState } from "@/app/collection/[id]/actions";
import { Button, buttonClass } from "@/components/ui/button";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import { journalReleaseTriggerClass } from "@/lib/collection/journal-release";

const initialState: ReleaseItemState = { error: null };

interface ReleaseRecordFormProps {
  id: string;
  title: string;
}

export function ReleaseRecordForm({ id, title }: ReleaseRecordFormProps) {
  const t = useT();
  const promptId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(releaseItemAction, initialState);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsConfirming(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isConfirming, isPending]);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className={`${buttonClass} ${journalReleaseTriggerClass()}`}
        aria-label={t("journal.letGo")}
        title={t("journal.letGo")}
        aria-haspopup="dialog"
        aria-expanded={false}
      >
        <Trash2 className="size-4 shrink-0" aria-hidden />
      </button>
    );
  }

  return (
    <form
      action={formAction}
      data-release-confirm=""
      aria-labelledby={promptId}
      className="flex w-full flex-col gap-4 rounded-rs-md border border-error/35 bg-error-soft/60 px-4 py-4"
    >
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-error text-on-error"
          aria-hidden
        >
          <Trash2 className="size-4" />
        </span>
        <p id={promptId} role="status" className="text-sm leading-6 text-text">
          {t("journal.leaveShelf", { title })}
        </p>
      </div>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
        <Button type="submit" variant="danger" disabled={isPending} className="sm:min-w-40">
          <BusyGlyph isBusy={isPending}>
            <Trash2 className="size-4 shrink-0" aria-hidden />
          </BusyGlyph>
          {isPending ? t("journal.releasing") : t("journal.releaseConfirm")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => setIsConfirming(false)}
        >
          <Undo2 className="size-4 shrink-0" aria-hidden />
          {t("journal.keepIt")}
        </Button>
      </div>
    </form>
  );
}

interface ReleaseSlotProps {
  id: string;
  children: ReactNode;
}

export function ReleaseSlot({ id, children }: ReleaseSlotProps) {
  const [state, formAction] = useActionState(releaseItemAction, initialState);

  return (
    <>
      {children}
      <form action={formAction} data-release="" className="sr-only">
        <input type="hidden" name="id" value={id} />
        {state.error ? (
          <span role="alert">{state.error}</span>
        ) : null}
      </form>
    </>
  );
}
