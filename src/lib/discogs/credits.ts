export interface PressingCredit {
  name: string;
  verbs: string[];
}

const HEARD_ROLES: Array<{ test: RegExp; verb: string }> = [
  { test: /\bproduc/i, verb: "Produced" },
  { test: /\brecorded by\b/i, verb: "Recorded" },
  { test: /\bmixed\b/i, verb: "Mixed" },
  { test: /\bmastered\b/i, verb: "Mastered" },
];

const CREDIT_NAME_MAX = 3;

export function toPressingCredits(
  artists: ReadonlyArray<{ name?: string; role?: string }>,
): PressingCredit[] {
  const credits: PressingCredit[] = [];

  for (const artist of artists) {
    const name = displayCreditName(artist.name);

    if (!name) {
      continue;
    }

    const verbs = verbsFromRole(artist.role);

    if (verbs.length === 0) {
      continue;
    }

    const existing = credits.find((credit) => credit.name === name);

    if (existing) {
      for (const verb of verbs) {
        if (!existing.verbs.includes(verb)) {
          existing.verbs.push(verb);
        }
      }
      continue;
    }

    if (credits.length >= CREDIT_NAME_MAX) {
      continue;
    }

    credits.push({ name, verbs });
  }

  return credits;
}

export function pressingCreditLine(
  artists: ReadonlyArray<{ name?: string; role?: string }>,
): string | null {
  const credits = toPressingCredits(artists);

  if (credits.length === 0) {
    return null;
  }

  return credits.map(formatCredit).join(" · ");
}

function verbsFromRole(role: string | undefined): string[] {
  const haystack = role?.trim() ?? "";

  if (haystack.length === 0) {
    return [];
  }

  return HEARD_ROLES.filter((entry) => entry.test.test(haystack)).map((entry) => entry.verb);
}

function displayCreditName(name: string | undefined): string {
  return (name ?? "").replace(/\s+\(\d+\)$/, "").trim();
}

function formatCredit(credit: PressingCredit): string {
  return `${joinVerbs(credit.verbs)} by ${credit.name}`;
}

function joinVerbs(verbs: readonly string[]): string {
  if (verbs.length === 1) {
    return verbs[0] ?? "";
  }

  const [first, ...rest] = verbs;
  const lowered = rest.map((verb) => verb.toLowerCase());

  if (lowered.length === 1) {
    return `${first} and ${lowered[0]}`;
  }

  const last = lowered.at(-1);
  const middle = lowered.slice(0, -1).join(", ");
  return `${first}, ${middle}, and ${last}`;
}
