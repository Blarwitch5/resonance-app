"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

interface ContentPaneProps {
  children: ReactNode;
}

export function ContentPane({ children }: ContentPaneProps) {
  const pathname = usePathname();
  const pane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pane.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      ref={pane}
      data-scroll-root=""
      className="relative flex min-h-dvh min-w-0 flex-1 flex-col pb-[calc(var(--rs-bottom-chrome)+max(0.75rem,env(safe-area-inset-bottom))+var(--rs-sample-dock,0px))] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pb-(--rs-sample-dock,0px)"
    >
      {children}
    </div>
  );
}
