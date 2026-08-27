import { NextResponse } from "next/server";

import { backupFilename, toResonanceBackup } from "@/lib/collection/backup";
import { listCollectionItems } from "@/lib/collection/repository";
import { getSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Sign in to take your resonance with you." },
      { status: 401 },
    );
  }

  const exportedAt = new Date();
  const [settings, items] = await Promise.all([
    getUserSettings(session.user.id),
    listCollectionItems(session.user.id),
  ]);
  const backup = toResonanceBackup({ exportedAt, settings, items });

  return new NextResponse(`${JSON.stringify(backup, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${backupFilename(exportedAt)}"`,
      "Cache-Control": "no-store",
    },
  });
}
