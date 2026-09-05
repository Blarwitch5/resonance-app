import { Suspense, type ReactNode } from "react";

import { BarcodeScanProvider } from "@/app/explorer/barcode-scanner";
import { DocumentLocale } from "@/components/document-locale";
import { FormatTint } from "@/components/format-tint";
import { InstallHint } from "@/components/install-hint";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ContentPane } from "@/components/layouts/content-pane";
import { ListenPalette } from "@/components/listen-palette";
import { LocaleProvider } from "@/components/locale-provider";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { QuietShelfNotice } from "@/components/quiet-shelf-notice";
import { RememberReturn } from "@/components/remember-return";
import { AddPressingFab } from "@/components/ui/add-pressing-fab";
import { BottomBar } from "@/components/ui/bottom-bar";
import { CollectionFormatNav } from "@/components/ui/collection-format-nav";
import { ProfileNav } from "@/components/ui/profile-nav";
import { Sidebar } from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { PALETTE_RECORD_MAX, type PaletteRecord } from "@/lib/collection/palette";
import { listPaletteRecords } from "@/lib/collection/repository";
import type { MediaFormat } from "@/lib/collection/types";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, type Locale } from "@/lib/settings/types";

interface AppShellProps {
  children: ReactNode;
}

async function loadShelfChrome(
  userId: string,
): Promise<[ReturnType<typeof enabledFormats>, PaletteRecord[], Locale, MediaFormat | null]> {
  const [settings, records] = await Promise.all([
    getUserSettings(userId),
    listPaletteRecords(userId, PALETTE_RECORD_MAX),
  ]);

  return [
    enabledFormats(settings),
    records,
    settings.locale,
    settings.defaultFormat,
  ];
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession();
  const [formats, records, locale, defaultFormat] = session
    ? await loadShelfChrome(session.user.id)
    : [[], [], "en" as const, null];

  return (
    <LocaleProvider locale={locale}>
      <BarcodeScanProvider>
        <div className="flex min-h-dvh bg-background pt-[env(safe-area-inset-top)] transition-colors duration-500 lg:h-dvh lg:overflow-hidden lg:pt-0">
          <DocumentLocale locale={locale} />
          <Sidebar
            locale={locale}
            formatNav={
              formats.length > 1 ? (
                <Suspense fallback={null}>
                  <CollectionFormatNav formats={formats} />
                </Suspense>
              ) : null
            }
            profileNav={
              <Suspense fallback={null}>
                <ProfileNav />
              </Suspense>
            }
            signOut={<SignOutButton layout="rail" />}
          />
          <ContentPane>
            <Suspense fallback={null}>
              <FormatTint formats={formats} />
            </Suspense>
            <PullToRefresh>
              <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-8 px-4 py-6 standalone:gap-6 standalone:py-4 sm:px-6 lg:px-8">
                <Suspense fallback={null}>
                  <QuietShelfNotice />
                </Suspense>
                {children}
              </main>
            </PullToRefresh>
            <InstallHint />
            <BottomBar locale={locale} />
          </ContentPane>
          <KeyboardShortcuts formats={formats} />
          <Suspense fallback={null}>
            <ListenPalette records={records} formats={formats} />
          </Suspense>
          <Suspense fallback={null}>
            <RememberReturn />
          </Suspense>
          <AddPressingFab isSignedIn={session !== null} defaultFormat={defaultFormat} />
        </div>
      </BarcodeScanProvider>
    </LocaleProvider>
  );
}
