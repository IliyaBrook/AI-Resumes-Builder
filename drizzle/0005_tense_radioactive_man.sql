CREATE TABLE IF NOT EXISTS "theme" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;