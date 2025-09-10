import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, serial, text, timestamp, varchar, json } from 'drizzle-orm/pg-core';
import { personalInfoTable, personalInfoTableSchema } from './personal-info';
import { experienceTable, experienceTableSchema } from './experience';
import { educationTable, educationTableSchema } from './education';
import { skillsTable, skillsTableSchema } from './skills';
import { projectTable, projectTableSchema } from './project';
import { languageTable, languageTableSchema } from './language';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { DEFAULT_PAGES_ORDER } from '@/constant/default-pages-order';

export const statusEnum = pgEnum('status', ['archived', 'private', 'public']);

export const documentTable = pgTable('document', {
  id: serial('id').notNull().primaryKey(),
  documentId: varchar('document_id').unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  summary: text('summary'),
  themeColor: varchar('theme_color', { length: 255 }).notNull().default('#7c3aed'),
  thumbnail: text('thumbnail'),
  currentPosition: integer('current_position').notNull().default(1),
  status: statusEnum('status').notNull().default('private'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
  projectsSectionTitle: varchar('projects_section_title', { length: 255 }).default('Projects'),
  languagesSectionTitle: varchar('languages_section_title', { length: 255 }).default('Languages'),
  skillsDisplayFormat: varchar('skills_display_format', { length: 32 }),
  personalInfoDisplayFormat: varchar('personal_info_display_format', { length: 32 }).default('default'),
  pagesOrder: json('pages_order').$type<string[]>().default(DEFAULT_PAGES_ORDER),
  direction: varchar('direction', { length: 10 }).notNull().default('ltr'),
  sectionPaddings: json('section_paddings')
    .$type<{
      personalInfo?: { paddingTop?: number; paddingBottom?: number };
      summary?: { paddingTop?: number; paddingBottom?: number };
      experience?: { paddingTop?: number; paddingBottom?: number };
      education?: { paddingTop?: number; paddingBottom?: number };
      skills?: { paddingTop?: number; paddingBottom?: number };
      projects?: { paddingTop?: number; paddingBottom?: number };
      languages?: { paddingTop?: number; paddingBottom?: number };
    }>()
    .default({}),
});

export const documentRelations = relations(documentTable, ({ one, many }) => {
  return {
    personalInfo: one(personalInfoTable),
    experiences: many(experienceTable),
    educations: many(educationTable),
    skills: many(skillsTable),
    projects: many(projectTable),
    languages: many(languageTable),
  };
});

export const createDocumentTableSchema = createInsertSchema(documentTable, {
  title: schema => schema.title.min(1),
  themeColor: schema => schema.themeColor.optional(),
  thumbnail: schema => schema.thumbnail.optional(),
  currentPosition: schema => schema.currentPosition.optional(),
  projectsSectionTitle: schema => schema.projectsSectionTitle.optional(),
  languagesSectionTitle: schema => schema.languagesSectionTitle.optional(),
  skillsDisplayFormat: schema => schema.skillsDisplayFormat.optional(),
  personalInfoDisplayFormat: schema => schema.personalInfoDisplayFormat.optional(),
  pagesOrder: schema => schema.pagesOrder.optional(),
  direction: schema => schema.direction.optional(),
  sectionPaddings: schema => schema.sectionPaddings.optional(),
}).pick({
  title: true,
  status: true,
  summary: true,
  themeColor: true,
  thumbnail: true,
  currentPosition: true,
  projectsSectionTitle: true,
  languagesSectionTitle: true,
  skillsDisplayFormat: true,
  personalInfoDisplayFormat: true,
  pagesOrder: true,
  direction: true,
  sectionPaddings: true,
});

export const updateCombinedSchema = z.object({
  title: createDocumentTableSchema.shape.title.optional(),
  status: createDocumentTableSchema.shape.status.optional(),
  thumbnail: createDocumentTableSchema.shape.thumbnail.optional(),
  summary: createDocumentTableSchema.shape.summary.optional(),
  themeColor: createDocumentTableSchema.shape.themeColor.optional(),
  currentPosition: createDocumentTableSchema.shape.currentPosition.optional(),
  projectsSectionTitle: createDocumentTableSchema.shape.projectsSectionTitle.optional(),
  languagesSectionTitle: createDocumentTableSchema.shape.languagesSectionTitle.optional(),
  skillsDisplayFormat: createDocumentTableSchema.shape.skillsDisplayFormat.optional(),
  personalInfoDisplayFormat: createDocumentTableSchema.shape.personalInfoDisplayFormat.optional(),
  pagesOrder: z.array(z.string()).optional(),
  direction: createDocumentTableSchema.shape.direction.optional(),
  sectionPaddings: z
    .object({
      personalInfo: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      summary: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      experience: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      education: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      skills: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      projects: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
      languages: z
        .object({
          paddingTop: z.number().optional(),
          paddingBottom: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  personalInfo: personalInfoTableSchema.optional(),
  education: z.array(educationTableSchema).optional(),
  experience: z.array(experienceTableSchema).optional(),
  skills: z.array(skillsTableSchema).optional(),
  projects: z.array(projectTableSchema).optional(),
  languages: z.array(languageTableSchema).optional(),
});

export type DocumentSchema = z.infer<typeof createDocumentTableSchema>;

export type UpdateDocumentSchema = z.infer<typeof updateCombinedSchema>;
