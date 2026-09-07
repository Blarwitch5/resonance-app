import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListenPressingPage } from "@/components/listen/listen-pressing-page";
import { discogsReleaseHref } from "@/lib/discogs/href";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { listenAddHref } from "@/lib/listen/href";
import { getSharedPressingByToken } from "@/lib/listen/repository";
import { parseShareTokenParam } from "@/lib/listen/token";
import { getSession } from "@/lib/session";

interface ListenTokenPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: ListenTokenPageProps): Promise<Metadata> {
  const { token: raw } = await params;
  const locale = await getLocale();
  const token = parseShareTokenParam(raw);

  if (!token) {
    return { title: t(locale, "listen.missing") };
  }

  const shared = await getSharedPressingByToken(token);

  if (!shared) {
    return { title: t(locale, "listen.missing") };
  }

  const title = `${shared.artist} — ${shared.title}`;
  const description = shared.sharerName
    ? t(locale, "listen.from", { name: shared.sharerName })
    : t(locale, "listen.description");
  const image = shared.coverUrl ?? shared.coverThumbUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ListenTokenPage({ params }: ListenTokenPageProps) {
  const { token: raw } = await params;
  const token = parseShareTokenParam(raw);

  if (!token) {
    notFound();
  }

  const [shared, session, locale] = await Promise.all([
    getSharedPressingByToken(token),
    getSession(),
    getLocale(),
  ]);

  if (!shared) {
    notFound();
  }

  return (
    <ListenPressingPage
      view={shared}
      addHref={listenAddHref(shared)}
      isSignedIn={Boolean(session)}
      locale={locale}
      discogsHref={shared.discogsId ? discogsReleaseHref(shared.discogsId) : null}
    />
  );
}
