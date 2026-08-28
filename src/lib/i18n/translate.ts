import { messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/settings/types";

type MessageTree = (typeof messages)[Locale];

export function t(locale: Locale, path: string, vars?: Record<string, string | number>): string {
  const value = lookup(messages[locale] ?? messages.en, path);

  if (typeof value !== "string") {
    return path;
  }

  if (!vars) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (match, key: string) => {
    const next = vars[key];
    return next === undefined ? match : String(next);
  });
}

function lookup(tree: MessageTree, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in node) {
      return (node as Record<string, unknown>)[key];
    }

    return undefined;
  }, tree);
}
