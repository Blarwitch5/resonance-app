"use client";

import { Heart } from "lucide-react";
import { useActionState, type ReactNode } from "react";

import { toggleKeptCloseAction, type ToggleKeptCloseState } from "@/app/collection/[id]/actions";
import { ChipButton } from "@/components/ui/chip";
import { keptCloseCoverRevealClass } from "@/components/ui/kept-close";
import { Notice } from "@/components/ui/notice";

const initialState: ToggleKeptCloseState = { error: null };

interface KeptCloseFormProps {
  id: string;
  isFavorite: boolean;
  variant?: "chip" | "icon";
}

export function KeptCloseForm({ id, isFavorite, variant = "chip" }: KeptCloseFormProps) {
  const [state, formAction, isPending] = useActionState(toggleKeptCloseAction, initialState);
  const label = isFavorite ? "Stop keeping this close" : "Keep this close";

  return (
    <form action={formAction} data-keep-close="" className={variant === "chip" ? "flex flex-col gap-2" : undefined}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="keep" value={isFavorite ? "0" : "1"} />
      {variant === "chip" ? (
        <ChipButton isActive={isFavorite} disabled={isPending} aria-label={label}>
          <Heart className={`size-4 shrink-0 ${isFavorite ? "fill-current" : ""}`} aria-hidden />
          Keep this close
        </ChipButton>
      ) : (
        <button
          type="submit"
          aria-pressed={isFavorite}
          aria-label={label}
          disabled={isPending}
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border outline-none transition-colors hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong disabled:pointer-events-none ${
            isFavorite
              ? "border-transparent bg-primary-soft text-on-primary-soft"
              : "border-border bg-surface text-text-secondary"
          }`}
        >
          <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} aria-hidden />
        </button>
      )}
      {state.error ? (
        variant === "chip" ? (
          <Notice tone="error">{state.error}</Notice>
        ) : (
          <span role="alert" className="sr-only">
            {state.error}
          </span>
        )
      ) : null}
    </form>
  );
}

interface KeptCloseSlotProps {
  id: string;
  isFavorite: boolean;
  layout: "row" | "cover";
  children: ReactNode;
}

export function KeptCloseSlot({ id, isFavorite, layout, children }: KeptCloseSlotProps) {
  const toggle = <KeptCloseForm id={id} isFavorite={isFavorite} variant="icon" />;

  if (layout === "row") {
    return (
      <div className="flex items-center gap-1 rounded-rs-md hover:bg-surface-pressed">
        <div className="min-w-0 flex-1">{children}</div>
        {toggle}
      </div>
    );
  }

  return (
    <div className="group relative">
      {children}
      <div className={keptCloseCoverRevealClass(isFavorite)}>{toggle}</div>
    </div>
  );
}
