import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const columnPattern =
  /(?:text|integer|boolean|timestamp|uuid|mediaFormat|mediaCondition|themePreference|viewMode)\("([^"]+)"\)/g;

describe("schema heal", () => {
  it("mentions every schema column in a heal or create migration", () => {
    const schema = readFileSync(path.join(root, "src/db/schema.ts"), "utf8");
    const migrations = [
      "drizzle/0005_heal_collection_columns.sql",
      "drizzle/0007_shared_pressing.sql",
      "drizzle/0008_shared_shelf.sql",
    ]
      .map((relative) => readFileSync(path.join(root, relative), "utf8"))
      .join("\n");
    const columns = [...schema.matchAll(columnPattern)].map((match) => match[1]);

    expect(columns.length).toBeGreaterThan(20);

    for (const column of columns) {
      expect(migrations, `migrations are missing "${column}"`).toContain(`"${column}"`);
    }
  });
});
