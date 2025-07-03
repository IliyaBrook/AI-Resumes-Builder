@echo off
echo Database Backup Files:

if exist dumps\*.sql (
    echo Files:
    dir dumps\*.sql /B
    echo.
    echo Details:
    dir dumps\*.sql
) else (
    echo No dump files found in dumps directory
)

echo.
echo To create a backup: make db-backup
echo To restore a backup: make db-restore 