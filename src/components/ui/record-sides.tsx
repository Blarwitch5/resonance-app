import { ListMusic } from "lucide-react";

import { SectionHeading } from "@/components/ui/page-header";
import { RecordSamplePlayer } from "@/components/ui/record-sample-player";
import { RecordSideHeading } from "@/components/ui/record-side-heading";
import { pressingListen } from "@/lib/collection/runtime";
import type { RecordSide } from "@/lib/collection/types";
import { hasDeezerPreview } from "@/lib/deezer/preview";

interface RecordSidesProps {
  sides: RecordSide[];
  artist?: string;
  title?: string;
  coverUrl?: string | null;
}

export function RecordSides({ sides, artist, title, coverUrl }: RecordSidesProps) {
  if (sides.length === 0) {
    return null;
  }

  const listen = pressingListen(sides);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="record-sides-heading">
      <div className="flex flex-col gap-2">
        <SectionHeading id="record-sides-heading" icon={ListMusic}>
          On this record
        </SectionHeading>
        {listen ? <p className="text-sm leading-6 text-text-secondary">{listen}</p> : null}
      </div>
      {hasDeezerPreview(sides) ? (
        <RecordSamplePlayer sides={sides} artist={artist} title={title} coverUrl={coverUrl} />
      ) : (
        <StaticRecordSides sides={sides} />
      )}
    </section>
  );
}

function StaticRecordSides({ sides }: RecordSidesProps) {
  const showRuntime = sides.length > 1;

  return (
    <div className="flex flex-col gap-6">
      {sides.map((side, sideIndex) => (
        <div key={`${side.heading ?? "side"}-${sideIndex}`} className="flex flex-col gap-3">
          <RecordSideHeading side={side} showRuntime={showRuntime} />
          <ol className="flex flex-col" aria-label={side.heading ?? "Tracks"}>
            {side.tracks.map((track, trackIndex) => (
              <li
                key={`${track.position}-${track.title}-${trackIndex}`}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-border-subtle py-2 last:border-b-0"
              >
                <span className="font-mono text-xs leading-5 text-text-tertiary">{track.position || "·"}</span>
                <span className="text-sm leading-6 text-text">{track.title}</span>
                <span className="font-mono text-xs leading-5 tabular-nums text-text-tertiary">
                  {track.duration ?? ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
