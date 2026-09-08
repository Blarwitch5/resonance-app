import { FormatTint } from "@/components/format-tint";
import { InstallHint } from "@/components/install-hint";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ListenPalette } from "@/components/listen-palette";
import { AddPressingFab } from "@/components/ui/add-pressing-fab";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { PALETTE_RECORD_MAX } from "@/lib/collection/palette";
import { listPaletteRecords } from "@/lib/collection/repository";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";
import { enabledFormats } from "@/lib/settings/types";

/**
 * Secondary chrome loads behind Suspense (adapted: no next/dynamic —
 * Turbopack panics with “CJS module can't be async” on those client chunks).
 */
export async function FormatTintSlot() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const settings = await getUserSettings(session.user.id);
  return <FormatTint formats={enabledFormats(settings)} />;
}

export async function ListenPaletteSlot() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const [settings, records] = await Promise.all([
    getUserSettings(session.user.id),
    listPaletteRecords(session.user.id, PALETTE_RECORD_MAX),
  ]);

  return <ListenPalette records={records} formats={enabledFormats(settings)} />;
}

export async function KeyboardShortcutsSlot() {
  const session = await getSession();

  if (!session) {
    return <KeyboardShortcuts formats={[]} />;
  }

  const settings = await getUserSettings(session.user.id);
  return <KeyboardShortcuts formats={enabledFormats(settings)} />;
}

export async function SignOutSlot() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return <SignOutButton layout="rail" />;
}

export async function AddPressingFabSlot() {
  const session = await getSession();

  if (!session) {
    return <AddPressingFab isSignedIn={false} defaultFormat={null} />;
  }

  const settings = await getUserSettings(session.user.id);
  return <AddPressingFab isSignedIn defaultFormat={settings.defaultFormat} />;
}

export function InstallHintSlot() {
  return <InstallHint />;
}
