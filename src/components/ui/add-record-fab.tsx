"use client";

import { FaceSlightlySmilingPlus } from "lucide-react";
import Link from "next/link";

import { useT } from "@/components/locale-provider";

interface AddRecordFabProps {
  href?: string;
}

export function AddRecordFab({ href = "/explorer" }: AddRecordFabProps) {
  const t = useT();

  return (
    <Link
      href={href}
      aria-label={t("collection.addAria")}
      className="fixed right-4 bottom-[calc(var(--rs-bottom-chrome)+max(0.75rem,env(safe-area-inset-bottom)))] z-30 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary outline-none standalone:size-12 hover:bg-primary-hover active:bg-primary-active focus-visible:ring-2 focus-visible:ring-border-strong lg:hidden"
    >
      <FaceSlightlySmilingPlus className="size-6" aria-hidden />
    </Link>
  );
}
