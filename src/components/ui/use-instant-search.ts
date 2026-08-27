"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition, type FormEvent } from "react";

import { SHELF_SEARCH_DEBOUNCE_MS } from "@/lib/collection/search";

export function useInstantSearch(committedQuery: string, hrefFor: (value: string) => string) {
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
    }, SHELF_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [committedQuery, go, value]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go(value);
  }

  return { value, setValue, isPending, onSubmit };
}
