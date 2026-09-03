import { Bookmark, Calendar, CalendarPlus, Disc3, Heart, Hourglass, Layers, Library, MapPin, Music, Tag, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BarList } from "@/components/ui/bar-list";
import { type ChartTone } from "@/components/ui/chart-tone";
import { ColumnChart, type ColumnChartItem } from "@/components/ui/column-chart";
import { DonutChart } from "@/components/ui/donut-chart";
import {
  formatFillClasses,
  formatSwatchClasses,
} from "@/components/ui/format-tokens";
import { kickerClass, sectionTitleClass } from "@/components/ui/type";
import { collectionHref } from "@/lib/collection/href";
import type { CollectionInsight } from "@/lib/collection/stats";
import { decadeStory } from "@/lib/collection/stats";
import { decadeName, formatLabel, hearDecadeOnShelf, hearOnShelf } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { ProfileEngagementCard } from "@/lib/profile/types";
import type { Locale } from "@/lib/settings/types";

interface CollectionStatsProps {
  insight: CollectionInsight;
  engagement?: ProfileEngagementCard[];
  locale?: Locale;
}

const ENGAGEMENT_ICONS: Record<ProfileEngagementCard["id"], LucideIcon> = {
  close: Heart,
  waiting: Bookmark,
};

export function CollectionStats({ insight, engagement = [], locale = "en" }: CollectionStatsProps) {
  if (insight.total === 0 && engagement.length === 0) {
    return null;
  }

  const story = decadeStory(insight, locale);
  const hasFormatMix = insight.formats.length >= 2;
  const formatLine = insight.formats
    .map((entry) => `${entry.count} ${formatLabel(locale, entry.format)}`)
    .join(" · ");
  const artistsWhoStay = insight.topArtists.filter((artist) => artist.count >= 2);
  const labelsWhoStay = insight.topLabels.filter((entry) => entry.count >= 2);
  const placesWhoStay = insight.topPlaces.filter((entry) => entry.count >= 2);
  const yearsWhoStay = insight.topWhen.filter((entry) => entry.count >= 2);
  const arrivedYears = insight.topArrived;
  const hasArrivedTimeline =
    arrivedYears.length >= 2 || (arrivedYears[0] !== undefined && arrivedYears[0].count >= 2);
  const hasGenreMix = insight.topGenres.length >= 2;
  const formatCaption = t(locale, "format.mixCaption", {
    line: insight.formats.map((entry) => `${entry.count} ${formatLabel(locale, entry.format)}`).join(", "),
  });

  return (
    <section className="flex flex-col gap-6" aria-labelledby="collection-stats-heading">
      <div className="flex flex-col gap-4">
        <h2 id="collection-stats-heading" className={`flex items-center gap-2 ${sectionTitleClass}`}>
          <Library className="size-5 shrink-0 text-text-secondary" aria-hidden />
          {t(locale, "stats.heading")}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {insight.total > 0 ? (
            <>
              <StatCard
                icon={Disc3}
                label={t(locale, "stats.onShelf")}
                value={insight.total === 1 ? t(locale, "profile.recordOne") : t(locale, "profile.records", { count: insight.total })}
              />
              <StatCard
                icon={UserRound}
                label={t(locale, "stats.diversity")}
                value={t(locale, "stats.diversityValue", {
                  artists: insight.artistCount,
                  albums: insight.total,
                  labels: insight.labelCount,
                })}
              />
            </>
          ) : null}
          {!hasFormatMix && formatLine ? <StatCard icon={Layers} label={t(locale, "stats.formats")} value={formatLine} /> : null}
          {!insight.decades.length && story ? <StatCard icon={Hourglass} label={t(locale, "stats.time")} value={story} /> : null}
          {insight.oldestYear !== null ? (
            <StatCard
              icon={Hourglass}
              label={insight.newestYear === insight.oldestYear ? t(locale, "stats.pressedIn") : t(locale, "stats.oldest")}
              value={String(insight.oldestYear)}
              href={collectionHref({ year: insight.oldestYear })}
              ariaLabel={hearOnShelf(locale, String(insight.oldestYear))}
            />
          ) : null}
          {insight.newestYear !== null && insight.newestYear !== insight.oldestYear ? (
            <StatCard
              icon={Calendar}
              label={t(locale, "stats.newest")}
              value={String(insight.newestYear)}
              href={collectionHref({ year: insight.newestYear })}
              ariaLabel={hearOnShelf(locale, String(insight.newestYear))}
            />
          ) : null}
          {artistsWhoStay.length === 0 && insight.mostPresentArtist ? (
            <StatCard
              icon={Heart}
              label={t(locale, "stats.mostPresent")}
              value={`${insight.mostPresentArtist.name} · ${insight.mostPresentArtist.count}`}
              href={collectionHref({ artist: insight.mostPresentArtist.name })}
              ariaLabel={hearOnShelf(locale, insight.mostPresentArtist.name)}
            />
          ) : null}
          {engagement.map((card) => (
            <StatCard
              key={card.id}
              icon={ENGAGEMENT_ICONS[card.id]}
              label={card.label}
              value={card.value}
              href={card.href}
              ariaLabel={card.ariaLabel}
            />
          ))}
        </ul>
      </div>

      {hasFormatMix ? (
        <ChartPanel icon={Layers} title={t(locale, "format.mix")}>
          <DonutChart
            total={insight.total}
            caption={formatCaption}
            unit={t(locale, insight.total === 1 ? "stats.recordUnit" : "stats.recordsUnit")}
            segments={insight.formats.map((entry) => ({
              key: entry.format,
              label: formatLabel(locale, entry.format),
              count: entry.count,
              fillClass: formatFillClasses[entry.format],
              swatchClass: formatSwatchClasses[entry.format],
              href: collectionHref({ format: entry.format }),
              ariaLabel: hearOnShelf(locale, formatLabel(locale, entry.format)),
            }))}
          />
        </ChartPanel>
      ) : null}

      {insight.decades.length > 0 || artistsWhoStay.length > 0 ? (
        <div
          className={
            insight.decades.length > 0 && artistsWhoStay.length > 0
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : undefined
          }
        >
          {insight.decades.length > 0 ? (
            <ChartPanel icon={Hourglass} title={t(locale, "stats.acrossYears")}>
              {story ? <p className="text-sm leading-6 text-text-secondary">{story}</p> : null}
              <TimeChart
                tone="vinyl"
                items={insight.decades.map((entry) => ({
                  label: String(entry.decade),
                  count: entry.count,
                  href: collectionHref({ decade: entry.decade }),
                  ariaLabel: hearDecadeOnShelf(locale, decadeName(locale, entry.decade)),
                }))}
              />
            </ChartPanel>
          ) : null}

          {artistsWhoStay.length > 0 ? (
            <ChartPanel icon={Heart} title={t(locale, "stats.artistsStay")}>
              <BarList
                tone="cassette"
                variant="marks"
                items={artistsWhoStay.map((artist) => ({
                  label: artist.name,
                  count: artist.count,
                  href: collectionHref({ artist: artist.name }),
                  ariaLabel: hearOnShelf(locale, artist.name),
                }))}
              />
            </ChartPanel>
          ) : null}
        </div>
      ) : null}

      {hasGenreMix || labelsWhoStay.length > 0 ? (
        <div
          className={
            hasGenreMix && labelsWhoStay.length > 0 ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : undefined
          }
        >
          {hasGenreMix ? (
            <ChartPanel icon={Music} title={t(locale, "stats.soundsKeep")}>
              <BarList
                tone="cassette"
                variant="marks"
                items={insight.topGenres.map((genre) => ({
                  label: genre.name,
                  count: genre.count,
                  href: collectionHref({ genre: genre.name }),
                  ariaLabel: hearOnShelf(locale, genre.name),
                }))}
              />
            </ChartPanel>
          ) : null}

          {labelsWhoStay.length > 0 ? (
            <ChartPanel icon={Tag} title={t(locale, "stats.labelsReturn")}>
              <BarList
                tone="vinyl"
                variant="marks"
                items={labelsWhoStay.map((entry) => ({
                  label: entry.name,
                  count: entry.count,
                  href: collectionHref({ label: entry.name }),
                  ariaLabel: hearOnShelf(locale, entry.name),
                }))}
              />
            </ChartPanel>
          ) : null}
        </div>
      ) : null}

      {placesWhoStay.length > 0 || yearsWhoStay.length > 0 ? (
        <div
          className={
            placesWhoStay.length > 0 && yearsWhoStay.length > 0
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : undefined
          }
        >
          {placesWhoStay.length > 0 ? (
            <ChartPanel icon={MapPin} title={t(locale, "stats.whereFound")}>
              <BarList
                tone="cassette"
                variant="marks"
                items={placesWhoStay.map((entry) => ({
                  label: entry.name,
                  count: entry.count,
                  href: collectionHref({ found: entry.name }),
                  ariaLabel: t(locale, "thread.hearFound", { place: entry.name }),
                }))}
              />
            </ChartPanel>
          ) : null}
          {yearsWhoStay.length > 0 ? (
            <ChartPanel icon={Calendar} title={t(locale, "stats.whenFound")}>
              <TimeChart
                tone="cassette"
                items={[...yearsWhoStay]
                  .sort((left, right) => left.year - right.year)
                  .map((entry) => ({
                    label: String(entry.year),
                    count: entry.count,
                    href: collectionHref({ when: entry.year }),
                    ariaLabel: t(locale, "thread.hearFound", { place: String(entry.year) }),
                  }))}
              />
            </ChartPanel>
          ) : null}
        </div>
      ) : null}

      {hasArrivedTimeline ? (
        <ChartPanel icon={CalendarPlus} title={t(locale, "stats.whenArrived")}>
          <TimeChart
            tone="cd"
            items={arrivedYears.map((entry) => ({
              label: String(entry.year),
              count: entry.count,
              href: collectionHref({ arrived: entry.year }),
              ariaLabel: t(locale, "thread.hearArrived", { year: entry.year }),
            }))}
          />
        </ChartPanel>
      ) : null}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  ariaLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  ariaLabel?: string;
}) {
  const body = (
    <>
      <p className={`flex items-center gap-2 ${kickerClass}`}>
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="text-sm leading-6 font-medium text-text">{value}</p>
    </>
  );

  if (!href) {
    return <li className="flex flex-col gap-2 rounded-rs-md border border-border bg-surface px-4 py-4">{body}</li>;
  }

  return (
    <li>
      <Link
        href={href}
        aria-label={ariaLabel}
        className="flex min-h-11 flex-col gap-2 rounded-rs-md border border-border bg-surface px-4 py-4 outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        {body}
      </Link>
    </li>
  );
}

function ChartPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-rs-md border border-border bg-surface px-6 py-4">
      <h3 className={`flex items-center gap-2 ${kickerClass}`}>
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}

function TimeChart({ items, tone }: { items: ColumnChartItem[]; tone: ChartTone }) {
  if (items.length >= 2) {
    return <ColumnChart tone={tone} items={items} />;
  }

  return <BarList tone={tone} variant="marks" items={items} />;
}
