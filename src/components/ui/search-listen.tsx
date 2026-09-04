"use client";

import { createContext, useContext, type ReactNode } from "react";

interface SearchListenValue {
  isListening: boolean;
  label: string;
}

const SearchListenContext = createContext<SearchListenValue>({
  isListening: false,
  label: "",
});

export function SearchListenRoot({
  isListening,
  label,
  children,
}: SearchListenValue & { children: ReactNode }) {
  return <SearchListenContext.Provider value={{ isListening, label }}>{children}</SearchListenContext.Provider>;
}

export function SearchListenPane({ children }: { children: ReactNode }) {
  const { isListening } = useContext(SearchListenContext);

  return (
    <div
      className={isListening ? "pointer-events-none" : undefined}
      aria-busy={isListening}
      data-shelf-listening={isListening ? "" : undefined}
    >
      {children}
    </div>
  );
}
