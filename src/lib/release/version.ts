import { APP_VERSION } from "@/lib/release/current";
import { formatSemver, parseSemver, type Semver } from "@/lib/release/semver";

export { APP_VERSION };

export function appSemver(): Semver {
  return parseSemver(APP_VERSION);
}

export function appVersionLabel(): string {
  return formatSemver(appSemver());
}
