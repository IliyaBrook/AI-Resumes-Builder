#!/bin/bash

echo "Creating database backup..."

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo "Error: pg_dump not found!"
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

# Read from .env file if it exists
if [ -f .env ]; then
    echo "Reading configuration from .env file..."
    while IFS='=' read -r key value; do
        # Remove quotes and whitespace
        value=$(echo "$value" | sed 's/^"//; s/"$//; s/^'\''//; s/'\''$//')
        case "$key" in
            POSTGRES_DB) DB_NAME="$value" ;;
            POSTGRES_USER) DB_USER="$value" ;;
            POSTGRES_PASSWORD) DB_PASSWORD="$value" ;;
        esac
    done < <(grep -E '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)=' .env)
else
    echo "No .env file found, using defaults: DB=$DB_NAME, USER=$DB_USER"
fi

# Create dumps directory if it doesn't exist
mkdir -p dumps

# Get current date and time
DATE=$(date +"%d_%m_%y_%H_%M")
FILENAME="dumps/backup_${DATE}.sql"

echo "Creating backup file: $FILENAME"
echo "Database: $DB_NAME, User: $DB_USER"

# Set password if provided
if [ ! -z "$DB_PASSWORD" ]; then
    export PGPASSWORD="$DB_PASSWORD"
fi

# Test database connection first
echo "Testing database connection..."
if [ ! -z "$DB_PASSWORD" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null
else
    psql -U "$DB_USER" -d "$DB_NAME" -c "\q" 2>/dev/null
fi

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to database!"
    echo "Please check:"
    echo "  - PostgreSQL server is running"
    echo "  - Database '$DB_NAME' exists"
    echo "  - User '$DB_USER' has access"
    echo "  - Password is correct (if required)"
    exit 1
fi

# Create backup
pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges --clean --if-exists > "$FILENAME"

if [ $? -eq 0 ]; then
    echo "Backup created: $FILENAME"
else
    echo "Error creating backup!"
    exit 1
fi 