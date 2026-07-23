@echo off
REM Database Backup Script for Windows
REM Requires pg_dump to be installed and in PATH.

SET BACKUP_DIR=.\backups
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

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

set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\backup_%TIMESTAMP%.sql

echo Backing up database to %BACKUP_FILE%...
pg_dump %DATABASE_URL% --no-owner --no-acl > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo Backup successfully completed: %BACKUP_FILE%
) else (
    echo Error: Database backup failed.
    exit /b 1
)
