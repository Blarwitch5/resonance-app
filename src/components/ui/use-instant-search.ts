"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition, type FormEvent } from "react";

import { isSearchListening, SHELF_SEARCH_DEBOUNCE_MS } from "@/lib/collection/search";

export function useInstantSearch(
  committedQuery: string,
  hrefFor: (value: string) => string,
  debounceMs = SHELF_SEARCH_DEBOUNCE_MS,
) {
  const router = useRouter();
  const [value, setValue] = useState(committedQuery);
  const [requested, setRequested] = useState(committedQuery);
  const [seenQuery, setSeenQuery] = useState(committedQuery);
  const [isPending, startTransition] = useTransition();

  if (committedQuery !== seenQuery) {
    setSeenQuery(committedQuery);

    if (committedQuery !== requested) {
      setValue(committedQuery);
      setRequested(committedQuery);
    }
  }

  const go = useCallback(
    (next: string) => {
      const href = hrefFor(next);
      const trimmed = next.trim();

      if (href === hrefFor(committedQuery)) {
        setRequested(trimmed);
        return;
      }

      setRequested(trimmed);
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [committedQuery, hrefFor, router],
  );

  useEffect(() => {
    if (value === committedQuery) {
      return;
    }

    const timeout = window.setTimeout(() => {
      go(value);
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [committedQuery, debounceMs, go, value]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(value);
  }

  const isListening = isSearchListening(value, committedQuery, isPending);

  return { value, setValue, isPending, isListening, onSubmit };
}
