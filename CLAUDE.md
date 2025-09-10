# AI Resume Builder - Claude Code Guidelines

## 🚨 CRITICAL WORKFLOW REQUIREMENTS

### Mandatory Code Quality Checks

**YOU MUST ALWAYS follow this exact sequence when modifying code:**

1. **Make your changes**
2. **IMMEDIATELY run ESLint**: `yarn lint`
3. **If ESLint shows ANY errors**: You MUST fix them in the current task - this is NON-NEGOTIABLE
4. **Run format check**: `yarn format:check`
5. **Verify build passes**: `yarn build`
6. **Only then commit your changes**

**IMPORTANT**: If ESLint reports errors, fixing them is part of the current task, not a separate future task.

## Project Overview

This is a Next.js-based AI resume builder application that helps users create professional resumes with AI assistance.
The project uses Gemini AI for content generation, PostgreSQL for data storage, and modern React patterns for the
frontend.

## Development Commands

### Core Development

```bash
# Development server with turbopack
yarn dev

# Build for production (MUST pass before committing)
yarn build

# Start production server
yarn start
```

### Database Operations

```bash
# Run PostgreSQL via Docker
yarn db:run

# Push schema changes to database
yarn db:push

# Run database migrations
yarn db:migrate

# Initialize database with SQL file
yarn db:init
```

### Database Backup & Restore

```bash
# Create backup
make db-backup

# Restore from backup
make db-restore

# List available backups
make db-list-dumps
```

### Code Quality & Formatting (MANDATORY after any code change)

```bash
# Lint and type check (CRITICAL - run after every code change)
yarn lint

# Fix linting issues
yarn lint:fix

# Format code with Prettier
yarn format

# Check code formatting
yarn format:check

# Remove comments and format
yarn remove-comments

# Check for unused dependencies/exports
yarn check:unused

# Fix unused dependencies/exports
yarn fix:unused
```

## Recommended Workflows

### Primary Workflow: Explore → Plan → Code → Commit

1. **Explore**: Read relevant files to understand current implementation
    - Ask me to read specific files or give general pointers
    - Use `think hard` for complex analysis
    - Consider using subagents for complex problems to verify details
2. **Plan**: Create a detailed plan before coding
    - Ask me to explicitly approve the plan before implementing
    - Use `think` / `think hard` / `think harder` / `ultrathink` for progressively more computational power
    - Consider creating a document or GitHub issue with the plan
3. **Code**: Implement following existing patterns
    - Follow existing project structure and conventions
    - Ask me to explicitly verify reasonableness as you implement
4. **Quality Check**: Run mandatory quality checks
    - `yarn lint` (fix ANY errors found)
    - `yarn format:check`
    - `yarn build`
5. **Commit**: Only after all checks pass
    - Create descriptive commit message
    - Update READMEs or changelogs if relevant

### Test-Driven Development Workflow

1. **Write tests first** based on expected input/output pairs
    - Be explicit about doing TDD to avoid mock implementations
2. **Run tests** to confirm they fail
3. **Commit tests** when satisfied
4. **Write code** to make tests pass (don't modify tests)
    - Keep iterating until all tests pass
    - Consider using subagents to verify implementation isn't overfitting
5. **Run quality checks** (yarn lint, format check, build)
6. **Commit implementation** when all checks pass

### For Complex Tasks: Use Checklists and Scratchpads

For large tasks with multiple steps:

- Create a markdown file as checklist and working scratchpad
- Write all errors/tasks with filenames and line numbers
- Address each issue one by one, checking off as completed
- Use for: code migrations, fixing numerous lint errors, complex build scripts

## Code Style Guidelines

### Language Requirements

- Use English only in code, comments, and documentation
- All variable names, function names, and types must be in English
- Database schema and API endpoints must use English naming

### Code Quality Standards

- Write clean, DRY (Don't Repeat Yourself) code
- Follow existing project structure and patterns
- Do NOT leave code comments unless absolutely necessary for complex logic
- Use TypeScript for all new code with proper type annotations
- Follow React best practices and hooks patterns
- Don't change the *.css?inline files and ignore errors in the linter, if existed, this logic works correctly

### File Organization

- Components should be organized by feature/page
- Use index.ts files for clean exports
- Follow the existing folder structure in `/app`, `/components`, `/hooks`, `/lib`
- Keep related files grouped together (forms, previews, etc.)

### Naming Conventions

- Use kebab-case for directories
- Use PascalCase for React components
- Use camelCase for utility functions and hooks
- Use lowercase for configuration files

### Database Schema

- Located in `/db/schema/` directory
- Use Drizzle ORM for all database operations
- Follow existing naming conventions for tables and columns

### API Routes

- Use Hono framework for API endpoints in `/app/api/[[...route]]/`
- Implement proper error handling and validation
- Use Zod for request/response validation

## Testing & Quality Assurance

### Before Committing

Always run these commands before committing changes:

```bash
yarn lint           # MANDATORY - fix ANY errors found
yarn format:check   # Ensure proper formatting
yarn build          # Verify build succeeds
```

### Database Testing

Test database operations with:

```bash
yarn db:push       # Apply schema changes
yarn check:unused  # Check for unused code
```

## Technology Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** with modern hooks
- **TypeScript** for type safety
- **Tailwind CSS** with Shadcn UI components
- **React Query** for data fetching and caching

### Backend

- **Hono** for API framework
- **Drizzle ORM** with PostgreSQL
- **Zod** for validation
- **Google Gemini AI** for content generation

### Development Tools

- **ESLint** + **Prettier** for code formatting
- **Knip** for unused code detection
- **Docker** for PostgreSQL development database
- **Context7** for library documentation and API references
- **Playwright** for UI testing and browser automation

## Architecture Patterns

### Component Structure

- Form components handle data input and validation
- Preview components display formatted data
- Index files export clean component APIs
- Hooks manage data fetching and mutations

### State Management

- Use React Query for server state
- Use React Context for global client state (theme, etc.)
- Use local component state for form inputs

### Data Flow

- Forms → API Routes → Database via Drizzle ORM
- Real-time updates through React Query invalidation
- AI content generation through Gemini API integration

## Environment Setup

### Required Environment Variables

```bash
# Database
POSTGRES_URL=postgresql://...
POSTGRES_DB=ai_resumes_builder
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword

# AI Integration
GOOGLE_AI_API_KEY=your_gemini_api_key
```

### Local Development Setup

1. Install dependencies: `yarn install`
2. Set up PostgreSQL (Docker or local)
3. Configure environment variables
4. Initialize database: `yarn db:init`
5. Start development server: `yarn dev`

## Problem-Solving Process

When implementing new features or fixing issues:

1. **Explore**: Read relevant files to understand current implementation
2. **Plan**: Break down the task into smaller, manageable steps
    - Use `think` / `think hard` / `think harder` / `ultrathink` for complex analysis
    - Create explicit plans and get approval before coding
3. **Code**: Implement following existing patterns and conventions
4. **Test**: Verify functionality works as expected
5. **Quality Check**: Run mandatory linting, formatting, and build commands
6. **Commit**: Only after all checks pass

### Extended Thinking for Complex Problems

Use these specific phrases for different levels of computational power:

- **"think"**: basic thinking mode
- **"think hard"**: more computational power
- **"think harder"**: even more analysis
- **"ultrathink"**: maximum thinking budget

### Context Management

- Use `/clear` frequently between different tasks to reset context window
- Keep conversations focused on current task
- For long sessions, context can fill with irrelevant information

### Course Correction Tools

- Ask me to make a plan before coding major changes
- Press Escape to interrupt and redirect if needed
- Double-tap Escape to jump back in history and edit previous prompts
- Ask me to "undo changes" if approach isn't working
- Be specific in instructions - vague requests lead to poor results

### Decision Documentation

After completing tasks, provide:

- What was implemented/changed
- Why this approach was chosen
- How it fits into the existing architecture
- Any trade-offs or considerations made

## Common Workflows

### Fixing Lint Errors (CRITICAL WORKFLOW)

1. Run `yarn lint` to see all errors
2. Create a markdown checklist of all errors with filenames and line numbers
3. Fix each error one by one, checking it off the list
4. Verify fix with `yarn lint` before moving to next error
5. Run final quality check suite before committing
6. **NEVER leave lint errors unfixed in the current task**

### Adding New Features

1. **Explore**: Read related files to understand patterns
2. **Plan**: Document approach and get approval (`think hard` for complex features)
3. **Test**: Write tests first (TDD approach when applicable)
4. **Code**: Implement following existing patterns
5. **Quality**: Run full quality check suite
6. **Commit**: Create descriptive commit message

### Visual/UI Development

1. Provide design mocks or screenshots as reference
2. Implement design in code
3. Take screenshots of result (if possible)
4. Iterate until result matches mock
5. Run quality checks and commit

### Codebase Q&A and Learning

Ask me questions like you would ask another engineer:

- How does logging work in this codebase?
- How do I make a new API endpoint?
- What does this specific code block do?
- What edge cases does this component handle?
- Why was this approach chosen over alternatives?

## Repository Standards

### Commit Guidelines

- Use clear, descriptive commit messages
- Run quality checks before committing
- Group related changes in single commits

### File Naming

- Use kebab-case for directories
- Use PascalCase for React components
- Use camelCase for utility functions and hooks
- Use lowercase for configuration files

## Emergency Procedures

### If ESLint Fails

1. **STOP** - do not proceed with other tasks
2. Read the error messages carefully
3. Fix each error systematically
4. Re-run `yarn lint` to verify fixes
5. Only continue after all lint errors are resolved

### If Build Fails

1. Check for TypeScript errors first
2. Verify all imports are correct
3. Check for missing dependencies
4. Run `yarn lint` to catch syntax issues
5. Only commit after successful build

### If Tests Fail

1. Read test error messages carefully
2. Understand what the test expects vs what code produces
3. Fix the underlying issue (don't just make tests pass)
4. Verify related functionality still works
5. Run full test suite before committing

## Multi-Claude Workflows (Advanced)

For complex tasks, consider:

- Using separate Claude instances for code writing vs. code review
- Having one Claude write tests while another writes implementation
- Using git worktrees for parallel development on different features
- Using `/clear` to separate contexts between different aspects of the same task

This project follows a clean architecture pattern with separation of concerns, making it maintainable and scalable for
resume building functionality. Quality checks are mandatory and must pass before any code is committed.
