"use client";

import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

import { controlClass, labelClass } from "@/components/ui/control";
import { useT } from "@/components/locale-provider";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id" | "type"> {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export function PasswordField({ id, label, icon: Icon, ...props }: PasswordFieldProps) {
  const t = useT();
  const [isVisible, setIsVisible] = useState(false);
  const RevealIcon = isVisible ? EyeOff : Eye;

  return (
    <label htmlFor={id} className={labelClass}>
      {label}
      <span className="relative block">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary"
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          className={`${controlClass} pr-12 ${Icon ? "pl-10" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? t("common.hidePassword") : t("common.showPassword")}
          aria-pressed={isVisible}
          className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-rs-sm text-text-tertiary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          <RevealIcon className="size-4" aria-hidden />
        </button>
      </span>
    </label>
  );
}
