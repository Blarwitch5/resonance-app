import type { Metadata } from "next";

import { ManualReleaseForm } from "@/app/explorer/manual/manual-release-form";
import { AppShell } from "@/components/layouts/app-shell";
import { BackLink } from "@/components/ui/back-link";
import { bodyClass, eyebrowClass, pageTitleClass } from "@/components/ui/type";
import { explorerBackHref } from "@/lib/discogs/href";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat } from "@/lib/settings/types";

interface ManualReleasePageProps {
  searchParams: Promise<{ from?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLocale(), "document.writeIn") };
}

export default async function ManualReleasePage({ searchParams }: ManualReleasePageProps) {
  const session = await requireSession();
  const [query, settings] = await Promise.all([searchParams, getUserSettings(session.user.id)]);
  const locale = settings.locale;
  const formats = enabledFormats(settings);
  const defaultFormat = preferredFormat(formats, settings.defaultFormat);

  return (
    <AppShell>
      <BackLink href={explorerBackHref(query.from)}>{t(locale, "back.explorer")}</BackLink>
      <header className="flex flex-col gap-2">
        <p className={eyebrowClass}>{t(locale, "common.confirm")}</p>
        <h1 className={pageTitleClass}>{t(locale, "explorer.writeIn")}</h1>
        <p className={bodyClass}>{t(locale, "explorer.writeDescription")}</p>
      </header>
      <ManualReleaseForm defaultFormat={defaultFormat} formats={formats} />
    </AppShell>
  );
}
