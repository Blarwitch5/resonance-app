export type ChartTone = "vinyl" | "cassette" | "cd";

export const chartFillClasses: Record<ChartTone, string> = {
  vinyl: "bg-vinyl",
  cassette: "bg-cassette",
  cd: "bg-cd",
};

export const chartTrackClasses: Record<ChartTone, string> = {
  vinyl: "bg-primary-soft",
  cassette: "bg-secondary-soft",
  cd: "bg-info-soft",
};
