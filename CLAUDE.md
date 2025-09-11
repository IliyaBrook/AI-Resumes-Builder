# AI Resume Builder — Junie Agent Guidelines

## Core Commands

- `yarn dev` — Start development server with Turbopack
- `yarn start` — Start production server
- `yarn db:run` — Start Postgres database (Docker)
- `yarn db:init` — Initialize database with SQL
- `yarn db:push` — Push Drizzle schema to DB

## Environment Setup

Required variables in `.env`:

```
POSTGRES_URL=postgresql://...
POSTGRES_DB=ai_resumes_builder
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
GOOGLE_AI_API_KEY=your_gemini_api_key
```

## Code Quality Rules (NON-NEGOTIABLE)

### During Development

1. **Make your changes**
2. **Continue coding without running checks** - focus on implementation

### End of Task (MANDATORY)

1. **IMMEDIATELY run ESLint**: `yarn lint`
2. **If ESLint shows ANY errors**: You MUST fix them - this is NON-NEGOTIABLE
3. **Run format check**: `yarn format:check`
4. **If format check fails**: Run `yarn format` to fix
5. **Only then consider task complete**

## Project Architecture

- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Hono for lightweight routing with Zod validation
- **State**: React Query for server state, React Context for global state
- **Module Type**: ESM imports (type: module in package.json)

## When to Use External Tools

### Context7

- Use for documentation lookup when working with unfamiliar libraries
- Call `Context7:resolve-library-id` first, then `Context7:get-library-docs`
- Helpful for React, Next.js, Drizzle, Hono specifics

### Playwright

- Use when implementing or testing browser automation features
- Required for PDF generation testing or complex UI interactions
- Install and configure only when specifically needed

## Database Operations

- Schema files: `db/schema/`
- Local development: `yarn db:push`
- Migrations: `yarn db:migrate`
- Backup: `make db-backup`
- Restore: `make db-restore`

## Key File Patterns

- Components: Separate form components (input/validation) from preview components (render)
- API routes: Use Hono with Zod validators
- Schemas: Keep Drizzle schema and Zod definitions in sync
- Ignore lint errors in `*.css?inline` files

## Common Pitfalls to Avoid

- Missing environment variables cause runtime failures
- Always update both Drizzle schema AND UI form validators together
- Use `.mjs` extension for standalone scripts
- Don't change CSS inline files even if linter complains