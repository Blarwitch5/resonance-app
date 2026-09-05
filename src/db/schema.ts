import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { CREDENTIAL_ACCOUNT_ISSUER } from "@/lib/auth-origins";

export const mediaFormat = pgEnum("media_format", ["vinyl", "cassette", "cd"]);
export const mediaCondition = pgEnum("media_condition", [
  "mint",
  "near_mint",
  "very_good_plus",
  "very_good",
  "good_plus",
  "good",
  "fair",
  "poor",
]);
export const themePreference = pgEnum("theme_preference", ["light", "dark", "auto"]);
export const viewMode = pgEnum("view_mode", ["list", "grid"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    issuer: text("issuer").notNull().default(CREDENTIAL_ACCOUNT_ISSUER),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectionItem = pgTable(
  "collection_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    discogsId: integer("discogs_id"),
    format: mediaFormat("format").notNull().default("vinyl"),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    year: integer("year"),
    label: text("label"),
    genres: text("genres").array().notNull().default([]),
    coverUrl: text("cover_url"),
    coverThumbUrl: text("cover_thumb_url"),
    barcode: text("barcode"),
    catalogNumber: text("catalog_number"),
    condition: mediaCondition("condition"),
    purchaseLocation: text("purchase_location"),
    purchaseDate: timestamp("purchase_date"),
    notes: text("notes"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    isWishlist: boolean("is_wishlist").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("collection_item_user_id_idx").on(table.userId),
    index("collection_item_format_idx").on(table.userId, table.format),
    uniqueIndex("collection_item_user_discogs_format_idx").on(
      table.userId,
      table.discogsId,
      table.format,
    ),
  ],
);

export const userSettings = pgTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  vinylEnabled: boolean("vinyl_enabled").notNull().default(true),
  cassetteEnabled: boolean("cassette_enabled").notNull().default(true),
  cdEnabled: boolean("cd_enabled").notNull().default(true),
  theme: themePreference("theme").notNull().default("auto"),
  locale: text("locale").notNull().default("en"),
  marketValueEnabled: boolean("market_value_enabled").notNull().default(false),
  viewMode: viewMode("view_mode").notNull().default("list"),
  defaultFormat: mediaFormat("default_format"),
  bio: text("bio"),
  onboardedAt: timestamp("onboarded_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  collectionItems: many(collectionItem),
  settings: one(userSettings),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const collectionItemRelations = relations(collectionItem, ({ one }) => ({
  user: one(user, {
    fields: [collectionItem.userId],
    references: [user.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(user, {
    fields: [userSettings.userId],
    references: [user.id],
  }),
}));
