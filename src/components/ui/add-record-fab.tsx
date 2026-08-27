import { FaceSlightlySmilingPlus } from "lucide-react";
import Link from "next/link";

interface AddRecordFabProps {
  href?: string;
}

export function AddRecordFab({ href = "/explorer" }: AddRecordFabProps) {
  return (
    <Link
      href={href}
      aria-label="Add a record to your resonance"
      className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary outline-none hover:bg-primary-hover active:bg-primary-active focus-visible:ring-2 focus-visible:ring-border-strong lg:hidden"
    >
      <FaceSlightlySmilingPlus className="size-6" aria-hidden />
    </Link>
  );
}
