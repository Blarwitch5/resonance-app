"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { ResonanceMark } from "@/components/ui/resonance-mark";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ retry }: ErrorPageProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <ResonanceMark size="md" className="mx-auto" />
        <p className="mt-4 text-sm font-medium tracking-[0.28em] text-primary uppercase">Resonance</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text">The signal wavered.</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Something quiet went wrong. Your shelf is still here.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => retry()}>
            Try again
          </Button>
          <ButtonLink href="/collection" variant="ghost">
            Back to Collection
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
