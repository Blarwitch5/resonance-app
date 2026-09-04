import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";

import { getDb } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { developmentAuthOrigins } from "@/lib/auth-origins";
import { getEnv } from "@/lib/env";
import { resetPasswordMailHref } from "@/lib/mail/reset-href";
import { sendResetPasswordMail } from "@/lib/mail/reset-password";

const env = getEnv();

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    env.BETTER_AUTH_URL,
    ...(env.NODE_ENV === "development" ? developmentAuthOrigins() : []),
  ],
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user: recipient, token }) => {
      await sendResetPasswordMail({
        name: recipient.name,
        email: recipient.email,
        url: resetPasswordMailHref(env.BETTER_AUTH_URL, token),
      });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [nextCookies()],
});
