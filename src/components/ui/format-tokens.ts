import { CassetteTape, Disc, Disc3 } from "lucide-react";

import { FORMAT_LABELS, type MediaFormat } from "@/lib/collection/types";

export const formatLabels = FORMAT_LABELS;

export const formatIcons: Record<MediaFormat, typeof Disc> = {
  vinyl: Disc3,
  cassette: CassetteTape,
  cd: Disc,
};

export const formatChipClasses: Record<MediaFormat, string> = {
  vinyl: "bg-primary-soft text-on-primary-soft",
  cassette: "bg-secondary-soft text-on-secondary-soft",
  cd: "bg-info-soft text-info",
};

export const formatFillClasses: Record<MediaFormat, string> = {
  vinyl: "fill-vinyl",
  cassette: "fill-cassette",
  cd: "fill-cd",
};

export const formatSwatchClasses: Record<MediaFormat, string> = {
  vinyl: "bg-vinyl",
  cassette: "bg-cassette",
  cd: "bg-cd",
};

export const formatRingClasses: Record<MediaFormat, string> = {
  vinyl: "border-vinyl",
  cassette: "border-cassette",
  cd: "border-cd",
};
