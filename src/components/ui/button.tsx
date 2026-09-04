import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "bg-secondary text-on-secondary hover:bg-secondary-hover active:bg-secondary-active",
  ghost: "border border-border bg-transparent text-text hover:bg-surface-pressed",
};

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors outline-none sm:min-h-12 sm:px-6 focus-visible:ring-2 focus-visible:ring-border-strong";

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${buttonClass} disabled:bg-text-disabled disabled:text-on-primary ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  "aria-label"?: string;
  isRecordLink?: boolean;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  "aria-label": ariaLabel,
  isRecordLink = false,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      data-record-link={isRecordLink ? "" : undefined}
      className={`${buttonClass} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
