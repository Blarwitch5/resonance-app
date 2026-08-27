import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Start your journal",
};

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return children;
}
