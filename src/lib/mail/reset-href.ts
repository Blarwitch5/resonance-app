/** Door the reset letter opens — session-gated callback, then /reset-password?token=. */
export function resetPasswordMailHref(origin: string, token: string): string {
  const base = origin.replace(/\/$/, "");
  const callback = encodeURIComponent("/reset-password");
  return `${base}/api/auth/reset-password/${encodeURIComponent(token)}?callbackURL=${callback}`;
}
