import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface ChipLinkProps {
  href: string;
  isActive: boolean;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function ChipLink({
  href,
  isActive,
  children,
  className = "",
  "aria-label": ariaLabel,
}: ChipLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong ${
        isActive
          ? "border-transparent bg-primary-soft text-on-primary-soft"
          : "border-border text-text-secondary"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export const choiceChipClass =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-text transition-colors has-checked:border-transparent has-checked:bg-primary-soft has-checked:text-on-primary-soft has-focus-visible:ring-2 has-focus-visible:ring-border-strong";

interface ChipButtonProps {
  isActive: boolean;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function ChipButton({
  isActive,
  children,
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
}: ChipButtonProps) {
  return (
    <button
      type="submit"
      aria-pressed={isActive}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong disabled:pointer-events-none lg:px-4 ${
        isActive
          ? "border-transparent bg-primary-soft text-on-primary-soft"
          : "border-border text-text-secondary"
      } ${className}`}
    >
      {children}
    </button>
  );
}

interface StatusPillProps {
  tone: "primary" | "secondary";
  icon: LucideIcon;
  children: string;
}

export function StatusPill({ tone, icon: Icon, children }: StatusPillProps) {
  const tones = {
    primary: "bg-primary-soft text-on-primary-soft",
    secondary: "bg-secondary-soft text-on-secondary-soft",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${tones[tone]}`}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {children}
    </span>
  );
}
