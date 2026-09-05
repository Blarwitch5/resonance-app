DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'collection_item'
      AND column_name = 'genres'
      AND udt_name IS DISTINCT FROM '_text'
  ) THEN
    ALTER TABLE "collection_item" ALTER COLUMN "genres" DROP DEFAULT;
    ALTER TABLE "collection_item" ALTER COLUMN "genres" TYPE text[] USING (
      CASE
        WHEN "genres" IS NULL THEN '{}'::text[]
        ELSE ARRAY["genres"::text]
      END
    );
    ALTER TABLE "collection_item" ALTER COLUMN "genres" SET DEFAULT '{}';
    ALTER TABLE "collection_item" ALTER COLUMN "genres" SET NOT NULL;
  END IF;
END $$;
