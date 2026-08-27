import { ExternalLink } from "lucide-react";

interface DiscogsPressingLinkProps {
  href: string;
  title: string;
}

export function DiscogsPressingLink({ href, title }: DiscogsPressingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${title} on Discogs`}
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      <ExternalLink className="size-4 shrink-0" aria-hidden />
      This pressing on Discogs
    </a>
  );
}
