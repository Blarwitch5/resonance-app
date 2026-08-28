import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export interface MarketplaceAsk {
  lowestPrice: { value: number; currency: string } | null;
  copiesWaiting: number;
}

export function parseMarketplaceStats(payload: unknown): MarketplaceAsk | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  return {
    lowestPrice: parsePrice(record.lowest_price),
    copiesWaiting: parseCopies(record.num_for_sale),
  };
}

export function marketplaceVoice(locale: Locale, ask: MarketplaceAsk): string {
  if (ask.lowestPrice) {
    return t(locale, "market.asks", {
      price: formatAskPrice(locale, ask.lowestPrice.value, ask.lowestPrice.currency),
    });
  }

  if (ask.copiesWaiting === 1) {
    return t(locale, "market.waitingOne");
  }

  if (ask.copiesWaiting > 1) {
    return t(locale, "market.waiting", { count: ask.copiesWaiting });
  }

  return t(locale, "market.quiet");
}

function parsePrice(value: unknown): MarketplaceAsk["lowestPrice"] {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const amount = record.value;
  const currency = record.currency;

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    return null;
  }

  if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
    return null;
  }

  return { value: amount, currency };
}

function parseCopies(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return 0;
  }

  return value;
}

function formatAskPrice(locale: Locale, value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}
