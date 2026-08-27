import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Welcome back",
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
