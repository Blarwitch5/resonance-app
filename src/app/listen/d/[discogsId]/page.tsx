import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListenPressingPage } from "@/components/listen/listen-pressing-page";
import { toReleaseDraft } from "@/lib/discogs/adapter";
import { getDiscogsRelease } from "@/lib/discogs/client";
import { discogsReleaseHref } from "@/lib/discogs/href";
import { DiscogsError } from "@/lib/errors";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { listenAddHref } from "@/lib/listen/href";
import type { ListenPressingView } from "@/lib/listen/types";
import { getSession } from "@/lib/session";

interface ListenDiscogsPageProps {
  params: Promise<{ discogsId: string }>;
}

function parseDiscogsId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: ListenDiscogsPageProps): Promise<Metadata> {
  const { discogsId: raw } = await params;
  const locale = await getLocale();
  const discogsId = parseDiscogsId(raw);

  if (discogsId === null) {
    return { title: t(locale, "listen.missing") };
  }

  try {
    const draft = toReleaseDraft(await getDiscogsRelease(discogsId));
    const title = `${draft.artist} — ${draft.title}`;
    const description = t(locale, "listen.description");
    const image = draft.coverUrl ?? draft.coverThumbUrl;

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
  } catch {
    return { title: t(locale, "listen.missing") };
  }
}

export default async function ListenDiscogsPage({ params }: ListenDiscogsPageProps) {
  const { discogsId: raw } = await params;
  const discogsId = parseDiscogsId(raw);

  if (discogsId === null) {
    notFound();
  }

  const [session, locale] = await Promise.all([getSession(), getLocale()]);

  let view: ListenPressingView;

  try {
    const draft = toReleaseDraft(await getDiscogsRelease(discogsId));
    view = {
      discogsId: draft.discogsId,
      format: draft.format,
      title: draft.title,
      artist: draft.artist,
      year: draft.year,
      label: draft.label,
      genres: draft.genres,
      coverUrl: draft.coverUrl ?? null,
      coverThumbUrl: draft.coverThumbUrl ?? null,
      sharerName: null,
    };
  } catch (error) {
    if (error instanceof DiscogsError) {
      notFound();
    }

    throw error;
  }

  return (
    <ListenPressingPage
      view={view}
      addHref={listenAddHref(view)}
      isSignedIn={Boolean(session)}
      locale={locale}
      discogsHref={discogsReleaseHref(discogsId)}
    />
  );
}
