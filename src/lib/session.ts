import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "@/lib/auth";
import { RESONANCE_PATH_HEADER, signInHref } from "@/lib/auth-path";

export const getSession = cache(async () => {
  const requestHeaders = await headers();

  return getAuth().api.getSession({
    headers: requestHeaders,
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
