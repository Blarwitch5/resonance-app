import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface SidebarSubNavProps {
  label: string;
  children: ReactNode;
}

export function SidebarSubNav({ label, children }: SidebarSubNavProps) {
  return (
    <div role="group" aria-label={label} className="ml-8 flex flex-col gap-1 border-l border-border pl-2">
      {children}
    </div>
  );
}

interface SidebarSubLinkProps {
  href: string;
  isActive: boolean;
  icon: LucideIcon;
  label: string;
}

export function SidebarSubLink({ href, isActive, icon: Icon, label }: SidebarSubLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group flex min-h-11 items-center gap-2 rounded-rs-sm px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-strong ${
        isActive
          ? "bg-primary-soft text-on-primary-soft"
          : "text-text-secondary hover:bg-surface-pressed hover:text-text"
      }`}
    >
      <Icon className="size-4 motion-safe:group-hover:vibrato" aria-hidden />
      {label}
    </Link>
  );
}
