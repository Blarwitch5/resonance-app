import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WelcomeForm } from "@/app/welcome/welcome-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { hasShelfItems } from "@/lib/collection/repository";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";

export const metadata: Metadata = {
  title: "Welcome",
};

export default async function WelcomePage() {
  const session = await requireSession();
  const [settings, hasItems] = await Promise.all([
    getUserSettings(session.user.id),
    hasShelfItems(session.user.id),
  ]);

  if (settings.onboardedAt !== null || hasItems) {
    redirect("/collection");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="ripple-in w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className="mt-4 text-sm font-medium tracking-[0.28em] text-primary uppercase">Resonance</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">Your shelf is waiting.</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          This is not a catalogue. It is a quiet place for the records that stay with you.
        </p>
        <div className="mt-8">
          <WelcomeForm />
        </div>
      </div>
    </div>
  );
}
