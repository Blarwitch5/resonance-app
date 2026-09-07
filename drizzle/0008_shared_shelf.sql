CREATE TABLE IF NOT EXISTS "shared_shelf" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"headline" text NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"truncated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_shelf" ADD CONSTRAINT "shared_shelf_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shared_shelf_user_id_idx" ON "shared_shelf" USING btree ("user_id");
