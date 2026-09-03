import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { t } from "@/lib/i18n/translate";

const html = readFileSync(join(process.cwd(), "public/offline.html"), "utf8");

describe("waiting page", () => {
  it("keeps the waiting page in both tongues", () => {
    expect(html).toContain("resonance-locale");
    expect(html).toContain(t("en", "offlinePage.title"));
    expect(html).toContain(t("fr", "offlinePage.title"));
    expect(html).toContain(t("en", "offlinePage.body"));
    expect(html).toContain(t("fr", "offlinePage.body"));
    expect(html).toContain(t("en", "offlinePage.retry"));
    expect(html).toContain(t("fr", "offlinePage.retry"));
  });
});
