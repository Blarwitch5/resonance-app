import { Suspense, type ReactNode } from "react";

import { BarcodeScanProvider } from "@/app/explorer/barcode-scanner";
import { DocumentLocale } from "@/components/document-locale";
import {
  AddPressingFabSlot,
  FormatTintSlot,
  InstallHintSlot,
  KeyboardShortcutsSlot,
  ListenPaletteSlot,
  SignOutSlot,
} from "@/components/layouts/chrome-slots";
import { ContentPane } from "@/components/layouts/content-pane";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { QuietShelfNotice } from "@/components/quiet-shelf-notice";
import { RememberReturn } from "@/components/remember-return";
import { BottomBar } from "@/components/ui/bottom-bar";
import { ProfileNav } from "@/components/ui/profile-nav";
import { Sidebar } from "@/components/ui/sidebar";
import { getLocale } from "@/lib/i18n/locale";

interface AppShellProps {
  children: ReactNode;
}

/**
 * Instant shelf chrome: cookie locale only on the critical path.
 * Session / settings / palette / secondary widgets stream in via Suspense.
 */
export async function AppShell({ children }: AppShellProps) {
  const locale = await getLocale();

  return (
    <BarcodeScanProvider>
      <div className="flex min-h-dvh bg-background pt-[env(safe-area-inset-top)] transition-colors duration-500 lg:h-dvh lg:overflow-hidden lg:pt-0">
        <DocumentLocale locale={locale} />
        <Sidebar
          locale={locale}
          profileNav={
            <Suspense fallback={null}>
              <ProfileNav />
            </Suspense>
          }
          signOut={
            <Suspense fallback={null}>
              <SignOutSlot />
            </Suspense>
          }
        />
        <ContentPane>
          <Suspense fallback={null}>
            <FormatTintSlot />
          </Suspense>
          <PullToRefresh>
            <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-8 px-4 py-6 standalone:gap-6 standalone:py-4 sm:px-6 lg:px-8">
              <Suspense fallback={null}>
                <QuietShelfNotice />
              </Suspense>
              {children}
            </main>
          </PullToRefresh>
          <Suspense fallback={null}>
            <InstallHintSlot />
          </Suspense>
          <BottomBar locale={locale} />
        </ContentPane>
        <Suspense fallback={null}>
          <KeyboardShortcutsSlot />
        </Suspense>
        <Suspense fallback={null}>
          <ListenPaletteSlot />
        </Suspense>
        <Suspense fallback={null}>
          <RememberReturn />
        </Suspense>
        <Suspense fallback={null}>
          <AddPressingFabSlot />
        </Suspense>
      </div>
    </BarcodeScanProvider>
  );
}
