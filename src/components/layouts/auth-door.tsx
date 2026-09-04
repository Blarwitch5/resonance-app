import type { ReactNode } from "react";

import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { VinylPlatter } from "@/components/ui/vinyl-platter";

interface AuthDoorProps {
  title: string;
  description: string;
  tagline: string;
  notice?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthDoor({ title, description, tagline, notice, children, footer }: AuthDoorProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-background lg:h-dvh lg:p-3">
      <div className="grid w-full max-w-5xl motion-safe:ripple-in lg:h-full lg:grid-cols-2 lg:gap-3">
        <aside className="hidden min-h-0 flex-col items-center justify-center rounded-rs-lg bg-sidebar px-12 py-16 text-center lg:flex">
          <VinylPlatter>
            <ResonanceMark size="lg" isListening />
          </VinylPlatter>
          <p className={`mt-10 ${eyebrowClass}`}>Resonance</p>
          <p className="mt-4 max-w-sm text-lg leading-7 text-text">{tagline}</p>
        </aside>
        <div className="flex min-h-dvh items-center justify-center px-6 py-12 lg:min-h-0 lg:rounded-rs-lg lg:bg-surface">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col items-center text-center lg:mb-0 lg:hidden">
              <ResonanceMark size="md" isListening />
              <p className={`mt-5 ${eyebrowClass}`}>Resonance</p>
            </div>
            <h1 className={displayTitleClass}>{title}</h1>
            <p className={`mt-2 ${bodyClass}`}>{description}</p>
            {notice}
            {children}
            {footer ? <div className={`mt-6 ${bodyClass}`}>{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
