#!/bin/bash

echo "Database Backup Files:"

# Find project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Determine dumps directory location (prefer current dir, fallback to project root)
if [ -d "dumps" ] && [ "$(ls -A dumps/*.sql 2>/dev/null)" ]; then
    DUMPS_DIR="dumps"
elif [ -d "$PROJECT_ROOT/dumps" ] && [ "$(ls -A "$PROJECT_ROOT"/dumps/*.sql 2>/dev/null)" ]; then
    DUMPS_DIR="$PROJECT_ROOT/dumps"
else
    echo "No dump files found in dumps directory"
    exit 0
fi

echo "Files:"
ls -1 "$DUMPS_DIR"/*.sql | sed "s|$DUMPS_DIR/||"
echo ""
echo "Details:"
ls -lh "$DUMPS_DIR"/*.sql

echo ""
echo "To create a backup: make db-backup"
echo "To restore a backup: make db-restore" 