@echo off
REM Database Restore Script for Windows
REM Requires psql to be installed and in PATH.

if "%~1"=="" (
    echo Usage: db-restore.bat ^<path_to_backup_file.sql^>
    exit /b 1
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo Error: Backup file "%BACKUP_FILE%" does not exist.
    exit /b 1
)

if exist .env (
    for /f "tokens=1,2 delims==" %%i in (.env) do (
        if "%%i"=="DATABASE_URL" set DATABASE_URL=%%j
    )
)
if exist ..\.env (
    for /f "tokens=1,2 delims==" %%i in (..\.env) do (
        if "%%i"=="DATABASE_URL" set DATABASE_URL=%%j
    )
)

if "%DATABASE_URL%"=="" (
    echo Error: DATABASE_URL is not set in environment or .env file.
    exit /b 1
)

echo Restoring database from %BACKUP_FILE%...
psql %DATABASE_URL% -f "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo Database successfully restored from %BACKUP_FILE%.
) else (
    echo Error: Database restore failed.
    exit /b 1
)
