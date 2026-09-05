export const RELEASE_KINDS = ["major", "minor", "patch"] as const;

export type ReleaseKind = (typeof RELEASE_KINDS)[number];

export interface Semver {
  major: number;
  minor: number;
  patch: number;
}

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseSemver(value: string): Semver {
  const match = SEMVER.exec(value.trim());
  const major = match ? Number(match[1]) : Number.NaN;
  const minor = match ? Number(match[2]) : Number.NaN;
  const patch = match ? Number(match[3]) : Number.NaN;

  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    throw new Error(`This version is not semver: ${value}`);
  }

  return { major, minor, patch };
}

export function formatSemver(version: Semver): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}

export function bumpSemver(version: Semver, kind: ReleaseKind): Semver {
  if (kind === "major") {
    return { major: version.major + 1, minor: 0, patch: 0 };
  }

  if (kind === "minor") {
    return { major: version.major, minor: version.minor + 1, patch: 0 };
  }

  return { major: version.major, minor: version.minor, patch: version.patch + 1 };
}

export function parseReleaseKind(value: string | undefined): ReleaseKind | null {
  return RELEASE_KINDS.find((kind) => kind === value) ?? null;
}

export function compareSemver(left: Semver, right: Semver): number {
  if (left.major !== right.major) {
    return left.major - right.major;
  }

  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }

  return left.patch - right.patch;
}
