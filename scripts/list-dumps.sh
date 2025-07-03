#!/bin/bash

echo "Database Backup Files:"

if [ -d "dumps" ] && [ "$(ls -A dumps/*.sql 2>/dev/null)" ]; then
    echo "Files:"
    ls -1 dumps/*.sql | sed 's|dumps/||'
    echo ""
    echo "Details:"
    ls -lh dumps/*.sql
else
    echo "No dump files found in dumps directory"
fi

echo ""
echo "To create a backup: make db-backup"
echo "To restore a backup: make db-restore" 