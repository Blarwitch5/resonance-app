import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

interface NoticeProps {
  tone: "error" | "success";
  children: ReactNode;
}

export function Notice({ tone, children }: NoticeProps) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;

  if (tone === "error") {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-rs-sm bg-error-soft px-4 py-3 text-sm leading-6 text-error"
      >
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        {children}
      </p>
    );
  }

  return (
    <p role="status" className="flex items-start gap-2 text-sm leading-6 text-success">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}
