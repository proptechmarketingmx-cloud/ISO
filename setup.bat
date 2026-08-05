@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

echo ===================================================
echo   ISO P2P Platform — Script de Inicio Automatico
echo ===================================================
echo.

REM 0. Verificación y Creación del archivo .env con DATABASE_URL por defecto
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creando archivo .env a partir de .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo [INFO] Creando archivo .env por defecto...
        (
            echo DATABASE_URL="postgresql://postgres:secret@localhost:5432/iso_p2p?schema=public"
            echo SYNC_TOKEN="REEMPLAZAR_CON_TOKEN_SECRETO_UNICO"
            echo PORT=3000
        ) > ".env"
    )
    echo [ADVERTENCIA IMPORTANTE] Se creo el archivo .env.
    echo Por favor modifica SYNC_TOKEN en el archivo .env por un token secreto unico antes de sincronizar en produccion.
    echo.
)

REM 1. Verificacion de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor descargalo e instalalo desde: https://nodejs.org/
    pause
    exit /b 1
)

REM 2. Verificacion de Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop no esta instalado.
    echo Por favor descargalo e instalalo desde: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM 3. Verificacion de Tailscale
where tailscale >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Tailscale no esta instalado en este sistema.
    echo Para conectarte con otros equipos en la red P2P, instala Tailscale desde: https://tailscale.com/download
    echo.
) else (
    echo [1/6] Conectando a la red Tailscale...
    tailscale up >nul 2>nul
    for /f "tokens=*" %%a in ('tailscale ip -4 2^>nul') do set TAILSCALE_IP=%%a
    echo [OK] IP de Tailscale detectada: !TAILSCALE_IP!
)

REM 4. Instalacion de dependencias NPM
echo.
echo [2/6] Instalando dependencias de Node.js...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo npm install.
    pause
    exit /b 1
)

REM 5. Levantar PostgreSQL con Docker Compose y esperar al healthcheck real
echo.
echo [3/6] Iniciando contenedor PostgreSQL con healthcheck (docker compose up -d --wait)...
call docker compose up -d --wait
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al iniciar PostgreSQL con docker compose.
    pause
    exit /b 1
)

REM 6. Preparar Prisma con migraciones versionadas de producción
echo.
echo [4/6] Generando cliente de Prisma y aplicando migraciones versionadas...
call npx prisma generate
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [ERROR] Fallo la aplicacion de migraciones de Prisma.
    pause
    exit /b 1
)

REM 7. Compilar aplicacion
echo.
echo [5/6] Compilando aplicacion Next.js...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Fallo npm run build.
    pause
    exit /b 1
)

REM 8. Abrir Navegador e Iniciar Servidor
echo.
echo [6/6] Iniciando servidor de produccion en http://localhost:3000 ...
start http://localhost:3000
call npm run start

pause
