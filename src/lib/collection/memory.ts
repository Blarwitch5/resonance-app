const MAX_EXCERPT = 120;

export function memoryExcerpt(notes: string | null | undefined): string | undefined {
  if (!notes) {
    return undefined;
  }

  for (const raw of notes.split("\n")) {
    const line = raw.trim().replace(/\s+/g, " ");

    if (line.length === 0) {
      continue;
    }

    if (line.length <= MAX_EXCERPT) {
      return line;
    }

    const sliced = line.slice(0, MAX_EXCERPT);
    const lastSpace = sliced.lastIndexOf(" ");
    const clipped = (lastSpace > 48 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
    return `${clipped}…`;
  }

  return undefined;
}
