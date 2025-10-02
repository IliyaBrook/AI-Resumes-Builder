@echo off
echo Database Backup Files:

rem Find project root directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

rem Check for dumps directory (current dir first, then project root)
if exist dumps\*.sql (
    set "DUMPS_DIR=dumps"
) else if exist "%PROJECT_ROOT%\dumps\*.sql" (
    set "DUMPS_DIR=%PROJECT_ROOT%\dumps"
) else (
    echo No dump files found in dumps directory
    goto :end
)

echo Files:
dir "%DUMPS_DIR%\*.sql" /B
echo.
echo Details:
dir "%DUMPS_DIR%\*.sql"

:end
echo.
echo To create a backup: make db-backup
echo To restore a backup: make db-restore 