import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListenShelfPage } from "@/components/listen/listen-shelf-page";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { getSharedShelfByToken } from "@/lib/listen/repository";
import { parseShareTokenParam } from "@/lib/listen/token";
import { getSession } from "@/lib/session";

interface ListenShelfTokenPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: ListenShelfTokenPageProps): Promise<Metadata> {
  const { token: raw } = await params;
  const locale = await getLocale();
  const token = parseShareTokenParam(raw);

  if (!token) {
    return { title: t(locale, "listen.missingShelf") };
  }

  const shelf = await getSharedShelfByToken(token);

  if (!shelf) {
    return { title: t(locale, "listen.missingShelf") };
  }

  const title = shelf.headline;
  const description = shelf.sharerName
    ? t(locale, "listen.from", { name: shelf.sharerName })
    : t(locale, "listen.shelfDescription");
  const image = shelf.items[0]?.coverUrl ?? shelf.items[0]?.coverThumbUrl;

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

export default async function ListenShelfTokenPage({ params }: ListenShelfTokenPageProps) {
  const { token: raw } = await params;
  const token = parseShareTokenParam(raw);

  if (!token) {
    notFound();
  }

  const [shelf, session, locale] = await Promise.all([
    getSharedShelfByToken(token),
    getSession(),
    getLocale(),
  ]);

  if (!shelf) {
    notFound();
  }

  return <ListenShelfPage shelf={shelf} isSignedIn={Boolean(session)} locale={locale} />;
}
