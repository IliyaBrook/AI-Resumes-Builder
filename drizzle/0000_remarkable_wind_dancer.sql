CREATE TYPE "public"."status" AS ENUM('archived', 'private', 'public');--> statement-breakpoint
CREATE TABLE "document" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"theme_color" varchar(255) DEFAULT '#7c3aed' NOT NULL,
	"thumbnail" text,
	"current_position" integer DEFAULT 1 NOT NULL,
	"status" "status" DEFAULT 'private' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"projects_section_title" varchar(255) DEFAULT 'Projects',
	"languages_section_title" varchar(255) DEFAULT 'Languages',
	"army_service" text,
	"skills_display_format" varchar(32),
	"personal_info_display_format" varchar(32) DEFAULT 'default',
	"pages_order" json DEFAULT '["personal-info","summary","experience","education","projects","skills","languages","army"]'::json,
	"direction" varchar(10) DEFAULT 'ltr' NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"section_paddings" json DEFAULT '{}'::json,
	CONSTRAINT "document_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"education_type" varchar(50) DEFAULT 'university' NOT NULL,
	"university_name" varchar(255),
	"degree" varchar(255),
	"major" varchar(255),
	"description" text,
	"start_date" date,
	"end_date" date,
	"currently_studying" boolean DEFAULT false NOT NULL,
	"skip_dates" boolean DEFAULT false NOT NULL,
	"years_only" boolean DEFAULT false NOT NULL,
	"hide_dates" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255),
	"title" varchar(255),
	"company_name" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"currently_working" boolean DEFAULT false NOT NULL,
	"work_summary" text,
	"start_date" date,
	"end_date" date,
	"order" integer DEFAULT 0 NOT NULL,
	"years_only" boolean DEFAULT false NOT NULL,
	"padding_top" integer DEFAULT 0 NOT NULL,
	"padding_bottom" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "language" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" varchar(100),
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"job_title" varchar(255),
	"address" varchar(500),
	"phone" varchar(50),
	"email" varchar(255),
	"github" varchar(255),
	"linkedin" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255),
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"git" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "skill_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" varchar(255) NOT NULL,
	"name" varchar(255),
	"category" varchar(255),
	"rating" integer DEFAULT 0 NOT NULL,
	"hide_rating" integer DEFAULT 0 NOT NULL,
	"skill_order" integer DEFAULT 0 NOT NULL,
	"category_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme" varchar(32) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "education" ADD CONSTRAINT "education_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience" ADD CONSTRAINT "experience_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "language" ADD CONSTRAINT "language_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_categories" ADD CONSTRAINT "skill_categories_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;