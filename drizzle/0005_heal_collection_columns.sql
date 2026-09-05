-- Idempotent: bring any Neon (including Vercel prod) to src/db/schema.ts.
-- CREATE TABLE is skipped when the table already exists; ADD COLUMN fills gaps.

DO $$ BEGIN
  CREATE TYPE "public"."media_condition" AS ENUM('mint', 'near_mint', 'very_good_plus', 'very_good', 'good_plus', 'good', 'fair', 'poor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."media_format" AS ENUM('vinyl', 'cassette', 'cd');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."theme_preference" AS ENUM('light', 'dark', 'auto');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."view_mode" AS ENUM('list', 'grid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"issuer" text DEFAULT 'local:credential' NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"discogs_id" integer,
	"format" "media_format" DEFAULT 'vinyl' NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"year" integer,
	"label" text,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"cover_url" text,
	"cover_thumb_url" text,
	"barcode" text,
	"catalog_number" text,
	"condition" "media_condition",
	"purchase_location" text,
	"purchase_date" timestamp,
	"notes" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_wishlist" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"vinyl_enabled" boolean DEFAULT true NOT NULL,
	"cassette_enabled" boolean DEFAULT true NOT NULL,
	"cd_enabled" boolean DEFAULT true NOT NULL,
	"theme" "theme_preference" DEFAULT 'auto' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"market_value_enabled" boolean DEFAULT false NOT NULL,
	"view_mode" "view_mode" DEFAULT 'list' NOT NULL,
	"default_format" "media_format",
	"bio" text,
	"onboarded_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "id" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "name" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" text;
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "id" text;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" text;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ip_address" text;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "user_agent" text;
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "account_id" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "provider_id" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text DEFAULT 'local:credential';
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id_token" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "id" text;
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "identifier" text;
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "value" text;
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid();
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "discogs_id" integer;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "format" "media_format" DEFAULT 'vinyl';
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "title" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "artist" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "year" integer;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "label" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "genres" text[] DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "cover_url" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "cover_thumb_url" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "barcode" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "catalog_number" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "condition" "media_condition";
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "purchase_location" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "purchase_date" timestamp;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "notes" text;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "is_favorite" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "is_wishlist" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "collection_item" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "user_id" text;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "vinyl_enabled" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "cassette_enabled" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "cd_enabled" boolean DEFAULT true;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "theme" "theme_preference" DEFAULT 'auto';
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'en';
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "market_value_enabled" boolean DEFAULT false;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "view_mode" "view_mode" DEFAULT 'list';
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "default_format" "media_format";
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "bio" text;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "onboarded_at" timestamp;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unique" ON "user" USING btree ("email");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_unique" ON "session" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_item_user_id_idx" ON "collection_item" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "collection_item_format_idx" ON "collection_item" USING btree ("user_id","format");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "collection_item_user_discogs_format_idx" ON "collection_item" USING btree ("user_id","discogs_id","format");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
