"use client";

import { FaceSlightlySmilingPlus } from "lucide-react";
import { useActionState, useState } from "react";

import { completeOnboardingAction, type WelcomeState } from "@/app/welcome/actions";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { formatIcons } from "@/components/ui/format-icon";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import { MEDIA_FORMATS } from "@/lib/collection/types";

const initialState: WelcomeState = { error: null };

export function WelcomeForm() {
  const t = useT();
  const [step, setStep] = useState<"arrive" | "formats">("arrive");
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  if (step === "arrive") {
    return (
      <div className="flex flex-col gap-3">
        <Button type="button" className="w-full" onClick={() => setStep("formats")}>
          {t("common.continue")}
        </Button>
        <SkipButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex flex-col gap-6">
        <input type="hidden" name="intent" value="start" />
        <fieldset className={fieldsetClass}>
          <legend className={legendClass}>{t("welcome.whatLives")}</legend>
          <p className="text-sm leading-6 text-text-secondary">
            {t("welcome.formatsHint")}
          </p>
          <div className="flex flex-wrap gap-2">
            {MEDIA_FORMATS.map((format) => {
              const Icon = formatIcons[format];

              return (
                <label key={format} className={choiceChipClass}>
                  <input
                    type="checkbox"
                    name={`${format}Enabled`}
                    defaultChecked={format === "vinyl"}
                    className="sr-only"
                  />
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {t(`format.${format}`)}
                </label>
              );
            })}
          </div>
        </fieldset>
        {state.error ? <Notice tone="error">{state.error}</Notice> : null}
        <Button type="submit" disabled={isPending} className="w-full">
          <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
          {isPending ? t("welcome.opening") : t("welcome.openShelf")}
        </Button>
      </form>
      <SkipButton />
    </div>
  );
}

function SkipButton() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="intent" value="skip" />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Button type="submit" variant="ghost" disabled={isPending} className="w-full">
        {isPending ? t("welcome.opening") : t("welcome.wander")}
      </Button>
    </form>
  );
}
