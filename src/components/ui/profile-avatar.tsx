"use client";

import Image from "next/image";
import { useState } from "react";

import type { MediaFormat } from "@/lib/collection/types";
import { initialsFromName } from "@/lib/profile/types";

const RING_CLASS: Record<MediaFormat, string> = {
  vinyl: "border-vinyl",
  cassette: "border-cassette",
  cd: "border-cd",
};

const RING_INSET = ["inset-0", "-inset-1", "-inset-2"] as const;
const RING_DELAY = ["delay-0", "delay-200", "delay-500"] as const;

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string | null;
  formats: MediaFormat[];
}

export function ProfileAvatar({ name, imageUrl = null, formats }: ProfileAvatarProps) {
  const initials = initialsFromName(name);
  const rings = formats.slice(0, 3);

  return (
    <div className="p-2">
      <div className="relative size-20 shrink-0">
        {rings.map((format, index) => (
          <span
            key={format}
            className={`pointer-events-none absolute rounded-full border motion-safe:avatar-wave ${RING_CLASS[format]} ${RING_INSET[index] ?? "inset-0"} ${RING_DELAY[index] ?? "delay-0"}`}
            aria-hidden
          />
        ))}
        <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-lg font-semibold text-on-primary-soft">
          <PortraitStill url={imageUrl} name={name} initials={initials} />
        </div>
      </div>
    </div>
  );
}

function PortraitStill({
  url,
  name,
  initials,
}: {
  url: string | null;
  name: string;
  initials: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return <span aria-hidden>{initials}</span>;
  }

  return (
    <Image
      src={url}
      alt={name}
      width={80}
      height={80}
      unoptimized
      onError={() => setFailed(true)}
      className="size-20 object-cover"
    />
  );
}
