import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { getEnv } from "@/lib/env";

type Database = ReturnType<typeof createDb>;

let database: Database | undefined;

function createDb() {
  const sql = neon(getEnv().DATABASE_URL);
  return drizzle({ client: sql, schema });
}

export function getDb(): Database {
  if (!database) {
    database = createDb();
  }

  return database;
}
