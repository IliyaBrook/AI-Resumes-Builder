# AI Resume Builder

## 📌 Project Overview

**AI Resume Builder** is a dynamic and efficient resume-building platform powered by AI. This project leverages
cutting-edge tools and frameworks to provide a seamless experience for creating professional resumes with intelligent
assistance.

## 🌟 Key Features

- ➕ **Create & Edit Resumes** - Full resume management system
- 🤖 **AI-Powered Content Generation** - Smart resume generation with pluggable AI providers (Gemini or Claude Code)
- 📥 **AI Resume Import** - Upload an existing PDF or DOCX and let AI map every section into the builder, preserving bold/italic/lists
- 🎨 **Customizable Themes** - Multiple color schemes and layouts
- 📸 **Resume Thumbnails** - Visual preview of your resume
- 🔎 **Search & Organization** - Find and manage your resumes easily
- 📡 **Real-Time Editing** - Live preview as you edit
- 👨‍💻 **PDF Export** - Download resumes in PDF format
- 🌐 **Internationalization** - Multi-language support with next-intl

### Enhanced Features

- **Multi-Provider AI Backend** - Switch between Google Gemini (API key) and Claude Code (local CLI, no API key) via a single env var
- **AI Content Control** - Control bullet count, character limits for AI-generated content
- **Rich Text Editor** - Format your content with advanced text editing
- **Resume Duplication** - Easily duplicate and modify existing resumes
- **Context-Aware AI** - AI considers your existing resume data for personalized suggestions
- **Enhanced Personal Information** - GitHub and LinkedIn profile integration
- **Flexible Layouts** - Customize personal information display format
- **Smart Summary Generation** - AI summaries with size options (Short, Large, Extra Large)
- **Professional Experience Tools**:
  - Mark end date as "Present"
  - Option to hide dates
  - Rich text editor for descriptions
- **Data Reordering** - Drag and reorder sections and entries
- **Projects Section** - Optional showcase for your portfolio with customizable title
- **Section Management** - Reorder all resume sections with intuitive controls

## 🚀 Tech Stack

- **Next.js 15** - React framework with App Router and Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS & Shadcn UI** - Modern, responsive styling
- **Hono API** - Lightweight backend framework
- **Tanstack React Query** - Efficient data fetching and caching
- **PostgreSQL** - Reliable database with Drizzle ORM
- **Pluggable AI Backend** - Google Gemini (`@google/genai`) or Claude Code (`@anthropic-ai/claude-agent-sdk`)
- **mammoth** - DOCX-to-HTML conversion for resume import
- **Docker** - Containerization for easy deployment

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **pnpm** (v9 or higher, managed via Corepack: `corepack enable`)
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL** (optional, for local non-Docker setup)

## ⚙️ Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Database Configuration
POSTGRES_URL=postgresql://postgres:yourpassword@localhost:5432/ai_resumes_builder
POSTGRES_DB=ai_resumes_builder
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI provider — "gemini" or "claude-code"
AI_PROVIDER=gemini

# Required when AI_PROVIDER=gemini (server-side only)
GEMINI_API_KEY=your-google-gemini-api-key
# GEMINI_MODEL=gemini-2.5-flash

# AI_PROVIDER=claude-code uses the locally installed Claude Code CLI.
# Run `claude login` once on the host — no API keys are needed.
# Optional model override:
# CLAUDE_CODE_MODEL=claude-sonnet-4-5-20250929
```

See [AI Providers](#-ai-providers) below for how to choose between Gemini and Claude Code.

## 🧠 AI Providers

All AI features (generation, summary, translate, **resume import**) are routed through a single server-side
abstraction in [`lib/ai/server`](./lib/ai/server). The provider is selected once via the `AI_PROVIDER` env var
and the same interface is reused everywhere — both providers support text prompts and PDF file input.

| Provider      | `AI_PROVIDER` value | Auth                                   | SDK                              |
| ------------- | ------------------- | -------------------------------------- | -------------------------------- |
| Google Gemini | `gemini` (default)  | `GEMINI_API_KEY` (server-side env var) | `@google/genai`                  |
| Claude Code   | `claude-code`       | Local `claude login` — no API key      | `@anthropic-ai/claude-agent-sdk` |

**Gemini setup**

1. Grab a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...` in `.env`.
3. (Optional) Override the model with `GEMINI_MODEL=gemini-2.5-flash`.

**Claude Code setup**

1. Install the Claude Code CLI and run `claude login` once on the host.
2. Set `AI_PROVIDER=claude-code` in `.env`. No API key is required — the SDK uses your local Claude Code session.
3. (Optional) Override the model with `CLAUDE_CODE_MODEL=claude-sonnet-4-5-20250929`.

Switching providers is a single env var change — no code modifications.

## 📥 AI Resume Import

The dashboard ships an **AI Import Resume** card next to **Blank Resume**. It lets you bootstrap a new resume
from an existing file in seconds.

**Supported formats**: `.pdf` and `.docx` (up to 8 MB).

**How it works**

1. Click **AI Import Resume** on `/dashboard` and either drop a file onto the modal or browse to one.
2. The file is sent to `POST /api/import/resume`:
   - **PDF** → forwarded to the AI as a native document content block (preserving layout, lists, bold, italic).
   - **DOCX** → converted to HTML via `mammoth.convertToHtml` so styling survives, then sent as a text prompt.
3. The selected AI provider (Gemini or Claude Code) maps every section to the builder's schema and returns a
   structured JSON object plus a list of notes about anything it could not map cleanly.
4. The review modal lets you:
   - Edit the title (prefilled from the file name), personal info and summary inline
   - See per-section previews (experiences, educations, skills, projects, languages) with date ranges
   - Decide what to do with each AI note: dismiss it, or append unsupported content (Certifications, Awards, etc.) to the summary
5. Clicking **Import Resume** creates the document in the database, populates every section in one transaction,
   invalidates the dashboard query and opens the new resume in the editor.

Rich-text fields (`summary`, `workSummary`, education / project descriptions) are imported as HTML, so bullet
lists, bold and italic from the source file are preserved end-to-end and render correctly in the WYSIWYG editor.

## 🚀 Getting Started

### Method 1: Development Mode (Without Full Docker)

This method runs the application locally while using Docker only for the PostgreSQL database.

1. **Start PostgreSQL database**:

```bash
docker compose up postgres -d
```

2. **Initialize database schema**:

```bash
pnpm db:push
```

3. **Install dependencies** (if not already installed):

```bash
pnpm install
```

4. **Start development server**:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

**Development Features**:

- Hot reload with Turbopack
- Fast refresh for instant updates
- Debug mode enabled

### Method 2: Production Mode (Full Docker)

This method runs both the application and database in Docker containers.

1. **Build and start all services**:

```bash
docker compose up --build -d
```

The application will automatically:

- Start PostgreSQL database
- Wait for database to be ready
- Run database migrations
- Build the Next.js application
- Start the production server

Access the application at `http://localhost:3000`

2. **View logs** (optional):

```bash
docker compose logs -f app
```

3. **Stop services**:

```bash
docker compose down
```

## 🔧 Available Scripts

### Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server

### Database Operations

- `pnpm db:push` - Push Drizzle schema to database (force update)
- `pnpm db:migrate` - Run database migrations
- `pnpm db:init` - Initialize database with SQL (local PostgreSQL only)
- `pnpm db:run` - Start PostgreSQL container only

### Code Quality

- `pnpm lint` - Run ESLint and TypeScript checks (with zero warnings policy)
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm check:unused` - Find unused dependencies and exports with Knip
- `pnpm fix:unused` - Automatically remove unused code

## 🗄️ Database Management with Makefile

The project includes a cross-platform Makefile for PostgreSQL database backup and restore operations. The Makefile
automatically detects your operating system and uses the appropriate scripts.

### Available Commands

```bash
# Show all available commands
make help

# Create a database backup, all backups are stored in dumps/ directory
make db-backup

# Restore database from backup
# The command lists all available dump files from ./dumps/ directory  - just copy/paste the filename when prompted
make db-restore

# List all available backup files
make db-list-dumps
```

### Backup & Restore Details

**Create Backup**:

- Creates timestamped backup files in `dumps/` directory
- Format: `backup_dd_mm_yy_hh_mm.sql`
- Works with local PostgreSQL installation

**Restore from Backup**:

- Interactive process with file selection
- Shows available backup files
- Asks for confirmation before restoring
- ⚠️ **Warning**: Completely overwrites current database!

**Platform Support**:

- **Windows**: Uses `.bat` scripts
- **Linux/WSL**: Uses `.sh` scripts
- **macOS**: Uses `.sh` scripts

**Alternative for Windows**:

```bash
scripts\backup-interactive.bat
```

## 🐳 Docker Configuration

### Services

**postgres**:

- Image: `postgres:16`
- Port: `5432`
- Persistent data with Docker volumes
- Health checks for reliable startup
- Auto-initialization with `init-db.sql`

**app**:

- Multi-stage build for optimization
- Waits for database health check
- Auto-runs migrations on startup
- Production-ready configuration

### Docker Compose Commands

```bash
# Start specific service
docker compose up postgres -d

# View logs
docker compose logs -f [service-name]

# Restart service
docker compose restart [service-name]

# Stop all services
docker compose down

# Remove volumes (⚠️ deletes data)
docker compose down -v
```

## 🛠️ Development Guidelines

### Code Quality Rules (MANDATORY)

1. **During Development**: Focus on implementation without running checks
2. **End of Task**:
   - Run `pnpm lint` and fix ALL errors (non-negotiable)
   - Run `pnpm format:check` and fix if needed with `pnpm format`
   - Only then consider the task complete

### Best Practices

- **Component Reuse**: Always check existing components before creating new ones
- **DRY Principle**: Extract repeated logic into custom hooks and utilities
- **Type Safety**: Use TypeScript interfaces for all props and data structures
- **Validation**: Share Zod schemas across forms and API validation

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines.

## 🔍 Common Issues & Solutions

### Database Connection Errors

**Issue**: `ECONNREFUSED ::1:5432` or `ECONNREFUSED 127.0.0.1:5432`

**Solution**: Ensure PostgreSQL is running:

```bash
docker compose up postgres -d
```

### Docker Build Failures

**Issue**: Build fails during `pnpm install`

**Solution**: Clear Docker cache and rebuild:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Port Already in Use

**Issue**: Port 3000 or 5432 already in use

**Solution**: Stop conflicting services or change ports in `docker-compose.yml`

## 📝 License

This project is for personal and educational use. Please respect the original creators and contributors.

## ❤️ Support

If you find this project helpful, please consider:

- Giving this repository a ⭐️ on GitHub
- Sharing it with others
- Contributing to the project

---

**Happy Resume Building!** 🚀
