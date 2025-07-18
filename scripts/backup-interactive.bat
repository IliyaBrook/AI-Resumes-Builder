@echo off
echo Creating database backup...

rem Set default values
set "DB_NAME=ai_resumes_builder"
set "DB_USER=postgres"
set "DB_PASSWORD="

rem Read from .env file if it exists
if exist .env (
    echo Reading configuration from .env file...
    for /f "tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="POSTGRES_DB" set "DB_NAME=%%b"
        if "%%a"=="POSTGRES_USER" set "DB_USER=%%b"
        if "%%a"=="POSTGRES_PASSWORD" set "DB_PASSWORD=%%b"
    )
) else (
    echo No .env file found, using defaults: DB=%DB_NAME%, USER=%DB_USER%
)

if not exist dumps mkdir dumps

rem Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "MIN=%dt:~10,2%"
set "filename=dumps\backup_%DD%_%MM%_%YY%_%HH%_%MIN%.sql"

echo Creating backup file: %filename%
echo Database: %DB_NAME%, User: %DB_USER%

if not "%DB_PASSWORD%"=="" (
    set "PGPASSWORD=%DB_PASSWORD%"
    pg_dump -U %DB_USER% -d %DB_NAME% --no-owner --no-privileges --clean --if-exists > "%filename%"
) else (
    pg_dump -U %DB_USER% -d %DB_NAME% --no-owner --no-privileges --clean --if-exists > "%filename%"
)

echo Backup created: %filename%
echo.
echo Press any key to continue...
pause >nul 