@echo off
echo Available dump files:

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

if exist dumps\*.sql (
    dir dumps\*.sql /B
) else (
    echo No dump files found in dumps
    exit /b 1
)

echo.
set /p filename="Enter dump filename (without path): "

if not exist "dumps\%filename%" (
    echo File dumps\%filename% not found!
    goto :end
)

echo.
echo WARNING: This will overwrite current database data!
echo Database: %DB_NAME%, User: %DB_USER%
set /p confirm="Are you sure? (y/N): "

rem Remove any trailing spaces or characters
set "confirm=%confirm: =%"

if "%confirm%"=="y" goto :restore
if "%confirm%"=="Y" goto :restore
if "%confirm%"=="yes" goto :restore
if "%confirm%"=="YES" goto :restore
if "%confirm%"=="Yes" goto :restore

echo Restore cancelled.
goto :end

:restore
echo Restoring from dumps\%filename%...

if not "%DB_PASSWORD%"=="" (
    set "PGPASSWORD=%DB_PASSWORD%"
    psql -U %DB_USER% -d %DB_NAME% < "dumps\%filename%"
) else (
    psql -U %DB_USER% -d %DB_NAME% < "dumps\%filename%"
)

echo Restore completed!

:end 