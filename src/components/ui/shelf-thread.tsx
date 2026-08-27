import { Fragment } from "react";

import { ThreadLink } from "@/components/ui/pressing-threads";
import type { ShelfCardThread } from "@/lib/collection/shelf-threads";

interface ShelfThreadProps {
  thread: ShelfCardThread;
  className: string;
}

export function ShelfThread({ thread, className }: ShelfThreadProps) {
  if (thread.href && thread.ariaLabel) {
    return (
      <span className={className}>
        <ThreadLink href={thread.href} ariaLabel={thread.ariaLabel}>
          {thread.label}
        </ThreadLink>
      </span>
    );
  }

  return <span className={className}>{thread.label}</span>;
}

export function ShelfThreadLine({
  threads,
  className,
}: {
  threads: Array<ShelfCardThread | null | undefined>;
  className: string;
}) {
  const visible = threads.filter((thread): thread is ShelfCardThread => thread != null);

  if (visible.length === 0) {
    return null;
  }

  return (
    <p className={`flex min-w-0 flex-wrap items-center gap-x-2 ${className}`}>
      {visible.map((thread, index) => (
        <Fragment key={`${thread.label}:${index}`}>
          {index > 0 ? <span aria-hidden>·</span> : null}
          <ShelfThread thread={thread} className={index === 0 ? "truncate" : "text-text-tertiary"} />
        </Fragment>
      ))}
    </p>
  );
}
