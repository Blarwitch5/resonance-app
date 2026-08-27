import { Bookmark, Calendar, CalendarPlus, Disc3, Heart, Hourglass, Layers, Library, MapPin, Music, Tag, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BarList } from "@/components/ui/bar-list";
import { DonutChart } from "@/components/ui/donut-chart";
import {
  formatFillClasses,
  formatLabels,
  formatSwatchClasses,
} from "@/components/ui/format-icon";
import { collectionHref } from "@/lib/collection/href";
import type { CollectionInsight } from "@/lib/collection/stats";
import { decadeLabel, decadeStory } from "@/lib/collection/stats";
import type { ProfileEngagementCard } from "@/lib/profile/types";

interface CollectionStatsProps {
  insight: CollectionInsight;
  engagement?: ProfileEngagementCard[];
}

const ENGAGEMENT_ICONS: Record<ProfileEngagementCard["id"], LucideIcon> = {
  close: Heart,
  waiting: Bookmark,
};

export function CollectionStats({ insight, engagement = [] }: CollectionStatsProps) {
  if (insight.total === 0 && engagement.length === 0) {
    return null;
  }

  const story = decadeStory(insight);
  const hasFormatMix = insight.formats.length >= 2;
  const formatLine = insight.formats
    .map((entry) => `${entry.count} ${formatLabels[entry.format]}`)
    .join(" · ");
  const artistsWhoStay = insight.topArtists.filter((artist) => artist.count >= 2);
  const labelsWhoStay = insight.topLabels.filter((entry) => entry.count >= 2);
  const placesWhoStay = insight.topPlaces.filter((entry) => entry.count >= 2);
  const yearsWhoStay = insight.topWhen.filter((entry) => entry.count >= 2);
  const arrivedYears = insight.topArrived;
  const hasArrivedTimeline =
    arrivedYears.length >= 2 || (arrivedYears[0] !== undefined && arrivedYears[0].count >= 2);
  const hasGenreMix = insight.topGenres.length >= 2;
  const formatCaption = `Format mix: ${insight.formats
    .map((entry) => `${entry.count} ${formatLabels[entry.format]}`)
    .join(", ")}.`;

  return (
    <section className="flex flex-col gap-6" aria-labelledby="collection-stats-heading">
      <div className="flex flex-col gap-4">
        <h2 id="collection-stats-heading" className="flex items-center gap-2 text-lg font-semibold text-text">
          <Library className="size-5 shrink-0 text-text-secondary" aria-hidden />
          Your resonance
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {insight.total > 0 ? (
            <>
              <StatCard
                icon={Disc3}
                label="On the shelf"
                value={`${insight.total} ${insight.total === 1 ? "record" : "records"}`}
              />
              <StatCard
                icon={UserRound}
                label="Diversity"
                value={`${insight.artistCount} artists · ${insight.total} albums · ${insight.labelCount} labels`}
              />
            </>
          ) : null}
          {!hasFormatMix && formatLine ? <StatCard icon={Layers} label="Formats" value={formatLine} /> : null}
          {!insight.decades.length && story ? <StatCard icon={Hourglass} label="Time" value={story} /> : null}
          {insight.oldestYear !== null ? (
            <StatCard
              icon={Hourglass}
              label={insight.newestYear === insight.oldestYear ? "Pressed in" : "Oldest pressing"}
              value={String(insight.oldestYear)}
              href={collectionHref({ year: insight.oldestYear })}
              ariaLabel={`Hear ${insight.oldestYear} on your shelf`}
            />
          ) : null}
          {insight.newestYear !== null && insight.newestYear !== insight.oldestYear ? (
            <StatCard
              icon={Calendar}
              label="Newest pressing"
              value={String(insight.newestYear)}
              href={collectionHref({ year: insight.newestYear })}
              ariaLabel={`Hear ${insight.newestYear} on your shelf`}
            />
          ) : null}
          {artistsWhoStay.length === 0 && insight.mostPresentArtist ? (
            <StatCard
              icon={Heart}
              label="Most present"
              value={`${insight.mostPresentArtist.name} · ${insight.mostPresentArtist.count}`}
              href={collectionHref({ artist: insight.mostPresentArtist.name })}
              ariaLabel={`Hear ${insight.mostPresentArtist.name} on your shelf`}
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
        <ChartPanel icon={Layers} title="Format mix">
          <DonutChart
            total={insight.total}
            caption={formatCaption}
            segments={insight.formats.map((entry) => ({
              key: entry.format,
              label: formatLabels[entry.format],
              count: entry.count,
              fillClass: formatFillClasses[entry.format],
              swatchClass: formatSwatchClasses[entry.format],
              href: collectionHref({ format: entry.format }),
              ariaLabel: `Hear ${formatLabels[entry.format]} on your shelf`,
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
            <ChartPanel icon={Hourglass} title="Across the years">
              {story ? <p className="text-sm leading-6 text-text-secondary">{story}</p> : null}
              <BarList
                items={insight.decades.map((entry) => ({
                  label: decadeLabel(entry.decade),
                  count: entry.count,
                  href: collectionHref({ decade: entry.decade }),
                  ariaLabel: `Hear the ${decadeLabel(entry.decade)} on your shelf`,
                }))}
              />
            </ChartPanel>
          ) : null}

          {artistsWhoStay.length > 0 ? (
            <ChartPanel icon={Heart} title="Artists who stay">
              <BarList
                items={artistsWhoStay.map((artist) => ({
                  label: artist.name,
                  count: artist.count,
                  href: collectionHref({ artist: artist.name }),
                  ariaLabel: `Hear ${artist.name} on your shelf`,
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
            <ChartPanel icon={Music} title="Sounds you keep">
              <BarList
                items={insight.topGenres.map((genre) => ({
                  label: genre.name,
                  count: genre.count,
                  href: collectionHref({ genre: genre.name }),
                  ariaLabel: `Hear ${genre.name} on your shelf`,
                }))}
              />
            </ChartPanel>
          ) : null}

          {labelsWhoStay.length > 0 ? (
            <ChartPanel icon={Tag} title="Labels you return to">
              <BarList
                items={labelsWhoStay.map((entry) => ({
                  label: entry.name,
                  count: entry.count,
                  href: collectionHref({ label: entry.name }),
                  ariaLabel: `Hear ${entry.name} on your shelf`,
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
            <ChartPanel icon={MapPin} title="Where they found you">
              <BarList
                items={placesWhoStay.map((entry) => ({
                  label: entry.name,
                  count: entry.count,
                  href: collectionHref({ found: entry.name }),
                  ariaLabel: `Hear the records that found you in ${entry.name}`,
                }))}
              />
            </ChartPanel>
          ) : null}
          {yearsWhoStay.length > 0 ? (
            <ChartPanel icon={Calendar} title="When they found you">
              <BarList
                items={yearsWhoStay.map((entry) => ({
                  label: String(entry.year),
                  count: entry.count,
                  href: collectionHref({ when: entry.year }),
                  ariaLabel: `Hear the records that found you in ${entry.year}`,
                }))}
              />
            </ChartPanel>
          ) : null}
        </div>
      ) : null}

      {hasArrivedTimeline ? (
        <ChartPanel icon={CalendarPlus} title="When they arrived">
          <BarList
            items={arrivedYears.map((entry) => ({
              label: String(entry.year),
              count: entry.count,
              href: collectionHref({ arrived: entry.year }),
              ariaLabel: `Hear the records that arrived in ${entry.year}`,
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
      <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-text-tertiary uppercase">
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
    <div className="flex flex-col gap-4 rounded-rs-md border border-border bg-surface px-4 py-4">
      <h3 className="flex items-center gap-2 text-xs font-medium tracking-wide text-text-tertiary uppercase">
        <Icon className="size-3.5 shrink-0" aria-hidden />
        {title}
      </h3>
      {children}
    </div>
  );
}
