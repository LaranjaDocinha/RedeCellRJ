@echo off
setlocal

REM Prompt user for psql.exe path
set "PSQL_PATH="
set /p "PSQL_PATH=Por favor, digite o caminho COMPLETO para o psql.exe (ex: C:\Program Files\PostgreSQL\16\bin\psql.exe): "

if not exist "%PSQL_PATH%" (
    echo Erro: psql.exe não encontrado no caminho especificado.
    goto :eof
)

set "DB_USER=postgres"
set "DB_NAME=pdv_web"
set "DB_HOST=localhost"
set "DB_PORT=5432"
set "SCHEMA_FILE=database\schema_consolidated.sql"

echo.
echo --- Resetando o banco de dados %DB_NAME% ---
echo.

REM Terminate active connections, drop, and create database
"%PSQL_PATH%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '%DB_NAME%' AND pid <> pg_backend_pid();"
if %errorlevel% neq 0 (
    echo Erro ao terminar conexões.
    goto :eof
)

"%PSQL_PATH%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;"
if %errorlevel% neq 0 (
    echo Erro ao dropar o banco de dados.
    goto :eof
)

"%PSQL_PATH%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;"
if %errorlevel% neq 0 (
    echo Erro ao criar o banco de dados.
    goto :eof
)

echo Banco de dados %DB_NAME% resetado com sucesso.
echo.

REM Apply schema_consolidated.sql
echo --- Aplicando schema_consolidated.sql ---
"%PSQL_PATH%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%SCHEMA_FILE%" -v ON_ERROR_STOP=1
if %errorlevel% neq 0 (
    echo Erro ao aplicar schema_consolidated.sql.
    goto :eof
)
echo schema_consolidated.sql aplicado com sucesso.
echo.
pause

REM Run seed.js
echo --- Executando seed.js ---
node seed.js
if %errorlevel% neq 0 (
    echo Erro ao executar seed.js.
    goto :eof
)
echo seed.js executado com sucesso.
echo.

echo Processo de configuração do banco de dados concluído.
endlocal
pause