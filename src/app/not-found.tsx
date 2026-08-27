import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { ResonanceMark } from "@/components/ui/resonance-mark";

export const metadata: Metadata = {
  title: "Nothing here resonates",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <ResonanceMark size="md" className="mx-auto" />
        <p className="mt-4 text-sm font-medium tracking-[0.28em] text-primary uppercase">Resonance</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">Nothing here resonates.</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          This page is not on the shelf. The records you keep are still waiting.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/collection">Back to Collection</ButtonLink>
          <ButtonLink href="/explorer" variant="ghost">
            Find a record
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
