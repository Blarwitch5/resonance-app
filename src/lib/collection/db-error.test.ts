import { describe, expect, it } from "vitest";

import {
  isMissingCoverThumbColumn,
  isUniqueViolation,
  missingOptionalInsertField,
  postgresCode,
} from "@/lib/collection/db-error";

describe("postgresCode", () => {
  it("reads a nested Neon code through Drizzle", () => {
    const neon = Object.assign(new Error('column "cover_thumb_url" of relation "collection_item" does not exist'), {
      code: "42703",
    });
    const wrapped = Object.assign(new Error('Failed query: insert into "collection_item" ("cover_thumb_url")'), {
      cause: neon,
    });

    expect(postgresCode(wrapped)).toBe("42703");
  });

  it("ignores AppError codes that are not Postgres", () => {
    const error = Object.assign(new Error("The record could not be added to your collection."), {
      code: "DATABASE",
    });

    expect(postgresCode(error)).toBeUndefined();
  });
});

describe("missingOptionalInsertField", () => {
  it("reads catalog_number from a Neon 42703", () => {
    const neon = Object.assign(new Error('column "catalog_number" of relation "collection_item" does not exist'), {
      code: "42703",
    });
    const wrapped = Object.assign(new Error('Failed query: insert into "collection_item" ("catalog_number")'), {
      cause: neon,
    });

    expect(missingOptionalInsertField(wrapped)).toBe("catalogNumber");
    expect(isMissingCoverThumbColumn(wrapped)).toBe(false);
  });

  it("reads a genres type mismatch", () => {
    const neon = Object.assign(new Error('column "genres" is of type text but expression is of type text[]'), {
      code: "42804",
    });

    expect(missingOptionalInsertField(neon)).toBe("genres");
  });
});

describe("isMissingCoverThumbColumn", () => {
  it("detects an undefined cover_thumb_url column", () => {
    const neon = Object.assign(new Error('column "cover_thumb_url" of relation "collection_item" does not exist'), {
      code: "42703",
    });
    const wrapped = Object.assign(new Error('Failed query: insert into "collection_item" ("cover_thumb_url")'), {
      cause: neon,
    });

    expect(isMissingCoverThumbColumn(wrapped)).toBe(true);
  });

  it("does not treat a unique conflict as a missing column", () => {
    const neon = Object.assign(new Error('duplicate key value violates unique constraint "collection_item_user_discogs_format_idx"'), {
      code: "23505",
    });
    const wrapped = Object.assign(new Error('Failed query: insert into "collection_item" ("cover_thumb_url")'), {
      cause: neon,
    });

    expect(isMissingCoverThumbColumn(wrapped)).toBe(false);
    expect(isUniqueViolation(wrapped)).toBe(true);
  });

  it("reads a unique conflict from the Neon message alone", () => {
    const neon = new Error('duplicate key value violates unique constraint "collection_item_user_discogs_format_idx"');
    neon.name = "NeonDbError";

    expect(isUniqueViolation(Object.assign(new Error("Failed query"), { cause: neon }))).toBe(true);
  });
});
