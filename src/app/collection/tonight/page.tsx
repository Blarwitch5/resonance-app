import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { journalHref } from "@/lib/collection/href";
import { hasShelfItems, listCollectionItems } from "@/lib/collection/repository";
import { tonightDayKey, tonightFromShelf } from "@/lib/collection/tonight";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { t } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  const session = await requireSession();
  const settings = await getUserSettings(session.user.id);
  return { title: t(settings.locale, "document.tonight") };
}

export default async function TonightPage() {
  const session = await requireSession();
  const [settings, owned] = await Promise.all([
    getUserSettings(session.user.id),
    listCollectionItems(session.user.id, { kind: "owned" }),
  ]);
  const id = tonightFromShelf(owned, tonightDayKey());

  if (id) {
    redirect(journalHref(id));
  }

  if (settings.onboardedAt === null) {
    const hasItems = await hasShelfItems(session.user.id);

    if (!hasItems) {
      redirect("/welcome");
    }
  }

  redirect("/collection");
}
