CREATE TABLE IF NOT EXISTS "shared_pressing" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"collection_item_id" uuid,
	"discogs_id" integer,
	"format" "media_format" DEFAULT 'vinyl' NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"year" integer,
	"label" text,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"cover_url" text,
	"cover_thumb_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_pressing" ADD CONSTRAINT "shared_pressing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_pressing" ADD CONSTRAINT "shared_pressing_collection_item_id_collection_item_id_fk" FOREIGN KEY ("collection_item_id") REFERENCES "public"."collection_item"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shared_pressing_user_id_idx" ON "shared_pressing" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "shared_pressing_user_item_idx" ON "shared_pressing" USING btree ("user_id","collection_item_id");
