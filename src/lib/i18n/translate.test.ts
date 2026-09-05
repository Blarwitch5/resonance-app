import { describe, expect, it } from "vitest";

import { messages } from "@/lib/i18n/messages";
import { t } from "@/lib/i18n/translate";

function messageKeys(tree: object, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object") {
      return messageKeys(value, path);
    }

    return [path];
  });
}

describe("t", () => {
  it("speaks English by default and French when invited", () => {
    expect(t("en", "nav.profile")).toBe("Profile");
    expect(t("fr", "nav.profile")).toBe("Profil");
    expect(t("en", "settings.language")).toBe("Language");
    expect(t("fr", "settings.language")).toBe("Langue");
    expect(t("en", "collection.emptyShelf")).toBe("Your shelf is waiting.");
    expect(t("fr", "collection.emptyShelf")).toBe("Ton étagère attend.");
    expect(t("fr", "brand.tagline")).toBe("Là où ta musique résonne.");
    expect(t("fr", "journal.onThisRecord")).toBe("Sur ce disque");
    expect(t("fr", "journal.alsoOnShelf")).toBe("Aussi sur l’étagère");
    expect(t("fr", "format.vinyl")).toBe("Vinyle");
    expect(t("fr", "offlinePage.title")).toBe("Le signal s’est éteint.");
    expect(t("fr", "offlinePage.quietShelf")).toBe(
      "L’air est calme. Tu lis ce qui est déjà sur l’étagère.",
    );
    expect(t("en", "menu.open")).toBe("Open this album in your journal");
    expect(t("fr", "menu.open")).toBe("Ouvrir cet album dans ton journal");
    expect(t("en", "menu.hold")).toBe("Keep this album");
    expect(t("fr", "menu.hold")).toBe("Garder cet album");
    expect(t("en", "collection.leaveHint")).toContain("right-click");
    expect(t("fr", "collection.leaveHint")).toContain("clic droit");
    expect(t("fr", "explorer.writeIn")).toBe("Ajouter un pressage à la main");
    expect(t("fr", "explorer.nothingHint")).toBe(
      "Un autre titre, un autre artiste, un code-barres à la lumière, ou ajoute ce pressage à la main.",
    );
  });

  it("keeps the same keys in both tongues", () => {
    expect(messageKeys(messages.fr)).toEqual(messageKeys(messages.en));
  });
});
