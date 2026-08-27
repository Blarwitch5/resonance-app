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
): PressingCopyVoice {
  if (kind === "catalog") {
    return {
      ariaLabel: copied ? "Catalog copied" : `Copy catalog ${value}`,
      label: copied ? "Copied" : value,
      error: "That catalog number could not be copied.",
    };
  }

  return {
    ariaLabel: copied ? "Barcode copied" : `Copy barcode ${value}`,
    label: copied ? "Copied" : value,
    error: "That barcode could not be copied.",
  };
}
