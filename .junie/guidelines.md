AI Resume Builder — Project Guidelines (for Advanced Contributors)

Source basis: This document distills the operational and contribution specifics from CLAUDE.md and tailors them
to Junie’s workflow requirements. It focuses on project‑specific practices (not generic React/Next.js knowledge).

Core lifecycle commands:

- yarn dev — Next dev with Turbopack.
- yarn start — Start production server.

Environment setup

- Install deps: yarn install
- Database (Docker): yarn db:run (spins up Postgres from docker-compose.yml)
- Initialize DB with provided SQL: yarn db:init (uses POSTGRES_URL)
- Drizzle schema ops:
    - yarn db:push — Push Drizzle schema to DB
    - yarn db:migrate — Run migrations

Required environment variables (see CLAUDE.md “Environment Setup”):

- POSTGRES_URL=postgresql://...
- POSTGRES_DB=ai_resumes_builder
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=yourpassword
- GOOGLE_AI_API_KEY=your_gemini_api_key

Place these in .env for local development. dotenv-cli is used by some scripts (e.g., db:init).

Database backup and restore (Make targets):

- make db-backup — Create dump into dumps/
- make db-restore — Restore from latest (or specified) dump
- make db-list-dumps — List available backups

Module resolution / project type

- type: module in package.json; prefer ESM imports.
- TS config is strict; typecheck runs as part of yarn lint (yarn tsc --noEmit).

2. Testing: Running, Adding, and Example Demo

Current state

- There is no formal test runner (Jest/Vitest) configured. The quality gates rely on ESLint, TypeScript success,
  and targeted runtime checks.
- For lightweight, project‑specific assertions, prefer minimal Node scripts that reuse existing dependencies (e.g., zod)
  to validate data contracts.

How to run tests today

- Quality checks (run always):
    - yarn lint
    - yarn format:check
- Ad‑hoc runtime test scripts: node path/to/script.mjs

Guidelines for adding tests

- For API/data contract validation, use zod (already a dependency) to validate representative payloads and DB‑derived
  objects.
- Keep demo/health scripts colocated under scripts/ and use ESM (.mjs) so they can run without transpilation.
- If you choose to introduce a formal test runner:
    - Prefer Vitest for fast TS ESM support; cofigure minimal vitest.config.ts, and scope to non‑UI logic first (
      schemas, utils, API handlers sans Next runtime).
    - Keep the mandatory quality gate intact: tests are in addition to lint/format, not replacements.

Demonstrated simple test (verified during preparation of this guideline)

- We executed the following process using the already‑installed zod runtime to validate a resume‑like sample:
    1. Create a temporary file scripts/demo-test.mjs with this content:

       import { z } from 'zod';

       const PersonalInfoSchema = z.object({
       fullName: z.string().min(1),
       email: z.string().email(),
       phone: z.string().min(7),
       location: z.string().min(2),
       });

       const ResumeSchema = z.object({
       personalInfo: PersonalInfoSchema,
       skills: z.array(z.string()).min(1),
       experience: z.array(z.object({
       company: z.string().min(1),
       role: z.string().min(1),
       startDate: z.string().min(4),
       endDate: z.string().min(4).or(z.literal('present')),
       highlights: z.array(z.string()).min(1),
       })).min(1),
       });

       const sample = {
       personalInfo: { fullName: 'Alex Dev', email: 'alex@example.com', phone: '+1-555-0100', location: 'Remote' },
       skills: ['TypeScript', 'Next.js'],
       experience: [{ company: 'Acme Inc', role: 'Frontend Engineer', startDate: '2023-01', endDate: 'present',
       highlights: ['Built resume preview renderer', 'Improved PDF export'] }],
       };

       try {
       const parsed = ResumeSchema.parse(sample);
       process.exit(0);
       } catch (err) {
       console.error('[demo-test] Validation failed:', err);
       process.exit(1);
       }

    2. Run it: node scripts/demo-test.mjs
    3. Remove the file after verification: rm scripts/demo-test.mjs

- This approach avoids bringing in a full test framework while still exercising domain assumptions using real project
  deps.

Adding new tests going forward

- Favor small, focused runtime checks around:
    - zod schemas used by db/schema/\* and API validators (@hono/zod-validator)
    - critical lib functions in lib/ and hooks/ that can run outside Next runtime
- Keep browser automation optional. While puppeteer is available, prefer Playwright only if you add it with config and
  CI support; don’t gate routine work on it.

3. Additional Development Information

Code style and quality

- ESLint: next + typescript rules with eslint-config-prettier and eslint-plugin-unused-imports. Always keep yarn lint
  clean.
- Formatting: Prettier with prettier-plugin-tailwindcss. Enforce with yarn format and yarn format:check.
- Dead code/unused deps: knip
    - Audit: yarn check:unused
    - Autofix: yarn fix:unused (review changes before committing)
- Comment cleanup: yarn remove-comments then yarn format
- Don't change the \*.css?inline files and ignore errors in the linter, if existed, this logic works correctly

Database and schema

- Drizzle ORM schema files live under db/schema/. Keep schema and zod definitions in sync (drizzle-zod).
- Use yarn db:push for local dev convenience; promote changes with proper migrations (yarn db:migrate) when
  collaborating.
- Use Makefile targets to back up dumps/ prior to destructive changes.

API layer

- Hono is used for lightweight API routing with zod validation (@hono/zod-validator). Keep request/response zod schemas
  near handlers for tight feedback.

Frontend patterns

- React Query for server state; React Context for global state (e.g., theme); local state for form fields.
- Follow the established component split: form components handle input/validation; preview components render formatted
  output. Keep index.ts files to curate public component APIs.

Performance and stability checks

- For large refactors, run yarn check:unused and review. Remove or fix unused exports to keep bundle size lean.

Common pitfalls

- Missing env vars (POSTGRES_URL, GOOGLE_AI_API_KEY) cause runtime failures. Ensure .env is loaded for db:init and local
  dev.
- Inconsistent schema vs. UI forms: update both the Drizzle schema and the UI form zod validators together.
- ESM/TS interop: prefer .mjs for standalone scripts; avoid ts-node in this repo to keep the toolchain minimal.

Minimal pre-commit routine (must pass)

1. yarn lint
2. yarn format:check

If any step fails, fix it before committing. These gates are non‑negotiable and inherited directly from CLAUDE.md.
