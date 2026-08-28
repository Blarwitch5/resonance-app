import { Suspense, type ReactNode } from "react";

import { FormatTint } from "@/components/format-tint";
import { InstallHint } from "@/components/install-hint";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ListenPalette } from "@/components/listen-palette";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { RememberReturn } from "@/components/remember-return";
import { BottomBar } from "@/components/ui/bottom-bar";
import { CollectionFormatNav } from "@/components/ui/collection-format-nav";
import { ProfileNav } from "@/components/ui/profile-nav";
import { Sidebar } from "@/components/ui/sidebar";
import { PALETTE_RECORD_MAX, type PaletteRecord } from "@/lib/collection/palette";
import { listCollectionItems } from "@/lib/collection/repository";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats, type Locale } from "@/lib/settings/types";

interface AppShellProps {
  children: ReactNode;
}

async function loadShelfChrome(userId: string): Promise<[ReturnType<typeof enabledFormats>, PaletteRecord[], Locale]> {
  const [settings, items] = await Promise.all([
    getUserSettings(userId),
    listCollectionItems(userId, { kind: "owned", pageSize: PALETTE_RECORD_MAX }),
  ]);

  return [
    enabledFormats(settings),
    items.map((item) => ({
      id: item.id,
      artist: item.artist,
      title: item.title,
    })),
    settings.locale,
  ];
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession();
  const [formats, records, locale] = session
    ? await loadShelfChrome(session.user.id)
    : [[], [], "en" as const];

  return (
    <div className="flex min-h-dvh bg-background pt-[env(safe-area-inset-top)] transition-colors duration-500">
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
      />
      <div className="relative flex min-h-dvh flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom)+var(--rs-sample-dock,0px))] lg:pb-(--rs-sample-dock,0px)">
        <Suspense fallback={null}>
          <FormatTint formats={formats} />
        </Suspense>
        <PullToRefresh>
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </PullToRefresh>
        <InstallHint />
        <BottomBar locale={locale} />
      </div>
      <KeyboardShortcuts formats={formats} />
      <Suspense fallback={null}>
        <ListenPalette records={records} formats={formats} />
      </Suspense>
      <Suspense fallback={null}>
        <RememberReturn />
      </Suspense>
    </div>
  );
}
