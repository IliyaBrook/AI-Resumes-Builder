# AI Resume Builder — Junie Agent Guidelines

## Core Commands

- `yarn dev` — Start development server with Turbopack
- `yarn start` — Start production server
- `yarn db:run` — Start Postgres database (Docker)
- `yarn db:init` — Initialize database with SQL
- `yarn db:push` — Push Drizzle schema to DB

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

## Best Practices (MANDATORY)

### Component Reuse & DRY Principles

1. **ALWAYS check existing components first**:
   - Search `components/` folder before creating new components
   - Look for similar UI patterns that can be reused
   - Check `components/ui/` for base components (buttons, inputs, etc.)

2. **Create reusable components**:
   - Make components generic with configurable props
   - Use TypeScript interfaces for clear prop definitions
   - Extract common patterns into shared components
   - Add components to appropriate `index.ts` for easy imports

3. **Follow DRY methodology**:
   - Extract repeated logic into custom hooks (`hooks/` folder)
   - Create utility functions in `lib/` for shared business logic
   - Reuse Zod schemas across forms and API validation
   - Share constants and types across modules

4. **Component organization**:
   - Form components: Handle input/validation logic
   - Preview components: Pure rendering, no business logic
   - UI components: Reusable primitives (buttons, inputs, cards)
   - Feature components: Business-specific functionality

### Code Reuse Examples

- **Instead of**: Creating new button variants → **Use**: Existing Button component with props
- **Instead of**: Copying form validation → **Use**: Shared Zod schemas
- **Instead of**: Duplicating API calls → **Use**: Custom hooks with React Query
- **Instead of**: Repeating styling → **Use**: Tailwind component classes or CSS variables

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
