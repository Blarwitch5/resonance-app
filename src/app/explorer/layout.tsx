import type { ReactNode } from "react";

import { AppShell } from "@/components/layouts/app-shell";

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
