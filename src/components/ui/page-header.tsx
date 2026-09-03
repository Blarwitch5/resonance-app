import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, pageTitleClass, sectionTitleClass } from "@/components/ui/type";

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, extra, action }: PageHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-2">
      <div className={`flex min-w-0 items-center gap-3 ${action ? "justify-between" : ""}`}>
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <ResonanceMark size="sm" />
          </div>
          <h1 className={pageTitleClass}>{title}</h1>
        </div>
        {action}
      </div>
      {description ? <p className={`${bodyClass} line-clamp-1 lg:line-clamp-none`}>{description}</p> : null}
      {extra}
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
    <h2 id={id} className={`flex items-center gap-2 ${sectionTitleClass}`}>
      <Icon className="size-5 shrink-0 text-text-secondary" aria-hidden />
      {children}
    </h2>
  );
}
