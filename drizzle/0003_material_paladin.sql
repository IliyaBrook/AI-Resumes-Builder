ALTER TABLE "education" DROP CONSTRAINT "education_document_id_document_id_fk";
--> statement-breakpoint
ALTER TABLE "experience" DROP CONSTRAINT "experience_document_id_document_id_fk";
--> statement-breakpoint
ALTER TABLE "personal_info" DROP CONSTRAINT "personal_info_document_id_document_id_fk";
--> statement-breakpoint
ALTER TABLE "skills" DROP CONSTRAINT "skills_document_id_document_id_fk";
--> statement-breakpoint
ALTER TABLE "education" ALTER COLUMN "document_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "experience" ALTER COLUMN "document_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "personal_info" ALTER COLUMN "document_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "skills" ALTER COLUMN "document_id" SET DATA TYPE varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experience" ADD CONSTRAINT "experience_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personal_info" ADD CONSTRAINT "personal_info_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "skills" ADD CONSTRAINT "skills_document_id_document_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("document_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
