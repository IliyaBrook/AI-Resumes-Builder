import { relations } from "drizzle-orm/relations";
import { document, skills, personalInfo, project, experience, education } from "./schema";

export const skillsRelations = relations(skills, ({one}) => ({
	document: one(document, {
		fields: [skills.documentId],
		references: [document.documentId]
	}),
}));

export const documentRelations = relations(document, ({many}) => ({
	skills: many(skills),
	personalInfos: many(personalInfo),
	projects: many(project),
	experiences: many(experience),
	educations: many(education),
}));

export const personalInfoRelations = relations(personalInfo, ({one}) => ({
	document: one(document, {
		fields: [personalInfo.documentId],
		references: [document.documentId]
	}),
}));

export const projectRelations = relations(project, ({one}) => ({
	document: one(document, {
		fields: [project.documentId],
		references: [document.documentId]
	}),
}));

export const experienceRelations = relations(experience, ({one}) => ({
	document: one(document, {
		fields: [experience.documentId],
		references: [document.documentId]
	}),
}));

export const educationRelations = relations(education, ({one}) => ({
	document: one(document, {
		fields: [education.documentId],
		references: [document.documentId]
	}),
}));