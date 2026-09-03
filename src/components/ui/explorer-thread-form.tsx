"use client";

import { Calendar, Music, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { useLocale, useT } from "@/components/locale-provider";
import { MAX_GENRE_FILTER, MAX_LABEL_FILTER } from "@/lib/collection/types";
import { explorerSearchHref, type ExplorerQuery } from "@/lib/discogs/href";
import { explorerThreadFromFields } from "@/lib/discogs/threads";
import { decadeName } from "@/lib/i18n/labels";

interface ExplorerThreadFormProps {
  listen: ExplorerQuery;
  idPrefix: string;
  dense?: boolean;
}

export function ExplorerThreadForm({ listen, idPrefix, dense = false }: ExplorerThreadFormProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const thread = explorerThreadFromFields({
      genre: String(data.get("genre") ?? ""),
      label: String(data.get("label") ?? ""),
      year: String(data.get("year") ?? ""),
    });

    try {
      await router.push(
        explorerSearchHref({
          query: listen.query,
          format: listen.format,
          ...thread,
        }),
      );
    } catch {
      // Navigation was cancelled — stay on the current listen.
    }
  }

  return (
    <form
      action="/explorer"
      method="get"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      className={dense ? "grid grid-cols-3 gap-3" : "flex flex-col gap-3"}
    >
      <TextField
        id={`${idPrefix}-genre`}
        name="genre"
        label={t("thread.genre")}
        defaultValue={listen.genre ?? ""}
        maxLength={MAX_GENRE_FILTER}
        placeholder={t("thread.genrePlaceholder")}
        autoComplete="off"
        icon={Music}
      />
      <TextField
        id={`${idPrefix}-label`}
        name="label"
        label={t("thread.label")}
        defaultValue={listen.label ?? ""}
        maxLength={MAX_LABEL_FILTER}
        placeholder={t("thread.labelPlaceholder")}
        autoComplete="off"
        icon={Tag}
      />
      <TextField
        id={`${idPrefix}-year`}
        name="year"
        label={t("thread.year")}
        defaultValue={
          listen.year !== undefined
            ? String(listen.year)
            : listen.decade !== undefined
              ? decadeName(locale, listen.decade)
              : ""
        }
        maxLength={16}
        placeholder={t("thread.yearPlaceholder")}
        autoComplete="off"
        icon={Calendar}
      />
      <Button type="submit" className={dense ? "col-span-3 self-start" : "self-start"}>
        {t("thread.follow")}
      </Button>
    </form>
  );
}
