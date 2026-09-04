import "server-only";

import { z } from "zod";

import { deployEnvFrom, resolvedAuthUrl } from "@/lib/auth-origins";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  DISCOGS_CONSUMER_KEY: z.string().min(1),
  DISCOGS_CONSUMER_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().min(3).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("; ");
}

export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    ...process.env,
    BETTER_AUTH_URL: resolvedAuthUrl(deployEnvFrom(process.env)) ?? process.env.BETTER_AUTH_URL,
  });

  if (!parsed.success) {
    throw new Error(`Invalid environment variables (${formatEnvError(parsed.error)})`);
  }

  return parsed.data;
}
