"use client";

import { Heart, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState, type ChangeEvent } from "react";

import { useT } from "@/components/locale-provider";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { SelectField } from "@/components/ui/field";
import { formatIcons } from "@/components/ui/format-tokens";
import {
  collectionFilterCount,
  ensureNamedFacet,
  ensureYearFacet,
  hasCollectionFacets,
  type CollectionFacets,
} from "@/lib/collection/facets";
import { collectionHref } from "@/lib/collection/href";
import { MEDIA_FORMATS, type CollectionQuery, type MediaFormat } from "@/lib/collection/types";

interface ShelfFilterSheetProps {
  listen: CollectionQuery;
  facets: CollectionFacets;
  enabledFormats: readonly MediaFormat[];
}

const EMPTY_VALUE = "";

const filterChipClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium text-text-secondary transition-colors outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong aria-pressed:border-transparent aria-pressed:bg-primary-soft aria-pressed:text-on-primary-soft sm:px-4";

export function ShelfFilterSheet({ listen, facets, enabledFormats }: ShelfFilterSheetProps) {
  const t = useT();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();
  const yearId = useId();
  const artistId = useId();
  const styleId = useId();
  const labelId = useId();
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const formats = MEDIA_FORMATS.filter(
    (format) => enabledFormats.includes(format) || format === listen.format,
  );
  const years = ensureYearFacet(facets.years, listen.year);
  const artists = ensureNamedFacet(facets.artists, listen.artist);
  const styles = ensureNamedFacet(facets.genres, listen.genre);
  const labels = ensureNamedFacet(facets.labels, listen.label);
  const activeCount = collectionFilterCount(listen) + (listen.keptClose ? 1 : 0);
  const canOpen = hasCollectionFacets(facets) || activeCount > 0 || formats.length > 0;

  if (!canOpen) {
    return null;
  }

  function go(next: CollectionQuery): void {
    try {
      router.push(collectionHref(next), { scroll: false });
    } catch {
      // Navigation was cancelled — keep the sheet open.
    }
  }

  function onYearChange(event: ChangeEvent<HTMLSelectElement>): void {
    const raw = event.target.value;

    if (raw === EMPTY_VALUE) {
      go({ ...listen, year: undefined, decade: undefined });
      return;
    }

    const year = Number.parseInt(raw, 10);
    go({
      ...listen,
      year: Number.isInteger(year) ? year : undefined,
    });
  }

  function onArtistChange(event: ChangeEvent<HTMLSelectElement>): void {
    const raw = event.target.value;
    go({
      ...listen,
      artist: raw === EMPTY_VALUE ? undefined : raw,
    });
  }

  function onStyleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const raw = event.target.value;
    go({
      ...listen,
      genre: raw === EMPTY_VALUE ? undefined : raw,
    });
  }

  function onLabelChange(event: ChangeEvent<HTMLSelectElement>): void {
    const raw = event.target.value;
    go({
      ...listen,
      label: raw === EMPTY_VALUE ? undefined : raw,
    });
  }

  function onFormatPick(format: MediaFormat | undefined): void {
    go({
      ...listen,
      format,
    });
  }

  function onKeptToggle(): void {
    go({
      ...listen,
      keptClose: !listen.keptClose,
    });
  }

  function onClear(): void {
    go({
      query: listen.query,
      sort: listen.sort,
    });
    close();
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        aria-label={
          activeCount > 0 ? t("filter.openActive", { count: activeCount }) : t("filter.openAria")
        }
        onClick={() => setIsOpen(true)}
        className={`group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-2.5 text-sm font-medium transition-colors outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong sm:px-4 ${
          activeCount > 0
            ? "border-transparent bg-primary-soft text-on-primary-soft"
            : "border-border text-text-secondary"
        }`}
      >
        <ListFilter className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
        <span className="sr-only sm:not-sr-only">{t("filter.open")}</span>
        {activeCount > 0 ? (
          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-on-primary">
            {activeCount}
          </span>
        ) : null}
      </button>
      {isOpen ? (
        <BottomSheet
          id={dialogId}
          title={t("filter.title")}
          description={t("filter.description")}
          onClose={close}
        >
          <div className="flex flex-col gap-4">
            {formats.length > 0 ? (
              <fieldset className={fieldsetClass}>
                <legend className={legendClass}>{t("filter.format")}</legend>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={filterChipClass}
                    aria-pressed={!listen.format}
                    onClick={() => onFormatPick(undefined)}
                  >
                    {t("format.all")}
                  </button>
                  {formats.map((format) => {
                    const Icon = formatIcons[format];
                    const isActive = listen.format === format;

                    return (
                      <button
                        key={format}
                        type="button"
                        className={`${filterChipClass} capitalize`}
                        aria-pressed={isActive}
                        onClick={() => onFormatPick(isActive ? undefined : format)}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        {t(`format.${format}`)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <button
              type="button"
              className={filterChipClass}
              aria-pressed={Boolean(listen.keptClose)}
              onClick={onKeptToggle}
            >
              <Heart
                className={`size-4 shrink-0 ${listen.keptClose ? "fill-current" : ""}`}
                aria-hidden
              />
              {t("collection.keptClose")}
            </button>

            {years.length > 0 ? (
              <SelectField
                id={yearId}
                label={t("filter.year")}
                value={listen.year !== undefined ? String(listen.year) : EMPTY_VALUE}
                onChange={onYearChange}
              >
                <option value={EMPTY_VALUE}>{t("filter.any")}</option>
                {years.map((entry) => (
                  <option key={entry.year} value={entry.year}>
                    {entry.year}
                  </option>
                ))}
              </SelectField>
            ) : null}

            {artists.length > 0 ? (
              <SelectField
                id={artistId}
                label={t("filter.artist")}
                value={listen.artist ?? EMPTY_VALUE}
                onChange={onArtistChange}
              >
                <option value={EMPTY_VALUE}>{t("filter.any")}</option>
                {artists.map((entry) => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name}
                  </option>
                ))}
              </SelectField>
            ) : null}

            {styles.length > 0 ? (
              <SelectField
                id={styleId}
                label={t("filter.style")}
                value={listen.genre ?? EMPTY_VALUE}
                onChange={onStyleChange}
              >
                <option value={EMPTY_VALUE}>{t("filter.any")}</option>
                {styles.map((entry) => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name}
                  </option>
                ))}
              </SelectField>
            ) : null}

            {labels.length > 0 ? (
              <SelectField
                id={labelId}
                label={t("filter.label")}
                value={listen.label ?? EMPTY_VALUE}
                onChange={onLabelChange}
              >
                <option value={EMPTY_VALUE}>{t("filter.any")}</option>
                {labels.map((entry) => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name}
                  </option>
                ))}
              </SelectField>
            ) : null}

            {activeCount > 0 ? (
              <Button type="button" variant="ghost" className="self-start" onClick={onClear}>
                {t("filter.clear")}
              </Button>
            ) : null}
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
