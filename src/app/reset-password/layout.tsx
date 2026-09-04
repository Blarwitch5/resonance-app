import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLocale(), "auth.newPasswordTitle") };
}

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
