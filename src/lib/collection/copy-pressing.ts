import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export type PressingCopyKind = "barcode" | "catalog";

export interface PressingCopyVoice {
  ariaLabel: string;
  label: string;
  error: string;
}

export function pressingCopyVoice(
  kind: PressingCopyKind,
  value: string,
  copied: boolean,
  locale: Locale = "en",
): PressingCopyVoice {
  if (kind === "catalog") {
    return {
      ariaLabel: copied ? t(locale, "copy.catalogCopied") : t(locale, "copy.catalogAria", { value }),
      label: copied ? t(locale, "common.copied") : value,
      error: t(locale, "copy.catalogError"),
    };
  }

  return {
    ariaLabel: copied ? t(locale, "copy.barcodeCopied") : t(locale, "copy.barcodeAria", { value }),
    label: copied ? t(locale, "common.copied") : value,
    error: t(locale, "copy.barcodeError"),
  };
}
