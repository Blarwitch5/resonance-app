import { AppShell } from "@/components/layouts/app-shell";
import { SectionLoader } from "@/components/ui/listening-wave";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";

export default async function Loading() {
  const locale = await getLocale();

  return (
    <AppShell>
      <SectionLoader label={t(locale, "loading.explorer")} />
    </AppShell>
  );
}
