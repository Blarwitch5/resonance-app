"use client";

import { Search } from "lucide-react";
import type { ChangeEvent } from "react";

import { controlClass } from "@/components/ui/control";

interface SearchFieldProps {
  id: string;
  name: string;
  placeholder: string;
  label: string;
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
  defaultValue,
  value,
  onValueChange,
  isPending = false,
}: SearchFieldProps) {
  const isControlled = value !== undefined;

  return (
    <div className="relative flex-1">
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
        className={`${controlClass} pl-10`}
        {...(isControlled
          ? {
              value,
              onChange: (event: ChangeEvent<HTMLInputElement>) => {
                onValueChange?.(event.target.value);
              },
            }
          : { defaultValue })}
      />
    </div>
  );
}
