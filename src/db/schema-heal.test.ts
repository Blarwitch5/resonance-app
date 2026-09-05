import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../..");
const columnPattern =
  /(?:text|integer|boolean|timestamp|uuid|mediaFormat|mediaCondition|themePreference|viewMode)\("([^"]+)"\)/g;

describe("schema heal", () => {
  it("mentions every schema column in the heal migration", () => {
    const schema = readFileSync(path.join(root, "src/db/schema.ts"), "utf8");
    const heal = readFileSync(path.join(root, "drizzle/0005_heal_collection_columns.sql"), "utf8");
    const columns = [...schema.matchAll(columnPattern)].map((match) => match[1]);

    expect(columns.length).toBeGreaterThan(20);

    for (const column of columns) {
      expect(heal, `heal migration is missing "${column}"`).toContain(`"${column}"`);
    }
  });
});
