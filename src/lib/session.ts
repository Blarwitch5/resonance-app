import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { RESONANCE_PATH_HEADER, signInHref } from "@/lib/auth-path";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    const next = (await headers()).get(RESONANCE_PATH_HEADER);
    redirect(signInHref(next));
  }

  return session;
}
