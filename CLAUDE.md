# AI Resume Builder - Claude Code Guidelines

## Project Overview

This is a Next.js-based AI resume builder application that helps users create professional resumes with AI assistance. The project uses Gemini AI for content generation, PostgreSQL for data storage, and modern React patterns for the frontend.

## Development Commands

### Core Development

```bash
# Development server with turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Database Operations

```bash
# Run PostgreSQL via Docker
npm run db:run

# Push schema changes to database
npm run db:push

# Run database migrations
npm run db:migrate

# Initialize database with SQL file
npm run db:init
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

### Code Quality & Formatting

```bash
# Lint and type check
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Remove comments and format
npm run remove-comments

# Check for unused dependencies/exports
npm run check:unused

# Fix unused dependencies/exports
npm run fix:unused
```

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

### File Organization

- Components should be organized by feature/page
- Use index.ts files for clean exports
- Follow the existing folder structure in `/app`, `/components`, `/hooks`, `/lib`
- Keep related files grouped together (forms, previews, etc.)

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
npm run lint
npm run format:check
npm run build
```

### Database Testing

Test database operations with:

```bash
npm run db:push  # Apply schema changes
npm run check:unused  # Check for unused code
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

1. Install dependencies: `npm install`
2. Set up PostgreSQL (Docker or local)
3. Configure environment variables
4. Initialize database: `npm run db:init`
5. Start development server: `npm run dev`

## Problem-Solving Process

When implementing new features or fixing issues:

1. **Explore**: Read relevant files to understand current implementation
2. **Plan**: Break down the task into smaller, manageable steps
3. **Code**: Implement following existing patterns and conventions
4. **Test**: Verify functionality works as expected
5. **Quality Check**: Run linting, formatting, and build commands

### Decision Documentation

After completing tasks, provide:

- What was implemented/changed
- Why this approach was chosen
- How it fits into the existing architecture
- Any trade-offs or considerations made

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

This project follows a clean architecture pattern with separation of concerns, making it maintainable and scalable for resume building functionality.
