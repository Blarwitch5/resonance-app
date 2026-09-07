import type { ReactNode } from "react";

import { SectionLoader } from "@/components/ui/listening-wave";

interface BootShellProps {
  children: ReactNode;
}

/** Instant chrome for route `loading.tsx` — no session, no Neon, no AppShell. */
export function BootShell({ children }: BootShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background pt-[env(safe-area-inset-top)] text-text">
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export function BootLoader({ label }: { label: string }) {
  return (
    <BootShell>
      <SectionLoader label={label} />
    </BootShell>
  );
}
