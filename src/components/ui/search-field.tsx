"use client";

import { Search, X } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";

import { controlClass } from "@/components/ui/control";

export function searchFieldHasClear(value: string | undefined): boolean {
  return (value?.length ?? 0) > 0;
}

interface SearchFieldProps {
  id: string;
  name: string;
  placeholder: string;
  label: string;
  clearLabel: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  isPending?: boolean;
}

export function SearchField({
  id,
  name,
  placeholder,
  label,
  clearLabel,
  defaultValue,
  value,
  onValueChange,
  isPending = false,
}: SearchFieldProps) {
  const isControlled = value !== undefined;
  const hasClear = isControlled && searchFieldHasClear(value);

  function releaseListen() {
    onValueChange?.("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape" || !hasClear) {
      return;
    }

    event.preventDefault();
    releaseListen();
  }

  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Search
        className={`pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary ${
          isPending ? "motion-safe:animate-[ripple_700ms_ease-out_infinite]" : ""
        }`}
        aria-hidden
      />
      <input
        id={id}
        name={name}
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className={`${controlClass} pl-10 [&::-webkit-search-cancel-button]:appearance-none ${hasClear ? "pr-12" : ""}`}
        onKeyDown={onKeyDown}
        {...(isControlled
          ? {
              value,
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                onValueChange?.(event.target.value);
              },
            }
          : { defaultValue })}
      />
      {hasClear ? (
        <button
          type="button"
          aria-label={clearLabel}
          className="absolute top-1/2 right-1 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-rs-sm text-text-tertiary outline-none hover:text-text hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
          onClick={releaseListen}
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
