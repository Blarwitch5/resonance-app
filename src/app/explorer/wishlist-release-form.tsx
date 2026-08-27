"use client";

import { BookmarkPlus } from "lucide-react";
import { useActionState } from "react";

import { addWishlistAction, type AddWishlistState } from "@/app/explorer/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { MediaFormat } from "@/lib/collection/types";

const initialState: AddWishlistState = { error: null };

interface WishlistReleaseFormProps {
  discogsId: number;
  format: MediaFormat;
  title: string;
}

export function WishlistReleaseForm({ discogsId, format, title }: WishlistReleaseFormProps) {
  const [state, formAction, isPending] = useActionState(addWishlistAction, initialState);

  return (
    <form action={formAction} data-hold-waiting="" className="flex flex-col gap-2">
      <input type="hidden" name="discogsId" value={discogsId} />
      <input type="hidden" name="format" value={format} />
      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="w-full min-h-11 px-3 text-xs"
        aria-label={`Keep ${title} waiting on your wishlist`}
      >
        <BookmarkPlus className="size-4 shrink-0" aria-hidden />
        {isPending ? "Keeping it waiting…" : "Wishlist"}
      </Button>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
    </form>
  );
}
