import { z } from 'zod';
import { getServerAIChatSession } from './index';
import type { AIFile } from './types';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const importedPersonalInfoSchema = z
  .object({
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    jobTitle: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    github: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
  })
  .partial();

export const importedExperienceSchema = z.object({
  title: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  startDate: z.union([dateString, z.literal(''), z.null()]).optional(),
  endDate: z.union([dateString, z.literal(''), z.null()]).optional(),
  currentlyWorking: z.boolean().optional(),
  workSummary: z.string().nullable().optional(),
});

export const importedEducationSchema = z.object({
  educationType: z.enum(['university', 'course']).optional(),
  universityName: z.string().nullable().optional(),
  degree: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.union([dateString, z.literal(''), z.null()]).optional(),
  endDate: z.union([dateString, z.literal(''), z.null()]).optional(),
  currentlyStudying: z.boolean().optional(),
});

export const importedSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().nullable().optional(),
  rating: z.number().int().min(0).max(5).optional(),
});

export const importedProjectSchema = z.object({
  name: z.string().min(1),
  url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  git: z.string().nullable().optional(),
});

export const importedLanguageSchema = z.object({
  name: z.string().min(1),
  level: z.string().nullable().optional(),
});

export const importedWarningSchema = z.object({
  type: z.enum(['unsupported_section', 'uncertain_field', 'format_issue']),
  label: z.string(),
  content: z.string(),
  suggestion: z.string().nullable().optional(),
});

export const importedResumeSchema = z.object({
  data: z.object({
    summary: z.string().nullable().optional(),
    armyService: z.string().nullable().optional(),
    personalInfo: importedPersonalInfoSchema.optional(),
    experiences: z.array(importedExperienceSchema).optional(),
    educations: z.array(importedEducationSchema).optional(),
    skills: z.array(importedSkillSchema).optional(),
    projects: z.array(importedProjectSchema).optional(),
    languages: z.array(importedLanguageSchema).optional(),
  }),
  warnings: z.array(importedWarningSchema).optional(),
});

export type ImportedResumeResult = z.infer<typeof importedResumeSchema>;

const SYSTEM_PROMPT =
  'You are a resume-parsing assistant. You extract structured data from the resume the user provides and respond with one JSON object that matches the requested schema. Output only the JSON object — no preamble, no markdown code fences, no commentary.';

const TASK_INSTRUCTIONS = `Read the attached resume and produce a single JSON object describing it in the schema below.

OUTPUT RULES
- Output ONLY a valid JSON object. No prose, no markdown fences.
- Preserve the original visual formatting of rich-text fields ("summary", "workSummary", education "description", project "description"). Apply this rule to EVERY rich-text field, including the summary — even when the summary is a single paragraph of prose, you MUST wrap each bold/italic/underlined run of text with the matching HTML tag.
  Tag mapping:
    - Any word or phrase that is bold in the source -> <strong>...</strong>
    - Any word or phrase that is italic in the source -> <em>...</em>
    - Any word or phrase that is underlined in the source -> <u>...</u>
    - Bulleted lists -> <ul><li>...</li></ul>
    - Hard line breaks inside a block -> <br/>
    - Separate paragraphs -> wrap each in <p>...</p>
  Example of correct summary handling. Source (bold rendered with **markers**):
    **Full Stack Developer** with **4+ years of experience** building scalable apps using **React** and **Node.js**.
  Correct JSON value:
    "<strong>Full Stack Developer</strong> with <strong>4+ years of experience</strong> building scalable apps using <strong>React</strong> and <strong>Node.js</strong>."
  Do NOT invent structure that isn't in the source. If a run of text is plain in the source, leave it plain. But if you see any bold/italic/underline runs anywhere — including inside summary prose — you MUST emit the tag.
- Use null for missing fields, never empty strings.
- Dates use the format YYYY-MM-DD. If only year is known, use YYYY-01-01. If year+month, use YYYY-MM-01.
- For open-ended ranges ("Present", "Current", "now") set endDate to null and currentlyWorking (or currentlyStudying) to true.
- Default skill rating to 4 if not explicit. Skip skills without a clear name.
- Education entries that are clearly short courses/bootcamps use educationType "course"; degrees use "university".
- Languages: normalize level to "Native", "Fluent", "Advanced", "Intermediate", or "Basic" if possible; otherwise use the raw text.
- For content that does not fit the schema (Certifications, Awards, Publications, Volunteer, References, Hobbies, etc.) add a warning with type "unsupported_section".
- If a value is present but cannot be mapped cleanly, add a warning with type "uncertain_field" describing what you saw.
- Hard caps: experiences <= 25, educations <= 15, skills <= 100, projects <= 30, languages <= 10, warnings <= 20.

SCHEMA
{
  "data": {
    "summary": string | null,
    "armyService": string | null,
    "personalInfo": {
      "firstName": string | null,
      "lastName": string | null,
      "jobTitle": string | null,
      "address": string | null,
      "phone": string | null,
      "email": string | null,
      "github": string | null,
      "linkedin": string | null
    },
    "experiences": [{
      "title": string | null,
      "companyName": string | null,
      "city": string | null,
      "state": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "currentlyWorking": boolean,
      "workSummary": string | null
    }],
    "educations": [{
      "educationType": "university" | "course",
      "universityName": string | null,
      "degree": string | null,
      "major": string | null,
      "description": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "currentlyStudying": boolean
    }],
    "skills": [{ "name": string, "category": string | null, "rating": 0-5 integer }],
    "projects": [{ "name": string, "url": string | null, "description": string | null, "git": string | null }],
    "languages": [{ "name": string, "level": string | null }]
  },
  "warnings": [{
    "type": "unsupported_section" | "uncertain_field" | "format_issue",
    "label": string,
    "content": string,
    "suggestion": string | null
  }]
}

Return the JSON object now.`;

function stripCodeFences(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*\n?/i, '');
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }
  }
  return text.trim();
}

function extractJsonObject(raw: string): string {
  const stripped = stripCodeFences(raw);
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('AI response did not contain a JSON object');
  }
  return stripped.slice(firstBrace, lastBrace + 1);
}

function parseAIResponse(response: string): ImportedResumeResult {
  const jsonText = extractJsonObject(response);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`AI returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  const result = importedResumeSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI response did not match expected schema: ${result.error.message}`);
  }
  return result.data;
}

export async function parseResumeFromFile(file: AIFile): Promise<ImportedResumeResult> {
  const chat = getServerAIChatSession();
  const { text } = await chat.sendMessageWithFile({
    message: TASK_INSTRUCTIONS,
    systemPrompt: SYSTEM_PROMPT,
    file,
  });
  return parseAIResponse(text);
}

export async function parseResumeFromHtml(html: string): Promise<ImportedResumeResult> {
  const trimmed = html.trim();
  if (!trimmed) {
    throw new Error('Resume content is empty');
  }
  const chat = getServerAIChatSession();
  const userMessage = `${TASK_INSTRUCTIONS}\n\nRESUME CONTENT (HTML — preserve formatting markers):\n---\n${trimmed}\n---`;
  const { text } = await chat.sendMessage({
    message: userMessage,
    systemPrompt: SYSTEM_PROMPT,
  });
  return parseAIResponse(text);
}
