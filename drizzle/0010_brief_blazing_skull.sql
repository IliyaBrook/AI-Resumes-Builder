ALTER TABLE "document" ADD COLUMN "projects_section_title" varchar(255) DEFAULT 'Projects';--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "skills_display_format" varchar(32);--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "years_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "years_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "category" varchar(255);--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "hide_rating" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;