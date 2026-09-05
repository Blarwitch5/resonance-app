import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const EXPECTED = {
  account: [
    "id",
    "account_id",
    "provider_id",
    "issuer",
    "user_id",
    "access_token",
    "refresh_token",
    "id_token",
    "access_token_expires_at",
    "refresh_token_expires_at",
    "scope",
    "password",
    "created_at",
    "updated_at",
  ],
  collection_item: [
    "id",
    "user_id",
    "discogs_id",
    "format",
    "title",
    "artist",
    "year",
    "label",
    "genres",
    "cover_url",
    "cover_thumb_url",
    "barcode",
    "catalog_number",
    "condition",
    "purchase_location",
    "purchase_date",
    "notes",
    "is_favorite",
    "is_wishlist",
    "created_at",
    "updated_at",
  ],
  session: ["id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id"],
  user: ["id", "name", "email", "email_verified", "image", "created_at", "updated_at"],
  user_settings: [
    "user_id",
    "vinyl_enabled",
    "cassette_enabled",
    "cd_enabled",
    "theme",
    "locale",
    "market_value_enabled",
    "view_mode",
    "default_format",
    "bio",
    "onboarded_at",
    "updated_at",
  ],
  verification: ["id", "identifier", "value", "expires_at", "created_at", "updated_at"],
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Cannot assert the Resonance schema.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const columns = await sql`
  SELECT table_name, column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = ANY(${Object.keys(EXPECTED)})
  ORDER BY table_name, ordinal_position
`;

const present = new Map();

for (const row of columns) {
  const names = present.get(row.table_name) ?? new Set();
  names.add(row.column_name);
  present.set(row.table_name, names);
}

const missing = [];

for (const [table, expected] of Object.entries(EXPECTED)) {
  const have = present.get(table) ?? new Set();

  for (const column of expected) {
    if (!have.has(column)) {
      missing.push(`${table}.${column}`);
    }
  }
}

if (missing.length > 0) {
  console.error(`Resonance schema is incomplete: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  `Resonance schema is complete (${Object.values(EXPECTED).reduce((total, columns) => total + columns.length, 0)} columns).`,
);
