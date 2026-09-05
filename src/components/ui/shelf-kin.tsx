import { Library } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/page-header";
import { RecordTile } from "@/components/ui/record-tile";
import { journalFromHref } from "@/lib/collection/href";
import { shelfCardThreads } from "@/lib/collection/shelf-threads";
import type { MediaCondition, MediaFormat } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface ShelfKinRecord {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  coverThumbUrl?: string | null;
  year: number | null;
  label?: string | null;
  genres?: readonly string[];
  format?: MediaFormat | null;
  condition?: MediaCondition | null;
  purchaseLocation?: string | null;
  purchaseDate?: Date | string | null;
}

interface ShelfKinProps {
  headline: string;
  href: string;
  records: ShelfKinRecord[];
  from?: string;
  locale?: Locale;
}

export function ShelfKin({ headline, href, records, from, locale = "en" }: ShelfKinProps) {
  if (records.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="shelf-kin-heading">
      <div className="flex flex-col gap-2">
        <SectionHeading icon={Library} id="shelf-kin-heading">
          {t(locale, "journal.alsoOnShelf")}
        </SectionHeading>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center text-sm leading-6 text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          {headline}
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
        {records.map((record) => (
          <li key={record.id}>
            <RecordTile
              href={journalFromHref(record.id, from)}
              coverUrl={record.coverUrl}
              compactUrl={record.coverThumbUrl}
              title={record.title}
              artist={record.artist}
              year={record.year}
              format={record.format}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              locale={locale}
              threads={shelfCardThreads(
                {
                  artist: record.artist,
                  year: record.year,
                  label: record.label,
                  genres: record.genres,
                  format: record.format,
                  condition: record.condition,
                  found: record.purchaseLocation,
                  foundWhen: record.purchaseDate,
                },
                {},
                locale,
              )}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
