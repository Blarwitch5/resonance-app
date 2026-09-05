import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import {
  controlBareClass,
  controlClass,
  controlFrameClass,
  controlIconSlotClass,
  controlInsetClass,
  labelClass,
  textAreaClass,
} from "@/components/ui/control";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "id"> {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export function TextField({ id, label, icon: Icon, ...props }: TextFieldProps) {
  return (
    <label htmlFor={id} className={labelClass}>
      {label}
      {Icon ? (
        <span className={controlFrameClass}>
          <span className={controlIconSlotClass} aria-hidden>
            <Icon className="size-4" />
          </span>
          <input id={id} className={`${controlBareClass} pr-3 sm:pr-4`} {...props} />
        </span>
      ) : (
        <input id={id} className={`${controlClass} ${controlInsetClass()}`} {...props} />
      )}
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
      <select id={id} className={`${controlClass} ${controlInsetClass()}`} {...props}>
        {children}
      </select>
    </label>
  );
}
