# AI Resume Builder

## 📌 Project Overview

**AI Resume Builder** is a dynamic and efficient resume-building platform powered by AI. This project leverages
cutting-edge tools and frameworks to provide a seamless experience for creating professional resumes with intelligent
assistance.

## 🌟 Key Features

- ➕ **Create & Edit Resumes** - Full resume management system
- 🤖 **AI-Powered Content Generation** - Smart resume generation with Gemini AI
- 🎨 **Customizable Themes** - Multiple color schemes and layouts
- 📸 **Resume Thumbnails** - Visual preview of your resume
- 🔎 **Search & Organization** - Find and manage your resumes easily
- 📡 **Real-Time Editing** - Live preview as you edit
- 👨‍💻 **PDF Export** - Download resumes in PDF format
- 🌐 **Internationalization** - Multi-language support with next-intl

### Enhanced Features

- **Advanced AI Model Support** - Gemini 2.0, Gemini 2.0 Flash-Lite, and Gemini 1.5 Flash
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
- **Gemini AI** - Advanced AI capabilities for content generation
- **Docker** - Containerization for easy deployment

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
- **Yarn** (v4.9.1 or higher, managed via Corepack)
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

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your-google-gemini-api-key
```

**Note**: Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

## 🚀 Getting Started

### Method 1: Development Mode (Without Full Docker)

This method runs the application locally while using Docker only for the PostgreSQL database.

1. **Start PostgreSQL database**:

```bash
docker compose up postgres -d
```

2. **Initialize database schema**:

```bash
yarn db:push
```

3. **Install dependencies** (if not already installed):

```bash
yarn install
```

4. **Start development server**:

```bash
yarn dev
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

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build production bundle
- `yarn start` - Start production server

### Database Operations

- `yarn db:push` - Push Drizzle schema to database (force update)
- `yarn db:migrate` - Run database migrations
- `yarn db:init` - Initialize database with SQL (local PostgreSQL only)
- `yarn db:run` - Start PostgreSQL container only

### Code Quality

- `yarn lint` - Run ESLint and TypeScript checks (with zero warnings policy)
- `yarn lint:fix` - Auto-fix ESLint issues
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn check:unused` - Find unused dependencies and exports with Knip
- `yarn fix:unused` - Automatically remove unused code

## 🗄️ Database Management with Makefile

The project includes a cross-platform Makefile for PostgreSQL database backup and restore operations. The Makefile
automatically detects your operating system and uses the appropriate scripts.

### Available Commands

```bash
# Show all available commands
make help

# Create a database backup
make db-backup

# Restore database from a backup file
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
    - Run `yarn lint` and fix ALL errors (non-negotiable)
    - Run `yarn format:check` and fix if needed with `yarn format`
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

**Issue**: Build fails during `yarn install`

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
