import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { addDiscogsRelease } from "@/lib/collection/add-release";
import { parseAddReleaseInput } from "@/lib/collection/add-release-input";
import { postgresCode, postgresDetail } from "@/lib/collection/db-error";
import { journalHref } from "@/lib/collection/href";
import { AppError } from "@/lib/errors";
import { localizedError } from "@/lib/i18n/action-error";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { getSession } from "@/lib/session";
import { loadUserSettings } from "@/lib/settings/repository";

export const dynamic = "force-dynamic";

async function readAddReleaseInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return parseAddReleaseInput(await request.json());
  }

  const formData = await request.formData();

  return parseAddReleaseInput({
    discogsId: formData.get("discogsId"),
    format: formData.get("format"),
    kind: formData.get("kind"),
    notes: formData.get("notes"),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  let locale = await getLocale();

  if (session) {
    try {
      locale = (await loadUserSettings(session.user.id)).locale;
    } catch {
      // Cookie locale is enough to answer; a settings read must not block add.
    }
  }

  if (!session) {
    return NextResponse.json({ error: t(locale, "error.signIn") }, { status: 401 });
  }

  let parsed: ReturnType<typeof parseAddReleaseInput>;

  try {
    parsed = await readAddReleaseInput(request);
  } catch {
    return NextResponse.json({ error: t(locale, "error.releaseAdd") }, { status: 400 });
  }

  if (!parsed) {
    console.error("Resonance add release rejected: invalid input");
    return NextResponse.json({ error: t(locale, "error.releaseAdd") }, { status: 400 });
  }

  try {
    const created = await addDiscogsRelease({
      userId: session.user.id,
      discogsId: parsed.discogsId,
      format: parsed.format,
      kind: parsed.kind,
      notes: parsed.notes,
    });

    try {
      revalidatePath("/collection");
      revalidatePath("/explorer");
      revalidatePath("/profile");
    } catch {
      // The pressing is already kept; a stale list can catch up on the next visit.
    }

    return NextResponse.json({
      href: journalHref(created.id, parsed.kind === "owned"),
    });
  } catch (error) {
    console.error("Resonance add release failed", {
      code: error instanceof AppError ? error.code : postgresCode(error),
      detail: postgresDetail(error),
    });

    const status = error instanceof AppError && error.statusCode < 500 ? error.statusCode : 400;
    return NextResponse.json({ error: localizedError(locale, error) }, { status });
  }
}
