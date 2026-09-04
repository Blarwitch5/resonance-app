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
    <div className="relative min-w-0 flex-1 overflow-visible">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <span className="pointer-events-none absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center">
        <Search
          className={`size-4 ${isPending ? "text-primary motion-safe:search-pulse" : "text-text-tertiary"}`}
          aria-hidden
        />
      </span>
      <input
        id={id}
        name={name}
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className={`${controlClass} pl-11 [&::-webkit-search-cancel-button]:appearance-none ${hasClear ? "pr-12" : ""}`}
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
