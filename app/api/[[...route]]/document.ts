import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  createDocumentTableSchema,
  DocumentSchema,
  documentTable,
  updateCombinedSchema,
  UpdateDocumentSchema,
} from "@/db/schema/document";
import { generateDocUUID } from "@/lib/helper";
import { db } from "@/db";
import {
  educationTable,
  experienceTable,
  personalInfoTable,
  skillsTable,
  projectTable,
} from "@/db/schema";

const documentRoute = new Hono()
  .post(
    "/create",
    zValidator("json", createDocumentTableSchema),
    async (c) => {
      try {
        const { title } = c.req.valid("json") as DocumentSchema;
        const documentId = generateDocUUID();

        const newDoc = {
          title: title,
          documentId: documentId,
        };

        const [data] = await db
          .insert(documentTable)
          .values(newDoc)
          .returning();
        return c.json(
          {
            success: "ok",
            data,
          },
          { status: 200 }
        );
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Failed to create document",
            error: error,
          },
          500
        );
      }
    }
  )
  .patch(
    "/update/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    zValidator("json", updateCombinedSchema),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");

        const {
          title,
          status,
          summary,
          thumbnail,
          themeColor,
          currentPosition,
          personalInfo,
          experience,
          education,
          skills,
          projects,
          projectsSectionTitle,
          skillsDisplayFormat,
        } = c.req.valid("json");

        if (!documentId) {
          return c.json({ error: "DocumentId is required" }, 400);
        }

        await db.transaction(async (trx) => {
          const [existingDocument] = await trx
            .select()
            .from(documentTable)
            .where(
              and(
                eq(documentTable.documentId, documentId)
              )
            );

          if (!existingDocument) {
            return c.json({ error: "Document not found" }, 404);
          }

          const resumeUpdate = {} as UpdateDocumentSchema;
          if (title) resumeUpdate.title = title;
          if (thumbnail) resumeUpdate.thumbnail = thumbnail;
          if (summary) resumeUpdate.summary = summary;
          if (themeColor) resumeUpdate.themeColor = themeColor;
          if (status) resumeUpdate.status = status;
          if (currentPosition)
            resumeUpdate.currentPosition = currentPosition || 1;
          if (projectsSectionTitle !== undefined)
            resumeUpdate.projectsSectionTitle = projectsSectionTitle;
          if (skillsDisplayFormat !== undefined)
            resumeUpdate.skillsDisplayFormat = skillsDisplayFormat;

          if (Object.keys(resumeUpdate)?.length > 0) {
            await trx
              .update(documentTable)
              .set(resumeUpdate)
              .where(
                and(
                  eq(documentTable.documentId, documentId)
                )
              )
              .returning();
          }

          if (personalInfo) {
            if (!personalInfo?.firstName && !personalInfo?.lastName) {
              return;
            }
            const exists = await trx
              .select()
              .from(personalInfoTable)
              .where(eq(personalInfoTable.docId, existingDocument.documentId))
              .limit(1);

            if (exists.length > 0) {
              await trx
                .update(personalInfoTable)
                .set(personalInfo)
                .where(eq(personalInfoTable.docId, existingDocument.documentId));
            } else {
              await trx.insert(personalInfoTable).values({
                docId: existingDocument.documentId,
                ...personalInfo,
              });
            }
          }

          if (experience && Array.isArray(experience)) {
            const existingExperience = await trx
              .select()
              .from(experienceTable)
              .where(eq(experienceTable.docId, existingDocument.documentId));

            const existingExperienceMap = new Set(
              existingExperience.map((exp) => exp.id)
            );

            for (const exp of experience) {
              const { id, ...data } = exp;
              if (id !== undefined && existingExperienceMap.has(id)) {
                await trx
                  .update(experienceTable)
                  .set(data)
                  .where(
                    and(
                      eq(experienceTable.docId, existingDocument.documentId),
                      eq(experienceTable.id, id)
                    )
                  );
              } else {
                await trx.insert(experienceTable).values({
                  docId: existingDocument.documentId,
                  ...data,
                });
              }
            }
          }

          if (education && Array.isArray(education)) {
            const existingEducation = await trx
              .select()
              .from(educationTable)
              .where(eq(educationTable.docId, existingDocument.documentId));

            const existingEducationMap = new Set(
              existingEducation.map((edu) => edu.id)
            );

            for (const edu of education) {
              const { id, ...data } = edu;
              if (id !== undefined && existingEducationMap.has(id)) {
                await trx
                  .update(educationTable)
                  .set(data)
                  .where(
                    and(
                      eq(educationTable.docId, existingDocument.documentId),
                      eq(educationTable.id, id)
                    )
                  );
              } else {
                await trx.insert(educationTable).values({
                  docId: existingDocument.documentId,
                  ...data,
                });
              }
            }
          }

          if (skills && Array.isArray(skills)) {
            const existingskills = await trx
              .select()
              .from(skillsTable)
              .where(eq(skillsTable.docId, existingDocument.documentId));

            const existingSkillsMap = new Set(
              existingskills.map((skill) => skill.id)
            );

            for (const skill of skills) {
              const { id, ...data } = skill;
              if (id !== undefined && existingSkillsMap.has(id)) {
                await trx
                  .update(skillsTable)
                  .set(data)
                  .where(
                    and(
                      eq(skillsTable.docId, existingDocument.documentId),
                      eq(skillsTable.id, id)
                    )
                  );
              } else {
                await trx.insert(skillsTable).values({
                  docId: existingDocument.documentId,
                  ...data,
                });
              }
            }
          }

          if (projects && Array.isArray(projects)) {
            const existingProjects = await trx
              .select()
              .from(projectTable)
              .where(eq(projectTable.docId, existingDocument.documentId));

            const existingProjectsMap = new Set(
              existingProjects.map((proj) => proj.id)
            );

            for (const proj of projects) {
              const { id, ...data } = proj;
              if (id !== undefined && existingProjectsMap.has(id)) {
                await trx
                  .update(projectTable)
                  .set(data)
                  .where(
                    and(
                      eq(projectTable.docId, existingDocument.documentId),
                      eq(projectTable.id, id)
                    )
                  );
              } else {
                await trx.insert(projectTable).values({
                  docId: existingDocument.documentId,
                  ...data,
                });
              }
            }
          }
        });

        return c.json(
          {
            success: "ok",
            message: "Updated successfully",
          },
          { status: 200 }
        );
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Failed to update document",
            error: error,
          },
          500
        );
      }
    }
  )
  .patch(
    "/retore/archive",
    zValidator(
      "json",
      z.object({
        documentId: z.string(),
        status: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId, status } = c.req.valid("json");

        if (!documentId) {
          return c.json({ message: "DocumentId must provided" }, 400);
        }

        if (status !== "archived") {
          return c.json(
            { message: "Status must be archived before restore" },
            400
          );
        }

        const [documentData] = await db
          .update(documentTable)
          .set({
            status: "private",
          })
          .where(
            and(
              eq(documentTable.documentId, documentId),
              eq(documentTable.status, "archived")
            )
          )
          .returning();

        if (!documentData) {
          return c.json({ message: "Document not found" }, 404);
        }

        return c.json(
          {
            success: "ok",
            message: "Updated successfully",
            data: documentData,
          },
          { status: 200 }
        );
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Failed to retore document",
            error: error,
          },
          500
        );
      }
    }
  )
  .get("all", async (c) => {
    try {
      const documents = await db
        .select()
        .from(documentTable)
        .orderBy(desc(documentTable.updatedAt))
        .where(
          and(
            ne(documentTable.status, "archived")
          )
        );
      return c.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Failed to fetch documents",
          error: error,
        },
        500
      );
    }
  })
  .get(
    "/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");

        const documentData = await db.query.documentTable.findFirst({
          where: and(
            eq(documentTable.documentId, documentId)
          ),
          with: {
            personalInfo: true,
            experiences: {
              orderBy: (experiences) => [experiences.order]
            },
            educations: true,
            skills: true,
            projects: {
              orderBy: (projects) => [projects.order]
            },
          },
        });
        return c.json({
          success: true,
          data: documentData,
        });
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Failed to fetch documents",
            error: error,
          },
          500
        );
      }
    }
  )
  .get(
    "public/doc/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");
        const documentData = await db.query.documentTable.findFirst({
          where: and(
            eq(documentTable.status, "public"),
            eq(documentTable.documentId, documentId)
          ),
          with: {
            personalInfo: true,
            experiences: {
              orderBy: (experiences) => [experiences.order]
            },
            educations: true,
            skills: true,
            projects: {
              orderBy: (projects) => [projects.order]
            },
          },
        });

        if (!documentData) {
          return c.json(
            {
              error: true,
              message: "unauthorized",
            },
            401
          );
        }
        return c.json({
          success: true,
          data: documentData,
        });
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Failed to fetch document",
            error: error,
          },
          500
        );
      }
    }
  )
  .get("/trash/all", async (c) => {
    try {
      const documents = await db
        .select()
        .from(documentTable)
        .where(
          and(
            eq(documentTable.status, "archived")
          )
        );
      return c.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: "Failed to fetch documents",
          error: error,
        },
        500
      );
    }
  })
  .delete(
    "/:documentId",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");
        if (!documentId) {
          return c.json({ error: "DocumentId is required" }, 400);
        }
        const deleted = await db.delete(documentTable).where(eq(documentTable.documentId, documentId)).returning();
        if (!deleted.length) {
          return c.json({ error: "Document not found" }, 404);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete document", error }, 500);
      }
    }
  )
  .delete(
    "/experience/:experienceId",
    zValidator(
      "param",
      z.object({
        experienceId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { experienceId } = c.req.valid("param");
        if (!experienceId) {
          return c.json({ error: "ExperienceId is required" }, 400);
        }
        const deleted = await db.delete(experienceTable).where(eq(experienceTable.id, Number(experienceId))).returning();
        if (!deleted.length) {
          return c.json({ error: "Experience not found" }, 404);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete experience", error }, 500);
      }
    }
  )
  .delete(
    "/education/:educationId",
    zValidator(
      "param",
      z.object({
        educationId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { educationId } = c.req.valid("param");
        if (!educationId) {
          return c.json({ error: "EducationId is required" }, 400);
        }
        const deleted = await db.delete(educationTable).where(eq(educationTable.id, Number(educationId))).returning();
        if (!deleted.length) {
          return c.json({ error: "Education not found" }, 404);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete education", error }, 500);
      }
    }
  )
  .delete(
    "/skill/:skillId",
    zValidator(
      "param",
      z.object({
        skillId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { skillId } = c.req.valid("param");
        if (!skillId) {
          return c.json({ error: "SkillId is required" }, 400);
        }
        const deleted = await db.delete(skillsTable).where(eq(skillsTable.id, Number(skillId))).returning();
        if (!deleted.length) {
          return c.json({ error: "Skill not found" }, 404);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete skill", error }, 500);
      }
    }
  )
  .post(
    "/experience/create",
    zValidator(
      "json",
      z.object({
        docId: z.string(),
        title: z.string().optional(),
        companyName: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        workSummary: z.string().optional(),
        currentlyWorking: z.boolean().optional(),
        yearsOnly: z.boolean().optional(),
      })
    ),
    async (c) => {
      try {
        const data = c.req.valid("json");
        const [created] = await db.insert(experienceTable).values(data).returning();
        return c.json(created, 200);
      } catch (error) {
        return c.json({ success: false, message: "Failed to create experience", error }, 500);
      }
    }
  )
  .post(
    "/education/create",
    zValidator(
      "json",
      z.object({
        docId: z.string(),
        universityName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        degree: z.string().optional(),
        major: z.string().optional(),
        description: z.string().optional(),
        currentlyStudying: z.boolean().optional(),
        skipDates: z.boolean().optional(),
      })
    ),
    async (c) => {
      try {
        const data = c.req.valid("json");
        const [created] = await db.insert(educationTable).values(data).returning();
        return c.json(created, 200);
      } catch (error) {
        return c.json({ success: false, message: "Failed to create education", error }, 500);
      }
    }
  )
  .post(
    "/skill/create",
    zValidator(
      "json",
      z.object({
        docId: z.string(),
        name: z.string().optional(),
        rating: z.number().optional(),
      })
    ),
    async (c) => {
      try {
        const data = c.req.valid("json");
        const [created] = await db.insert(skillsTable).values(data).returning();
        return c.json(created, 200);
      } catch (error) {
        return c.json({ success: false, message: "Failed to create skill", error }, 500);
      }
    }
  )
  .post(
    "/project/create",
    zValidator(
      "json",
      z.object({
        docId: z.string(),
        name: z.string(),
        url: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
      })
    ),
    async (c) => {
      try {
        const data = c.req.valid("json");
        const [created] = await db.insert(projectTable).values(data).returning();
        return c.json(created, 200);
      } catch (error) {
        return c.json({ success: false, message: "Failed to create project", error }, 500);
      }
    }
  )
  .delete(
    "/project/:projectId",
    zValidator(
      "param",
      z.object({
        projectId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { projectId } = c.req.valid("param");
        if (!projectId) {
          return c.json({ error: "ProjectId is required" }, 400);
        }
        const deleted = await db.delete(projectTable).where(eq(projectTable.id, Number(projectId))).returning();
        if (!deleted.length) {
          return c.json({ error: "Project not found" }, 404);
        }
        return c.json({ success: true });
      } catch (error) {
        return c.json({ success: false, message: "Failed to delete project", error }, 500);
      }
    }
  )
  .post(
    "/:documentId/duplicate",
    zValidator(
      "param",
      z.object({
        documentId: z.string(),
      })
    ),
    async (c) => {
      try {
        const { documentId } = c.req.valid("param");
        const original = await db.query.documentTable.findFirst({
          where: eq(documentTable.documentId, documentId),
          with: {
            personalInfo: true,
            experiences: true,
            educations: true,
            skills: true,
            projects: true,
          },
        });
        if (!original) {
          return c.json({ success: false, message: "Document not found" }, 404);
        }
        const newDocumentId = generateDocUUID();
        const now = new Date().toISOString();
        const [newDoc] = await db.insert(documentTable).values({
          ...original,
          id: undefined,
          documentId: newDocumentId,
          title: original.title + " (copy)",
          createdAt: now,
          updatedAt: now,
        }).returning();
        
        if (original.personalInfo) {
          await db.insert(personalInfoTable).values({
            ...original.personalInfo,
            id: undefined,
            docId: newDocumentId,
          });
        }
        
        for (const exp of original.experiences) {
          await db.insert(experienceTable).values({
            ...exp,
            id: undefined,
            docId: newDocumentId,
          });
        }
        
        for (const edu of original.educations) {
          await db.insert(educationTable).values({
            ...edu,
            id: undefined,
            docId: newDocumentId,
          });
        }
        
        for (const skill of original.skills) {
          await db.insert(skillsTable).values({
            ...skill,
            id: undefined,
            docId: newDocumentId,
          });
        }
        
        for (const proj of original.projects) {
          await db.insert(projectTable).values({
            ...proj,
            id: undefined,
            docId: newDocumentId,
          });
        }
        return c.json({ success: true, data: newDoc }, 200);
      } catch (error) {
        return c.json({ success: false, message: "Failed to duplicate document", error }, 500);
      }
    }
  );

export default documentRoute;
