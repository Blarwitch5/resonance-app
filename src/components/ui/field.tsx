import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { controlClass, labelClass, textAreaClass } from "@/components/ui/control";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export function TextField({ id, label, icon: Icon, ...props }: TextFieldProps) {
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
        <input id={id} className={`${controlClass} ${Icon ? "pl-10" : ""}`} {...props} />
      </span>
    </label>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id"> {
  id: string;
  label: string;
}

export function TextAreaField({ id, label, ...props }: TextAreaFieldProps) {
  return (
    <label htmlFor={id} className={labelClass}>
      {label}
      <textarea id={id} className={textAreaClass} {...props} />
    </label>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "id"> {
  id: string;
  label: string;
  children: ReactNode;
}

export function SelectField({ id, label, children, ...props }: SelectFieldProps) {
  return (
    <label htmlFor={id} className={labelClass}>
      {label}
      <select id={id} className={controlClass} {...props}>
        {children}
      </select>
    </label>
  );
}
