const FALLBACK = "/collection";
const MAX_NEXT_HREF = 512;
const ALLOWED_PREFIXES = ["/collection", "/explorer", "/profile", "/welcome"] as const;

export const RESONANCE_PATH_HEADER = "x-resonance-path";

export function safeNextHref(raw: string | null | undefined): string {
  if (!raw) {
    return FALLBACK;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_NEXT_HREF) {
    return FALLBACK;
  }

  let url: URL;

  try {
    url = new URL(trimmed, "https://resonance.invalid");
  } catch {
    return FALLBACK;
  }

  if (url.origin !== "https://resonance.invalid" || url.username || url.password) {
    return FALLBACK;
  }

  const pathname = url.pathname;

  if (pathname === "/sign-in" || pathname === "/sign-up" || pathname.startsWith("/api")) {
    return FALLBACK;
  }

  const isAllowed = ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isAllowed) {
    return FALLBACK;
  }

  return `${pathname}${url.search}`;
}

export function signInHref(raw: string | null | undefined): string {
  return doorHref("/sign-in", raw);
}

export function signUpHref(raw: string | null | undefined): string {
  return doorHref("/sign-up", raw);
}

function doorHref(path: "/sign-in" | "/sign-up", raw: string | null | undefined): string {
  const next = safeNextHref(raw);

  if (next === FALLBACK) {
    return path;
  }

  return `${path}?next=${encodeURIComponent(next)}`;
}
