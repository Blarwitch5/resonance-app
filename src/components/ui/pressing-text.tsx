import type { ReactNode } from "react";

interface PressingTextProps {
  children: ReactNode;
  className?: string;
}

export function PressingText({ children, className }: PressingTextProps) {
  return (
    <span translate="no" className={className ? `notranslate ${className}` : "notranslate"}>
      {children}
    </span>
  );
}
