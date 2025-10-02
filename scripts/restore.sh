#!/bin/bash

echo "Available dump files:"

# Find project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql not found!"
    echo "Please install PostgreSQL client:"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  CentOS/RHEL:   sudo yum install postgresql"
    echo "  macOS:         brew install postgresql"
    exit 1
fi

# Set default values
DB_NAME="ai_resumes_builder"
DB_USER="postgres"
DB_PASSWORD=""

# Read from .env file if it exists (check current dir first, then project root)
if [ -f .env ]; then
    echo "Reading configuration from .env file..."
    while IFS='=' read -r key value; do
        # Remove quotes, whitespace, and carriage returns
        value=$(echo "$value" | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//; s/\r$//')
        # Also trim any trailing/leading whitespace
        value=$(echo "$value" | xargs)
        case "$key" in
            POSTGRES_DB) DB_NAME="$value" ;;
            POSTGRES_USER) DB_USER="$value" ;;
            POSTGRES_PASSWORD) DB_PASSWORD="$value" ;;
        esac
    done < <(grep -E '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)=' .env | tr -d '\r')
elif [ -f "$PROJECT_ROOT/.env" ]; then
    echo "Reading configuration from .env file..."
    while IFS='=' read -r key value; do
        # Remove quotes, whitespace, and carriage returns
        value=$(echo "$value" | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//; s/\r$//')
        # Also trim any trailing/leading whitespace
        value=$(echo "$value" | xargs)
        case "$key" in
            POSTGRES_DB) DB_NAME="$value" ;;
            POSTGRES_USER) DB_USER="$value" ;;
            POSTGRES_PASSWORD) DB_PASSWORD="$value" ;;
        esac
    done < <(grep -E '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)=' "$PROJECT_ROOT/.env" | tr -d '\r')
else
    echo "No .env file found, using defaults: DB=$DB_NAME, USER=$DB_USER"
fi

# Determine dumps directory location (prefer current dir, fallback to project root)
if [ -d "dumps" ] && [ "$(ls -A dumps/*.sql 2>/dev/null)" ]; then
    DUMPS_DIR="dumps"
elif [ -d "$PROJECT_ROOT/dumps" ] && [ "$(ls -A "$PROJECT_ROOT"/dumps/*.sql 2>/dev/null)" ]; then
    DUMPS_DIR="$PROJECT_ROOT/dumps"
else
    echo "No dump files found in dumps directory"
    exit 1
fi

ls -1 "$DUMPS_DIR"/*.sql | sed "s|$DUMPS_DIR/||"

echo ""
read -p "Enter dump filename (without path): " filename

# Check if file exists
if [ ! -f "$DUMPS_DIR/$filename" ]; then
    echo "File $DUMPS_DIR/$filename not found!"
    exit 1
fi

echo ""
echo "WARNING: This will overwrite current database data!"
echo "Database: [$DB_NAME], User: [$DB_USER]"
echo "Debug - DB_NAME length: ${#DB_NAME}, DB_USER length: ${#DB_USER}"
read -p "Are you sure? (y/N): " confirm

# Convert to lowercase for comparison
confirm=$(echo "$confirm" | tr '[:upper:]' '[:lower:]')

if [ "$confirm" = "y" ] || [ "$confirm" = "yes" ]; then
    echo "Restoring from $DUMPS_DIR/$filename..."

    # Set password if provided
    if [ ! -z "$DB_PASSWORD" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi

    # Restore database (connect to Docker container on localhost:5432)
    psql -h localhost -p 5432 -U "$DB_USER" -d "$DB_NAME" < "$DUMPS_DIR/$filename" 2>&1

    if [ $? -eq 0 ]; then
        echo "Restore completed!"
    else
        echo "Error during restore!"
        echo "Please check that:"
        echo "  - Docker container is running"
        echo "  - Port 5432 is accessible"
        echo "  - Password is correct"
        exit 1
    fi
else
    echo "Restore cancelled."
fi 