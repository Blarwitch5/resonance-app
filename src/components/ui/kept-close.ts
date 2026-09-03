export function keptCloseCoverRevealClass(isFavorite: boolean): string {
  const base = "absolute top-2 right-2 z-10";

  if (isFavorite) {
    return base;
  }

  return `${base} lg:pointer-events-none lg:opacity-0 motion-safe:lg:transition-opacity lg:group-hover:pointer-events-auto lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:opacity-100`;
}
