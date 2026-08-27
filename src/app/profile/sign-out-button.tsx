"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { authClient } from "@/lib/auth-client";
import { toErrorMessage } from "@/lib/errors";

export function SignOutButton() {
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
      setError(toErrorMessage(caught));
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        {isSigningOut ? "Leaving…" : "Sign out"}
      </Button>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

