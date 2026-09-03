"use client";

import { BookmarkPlus } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { addWishlistAction, type AddWishlistState } from "@/app/explorer/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import type { MediaFormat } from "@/lib/collection/types";

const initialState: AddWishlistState = { error: null };

interface WishlistReleaseFormProps {
  discogsId: number;
  format: MediaFormat;
  title: string;
}

export function WishlistReleaseForm({ discogsId, format, title }: WishlistReleaseFormProps) {
  const t = useT();
  const [state, formAction, isPending] = useActionState(addWishlistAction, initialState);

  return (
    <form action={formAction} data-hold-waiting="" className="flex flex-col gap-2">
      <input type="hidden" name="discogsId" value={discogsId} />
      <input type="hidden" name="format" value={format} />
      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="w-full"
        aria-label={t("explorer.keepWaitingAria", { title })}
      >
        <BookmarkPlus className="size-4 shrink-0" aria-hidden />
        {isPending ? t("explorer.keepWaitingPending") : t("explorer.keepWaiting")}
      </Button>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
    </form>
  );
}

interface HoldWaitingSlotProps {
  discogsId: number;
  format: MediaFormat;
  children: ReactNode;
}

export function HoldWaitingSlot({ discogsId, format, children }: HoldWaitingSlotProps) {
  const [state, formAction] = useActionState(addWishlistAction, initialState);

  return (
    <>
      {children}
      <form action={formAction} data-hold-waiting="" className="sr-only">
        <input type="hidden" name="discogsId" value={discogsId} />
        <input type="hidden" name="format" value={format} />
        {state.error ? <span role="alert">{state.error}</span> : null}
      </form>
    </>
  );
}
