import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { glassPanelClass } from "@/components/ui/chrome";

export const metadata: Metadata = {
  title: "Tokens",
};

interface Swatch {
  name: string;
  bg: string;
  fg?: string;
  note?: string;
}

const identity: Swatch[] = [
  { name: "vinyl / primary", bg: "bg-vinyl text-on-primary", note: "CTA + format vinyl" },
  { name: "cassette / secondary", bg: "bg-cassette text-on-secondary", note: "Action secondaire" },
  { name: "cd", bg: "bg-cd text-on-primary", note: "Identité format seulement" },
];

const surfacesLight: Swatch[] = [
  { name: "background", bg: "bg-background text-text" },
  { name: "surface", bg: "bg-surface text-text" },
  { name: "surface-elevated", bg: "bg-surface-elevated text-text" },
  { name: "surface-pressed", bg: "bg-surface-pressed text-text" },
];

const textOnBg: Swatch[] = [
  { name: "text", bg: "bg-background text-text", note: "Body, titres" },
  { name: "text-secondary", bg: "bg-background text-text-secondary", note: "Meta" },
  { name: "text-tertiary", bg: "bg-background text-text-tertiary", note: "Hints only" },
  { name: "text-disabled", bg: "bg-background text-text-disabled", note: "Disabled only" },
];

const pairs: Swatch[] = [
  { name: "primary + on-primary", bg: "bg-primary text-on-primary", note: "Bouton unique" },
  { name: "primary-soft + on-primary-soft", bg: "bg-primary-soft text-on-primary-soft", note: "Nav / chip" },
  { name: "secondary + on-secondary", bg: "bg-secondary text-on-secondary" },
  { name: "error + on-error", bg: "bg-error text-on-error", note: "Action destructive" },
  { name: "error-soft + error", bg: "bg-error-soft text-error" },
  { name: "success + success-soft", bg: "bg-success-soft text-success" },
  { name: "warning + warning-soft", bg: "bg-warning-soft text-warning" },
  { name: "info + info-soft", bg: "bg-info-soft text-info" },
];

function SwatchGrid({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.name} className={`rounded-rs-md border border-border px-4 py-6 ${item.bg}`}>
            <p className="font-medium">{item.name}</p>
            {item.note ? <p className="mt-1 text-sm opacity-80">{item.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DesignTokensPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm font-medium tracking-[0.28em] text-primary uppercase">Dev only</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text">Design tokens</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        Palette validée. CTA = primary + on-primary. Chip / nav = primary-soft. Accent = focus et
        ondes, jamais un bouton. Change le thème OS ou localStorage <code>resonance-theme</code>.
      </p>

      <SwatchGrid title="Identité format" items={identity} />
      <SwatchGrid title="Surfaces" items={surfacesLight} />
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-text">Glass chrome</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Sidebar and the PWA tabs. Inset from the screen edge. Cards stay matte.
        </p>
        <div className="relative mt-4 overflow-hidden rounded-rs-lg bg-background p-8">
          <div className={`rounded-rs-lg px-6 py-8 text-text ${glassPanelClass}`}>
            <p className="font-medium">glass + glass-border</p>
            <p className="mt-1 text-sm text-text-secondary">backdrop-blur-xl · saturate via theme</p>
          </div>
        </div>
      </section>
      <SwatchGrid title="Texte sur background" items={textOnBg} />
      <SwatchGrid title="Paires contrastées (AA)" items={pairs} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-text">Typo + radius</h2>
        <div className="mt-4 space-y-3 rounded-rs-lg border border-border bg-surface p-6">
          <p className="font-sans text-3xl font-semibold text-text">Poppins · Resonance</p>
          <p className="font-mono text-sm text-text-secondary">JetBrains Mono · 01 / barcode</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="rounded-rs-sm bg-primary-soft px-3 py-2 text-sm text-on-primary-soft">
              rounded-rs-sm
            </span>
            <span className="rounded-rs-md bg-primary-soft px-3 py-2 text-sm text-on-primary-soft">
              rounded-rs-md
            </span>
            <span className="rounded-rs-lg bg-primary-soft px-3 py-2 text-sm text-on-primary-soft">
              rounded-rs-lg
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
