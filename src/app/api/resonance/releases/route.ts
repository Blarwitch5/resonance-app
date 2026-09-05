import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { addDiscogsRelease } from "@/lib/collection/add-release";
import { journalHref } from "@/lib/collection/href";
import { MEDIA_FORMATS } from "@/lib/collection/types";
import { localizedError } from "@/lib/i18n/action-error";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { getSession } from "@/lib/session";
import { loadUserSettings } from "@/lib/settings/repository";

export const dynamic = "force-dynamic";

const addReleaseSchema = z.object({
  discogsId: z.coerce.number().int().positive(),
  format: z.enum(MEDIA_FORMATS),
  kind: z.enum(["owned", "wishlist"]).default("owned"),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  const locale = session ? (await loadUserSettings(session.user.id)).locale : await getLocale();

  if (!session) {
    return NextResponse.json({ error: t(locale, "error.signIn") }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = addReleaseSchema.safeParse({
    discogsId: formData.get("discogsId"),
    format: formData.get("format"),
    kind: formData.get("kind") ?? "owned",
    notes: String(formData.get("notes") ?? ""),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: t(locale, "error.releaseAdd") }, { status: 400 });
  }

  try {
    const created = await addDiscogsRelease({
      userId: session.user.id,
      discogsId: parsed.data.discogsId,
      format: parsed.data.format,
      kind: parsed.data.kind,
      notes: parsed.data.notes,
    });

    revalidatePath("/collection");
    revalidatePath("/explorer");
    revalidatePath("/profile");

    return NextResponse.json({
      href: journalHref(created.id, parsed.data.kind === "owned"),
    });
  } catch (error) {
    return NextResponse.json({ error: localizedError(locale, error) }, { status: 400 });
  }
}
