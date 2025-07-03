#!/bin/bash

echo "Available dump files:"

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

# Check if dumps directory exists and has .sql files
if [ -d "dumps" ] && [ "$(ls -A dumps/*.sql 2>/dev/null)" ]; then
    ls -1 dumps/*.sql | sed 's|dumps/||'
else
    echo "No dump files found in dumps directory"
    exit 1
fi

echo ""
read -p "Enter dump filename (without path): " filename

# Check if file exists
if [ ! -f "dumps/$filename" ]; then
    echo "File dumps/$filename not found!"
    exit 1
fi

echo ""
echo "WARNING: This will overwrite current database data!"
echo "Database: $DB_NAME, User: $DB_USER"
read -p "Are you sure? (y/N): " confirm

# Convert to lowercase for comparison
confirm=$(echo "$confirm" | tr '[:upper:]' '[:lower:]')

if [ "$confirm" = "y" ] || [ "$confirm" = "yes" ]; then
    echo "Restoring from dumps/$filename..."
    
    # Set password if provided
    if [ ! -z "$DB_PASSWORD" ]; then
        export PGPASSWORD="$DB_PASSWORD"
    fi
    
    # Restore database
    psql -U "$DB_USER" -d "$DB_NAME" < "dumps/$filename"
    
    if [ $? -eq 0 ]; then
        echo "Restore completed!"
    else
        echo "Error during restore!"
        exit 1
    fi
else
    echo "Restore cancelled."
fi 