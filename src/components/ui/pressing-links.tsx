import { ScanSearch } from "lucide-react";
import Link from "next/link";

import { DiscogsPressingLink } from "@/components/ui/discogs-pressing-link";
import { SharePressingButton } from "@/components/ui/share-pressing-button";

interface PressingLinksProps {
  title: string;
  artist: string;
  href?: string | null;
  elsewhereHref: string;
}

export function PressingLinks({ href, title, artist, elsewhereHref }: PressingLinksProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-6">
      {href ? (
        <>
          <DiscogsPressingLink href={href} title={title} />
          <SharePressingButton href={href} title={title} artist={artist} />
        </>
      ) : null}
      <Link
        href={elsewhereHref}
        aria-label={`Hear other pressings of ${title} by ${artist}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <ScanSearch className="size-4 shrink-0" aria-hidden />
        Hear it elsewhere
      </Link>
    </div>
  );
}
