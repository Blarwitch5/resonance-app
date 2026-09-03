"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";

import { releaseItemAction, type ReleaseItemState } from "@/app/collection/[id]/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";

const initialState: ReleaseItemState = { error: null };

interface ReleaseRecordFormProps {
  id: string;
  title: string;
}

export function ReleaseRecordForm({ id, title }: ReleaseRecordFormProps) {
  const t = useT();
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(releaseItemAction, initialState);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConfirming(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isConfirming]);

  if (!isConfirming) {
    return (
      <Button type="button" variant="ghost" onClick={() => setIsConfirming(true)}>
        {t("journal.letGo")}
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-rs-md border border-border bg-surface px-4 py-4">
      <input type="hidden" name="id" value={id} />
      <p role="status" className="text-sm leading-6 text-text-secondary">
        {t("journal.leaveShelf", { title })}
      </p>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" disabled={isPending} onClick={() => setIsConfirming(false)}>
          {t("journal.keepIt")}
        </Button>
        <Button type="submit" variant="ghost" disabled={isPending}>
          {isPending ? t("journal.releasing") : t("journal.release")}
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
