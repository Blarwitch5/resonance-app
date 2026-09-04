export const CREDENTIAL_ACCOUNT_ISSUER = "local:credential";

export interface DeployEnv {
  BETTER_AUTH_URL?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

export function developmentAuthOrigins(): string[] {
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ];
}

export function resolvedAuthUrl(env: DeployEnv): string | undefined {
  const explicit = env.BETTER_AUTH_URL?.trim();

  if (explicit) {
    return explicit;
  }

  const host =
    env.VERCEL_ENV === "production"
      ? env.VERCEL_PROJECT_PRODUCTION_URL ?? env.VERCEL_URL
      : env.VERCEL_URL;

  return host ? asHttpsOrigin(host) : undefined;
}

export function vercelAuthOrigins(env: DeployEnv): string[] {
  return uniqueOrigins(
    [env.VERCEL_PROJECT_PRODUCTION_URL, env.VERCEL_URL]
      .filter((host): host is string => Boolean(host))
      .map(asHttpsOrigin),
  );
}

export function uniqueOrigins(...groups: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>();
  const origins: string[] = [];

  for (const group of groups) {
    for (const origin of group) {
      if (seen.has(origin)) {
        continue;
      }

      seen.add(origin);
      origins.push(origin);
    }
  }

  return origins;
}

function asHttpsOrigin(host: string): string {
  if (host.startsWith("http://") || host.startsWith("https://")) {
    return host;
  }

  return `https://${host}`;
}
