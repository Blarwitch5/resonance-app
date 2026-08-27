import { AppShell } from "@/components/layouts/app-shell";
import { SectionLoader } from "@/components/ui/listening-wave";

export default function Loading() {
  return (
    <AppShell>
      <SectionLoader label="Listening to this pressing…" />
    </AppShell>
  );
}
