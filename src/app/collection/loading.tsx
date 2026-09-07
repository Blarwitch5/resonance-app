import { BootLoader } from "@/components/layouts/boot-shell";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";

export default async function Loading() {
  const locale = await getLocale();

  return <BootLoader label={t(locale, "loading.collection")} />;
}
