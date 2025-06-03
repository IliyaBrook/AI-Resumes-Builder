CREATE TABLE IF NOT EXISTS "language" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" varchar(100),
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "pages_order" SET DEFAULT '["personal-info","summary","experience","education","projects","skills","languages"]'::json;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "languages_section_title" varchar(255) DEFAULT 'Languages';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "language" ADD CONSTRAINT "language_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
