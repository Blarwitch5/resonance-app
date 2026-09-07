"use client";

import type { ReactNode } from "react";

import { ResonanceMark } from "@/components/ui/resonance-mark";
import { useT } from "@/components/locale-provider";

interface BootShellProps {
  children: ReactNode;
}

/** Instant chrome for route `loading.tsx` — no session, no Neon, no AppShell. */
export function BootShell({ children }: BootShellProps) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background pt-[env(safe-area-inset-top)] text-text"
      style={{
        minHeight: "100dvh",
        background: "var(--rs-background, #f6f4f8)",
        color: "var(--rs-text, #14101c)",
      }}
    >
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export function BootLoader({ labelKey = "loading.collection" }: { labelKey?: "loading.collection" | "loading.profile" | "loading.explorer" | "loading.journal" | "loading.confirm" }) {
  const t = useT();

  return (
    <BootShell>
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 px-6"
        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}
        aria-live="polite"
        aria-busy
      >
        <ResonanceMark size="lg" isListening />
        <p className="text-sm leading-6 text-text-secondary" style={{ margin: 0, fontSize: "0.875rem", color: "var(--rs-text-secondary, #5c5668)" }}>
          {t(labelKey)}
        </p>
      </div>
    </BootShell>
  );
}
