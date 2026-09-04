"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useLocale, useT } from "@/components/locale-provider";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";

interface SignOutButtonProps {
  layout?: "sheet" | "rail";
}

export function SignOutButton({ layout = "sheet" }: SignOutButtonProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setError(null);
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(localizedError(locale, caught));
      setIsSigningOut(false);
    }
  }

  const label = isSigningOut ? t("profile.leaving") : t("profile.signOut");

  if (layout === "rail") {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
          aria-busy={isSigningOut}
          className="group flex min-h-11 w-full items-center gap-3 rounded-rs-md px-3 text-sm font-medium text-text-secondary outline-none hover:bg-surface-pressed hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong disabled:opacity-50"
        >
          <BusyGlyph isBusy={isSigningOut}>
            <LogOut className="size-5 motion-safe:group-hover:vibrato" aria-hidden />
          </BusyGlyph>
          {label}
        </button>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        aria-busy={isSigningOut}
      >
        <BusyGlyph isBusy={isSigningOut}>
          <LogOut className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {label}
      </Button>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
