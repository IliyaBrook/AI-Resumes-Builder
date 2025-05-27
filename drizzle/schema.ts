import { pgTable, foreignKey, serial, varchar, integer, text, unique, timestamp, boolean, date, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const status = pgEnum("status", ['archived', 'private', 'public'])



export const skills = pgTable("skills", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	rating: integer().default(0).notNull(),
	hideRating: integer("hide_rating").default(0).notNull(),
	order: integer().default(0).notNull(),
	category: varchar({ length: 255 }),
},
(table) => {
	return {
		skillsDocumentIdDocumentDocumentIdFk: foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.documentId],
			name: "skills_document_id_document_document_id_fk"
		}).onDelete("cascade"),
	}
});

export const personalInfo = pgTable("personal_info", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }),
	firstName: varchar("first_name", { length: 255 }),
	lastName: varchar("last_name", { length: 255 }),
	jobTitle: varchar("job_title", { length: 255 }),
	address: varchar({ length: 500 }),
	phone: varchar({ length: 50 }),
	email: varchar({ length: 255 }),
	github: varchar({ length: 255 }),
	linkedin: varchar({ length: 255 }),
},
(table) => {
	return {
		personalInfoDocumentIdDocumentDocumentIdFk: foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.documentId],
			name: "personal_info_document_id_document_document_id_fk"
		}).onDelete("cascade"),
	}
});

export const project = pgTable("project", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 255 }),
	description: text(),
	order: integer().default(0).notNull(),
	git: varchar({ length: 255 }),
},
(table) => {
	return {
		projectDocumentIdDocumentDocumentIdFk: foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.documentId],
			name: "project_document_id_document_document_id_fk"
		}).onDelete("cascade"),
	}
});

export const model = pgTable("model", {
	id: serial().primaryKey().notNull(),
	modelName: varchar("model_name", { length: 255 }).notNull(),
});

export const document = pgTable("document", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	summary: text(),
	themeColor: varchar("theme_color", { length: 255 }).default('#7c3aed').notNull(),
	thumbnail: text(),
	currentPosition: integer("current_position").default(1).notNull(),
	status: status().default('private').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	projectsSectionTitle: varchar("projects_section_title", { length: 255 }).default('Projects'),
	skillsDisplayFormat: varchar("skills_display_format", { length: 32 }),
	personalInfoDisplayFormat: varchar("personal_info_display_format", { length: 32 }).default('default'),
},
(table) => {
	return {
		documentDocumentIdUnique: unique("document_document_id_unique").on(table.documentId),
	}
});

export const experience = pgTable("experience", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }),
	title: varchar({ length: 255 }),
	companyName: varchar("company_name", { length: 255 }),
	city: varchar({ length: 255 }),
	state: varchar({ length: 255 }),
	currentlyWorking: boolean("currently_working").default(false).notNull(),
	workSummary: text("work_summary"),
	startDate: date("start_date"),
	endDate: date("end_date"),
	order: integer().default(0).notNull(),
	yearsOnly: boolean("years_only").default(false).notNull(),
},
(table) => {
	return {
		experienceDocumentIdDocumentDocumentIdFk: foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.documentId],
			name: "experience_document_id_document_document_id_fk"
		}).onDelete("cascade"),
	}
});

export const education = pgTable("education", {
	id: serial().primaryKey().notNull(),
	documentId: varchar("document_id", { length: 255 }).notNull(),
	universityName: varchar("university_name", { length: 255 }),
	degree: varchar({ length: 255 }),
	major: varchar({ length: 255 }),
	description: text(),
	startDate: date("start_date"),
	endDate: date("end_date"),
	currentlyStudying: boolean("currently_studying").default(false).notNull(),
	skipDates: boolean("skip_dates").default(false).notNull(),
	yearsOnly: boolean("years_only").default(false).notNull(),
},
(table) => {
	return {
		educationDocumentIdDocumentDocumentIdFk: foreignKey({
			columns: [table.documentId],
			foreignColumns: [document.documentId],
			name: "education_document_id_document_document_id_fk"
		}).onDelete("cascade"),
	}
});

export const theme = pgTable("theme", {
	id: serial().primaryKey().notNull(),
	theme: varchar({ length: 32 }).notNull(),
});