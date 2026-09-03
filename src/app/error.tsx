"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { useT } from "@/components/locale-provider";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ErrorPage({ retry }: ErrorPageProps) {
  const t = useT();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <ResonanceMark size="md" className="mx-auto" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className={`mt-3 ${displayTitleClass}`}>{t("errorPage.title")}</h1>
        <p className={`mt-2 ${bodyClass}`}>
          {t("errorPage.body")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => retry()}>
            {t("errorPage.retry")}
          </Button>
          <ButtonLink href="/collection" variant="ghost">
            {t("back.collection")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
