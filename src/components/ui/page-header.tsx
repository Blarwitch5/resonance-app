import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ResonanceMark } from "@/components/ui/resonance-mark";

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, extra, action }: PageHeaderProps) {
  return (
    <header className={action ? "flex items-start justify-between gap-4" : undefined}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <ResonanceMark size="sm" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">{title}</h1>
        </div>
        {description ? <p className="text-sm leading-6 text-text-secondary">{description}</p> : null}
        {extra}
      </div>
      {action}
    </header>
  );
}

interface SectionHeadingProps {
  icon: LucideIcon;
  children: string;
  id?: string;
}

export function SectionHeading({ icon: Icon, children, id }: SectionHeadingProps) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-text">
      <Icon className="size-5 shrink-0 text-text-secondary" aria-hidden />
      {children}
    </h2>
  );
}
