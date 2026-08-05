#!/usr/bin/env bash
set -e

echo "==================================================="
echo "  ISO P2P Platform — Script de Inicio Automático"
echo "==================================================="
echo ""

# 0. Verificación y Creación del archivo .env con DATABASE_URL por defecto
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📄 [INFO] Creando archivo .env a partir de .env.example..."
        cp .env.example .env
    else
        echo "📄 [INFO] Creando archivo .env por defecto..."
        cat <<EOT > .env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/iso_p2p?schema=public"
SYNC_TOKEN="REEMPLAZAR_CON_TOKEN_SECRETO_UNICO"
PORT=3000
EOT
    fi
    echo "⚠️ [ADVERTENCIA IMPORTANTE] Se creó el archivo .env."
    echo "Por favor modifica SYNC_TOKEN en el archivo .env por un token secreto único antes de conectar en producción."
    echo ""
fi

# 1. Verificación de Node.js
if ! command -v node &> /dev/null; then
    echo "❌ [ERROR] Node.js no está instalado."
    echo "Descárgalo e instálalo desde: https://nodejs.org/"
    exit 1
fi

# 2. Verificación de Docker
if ! command -v docker &> /dev/null; then
    echo "❌ [ERROR] Docker no está instalado."
    echo "Descárgalo e instálalo desde: https://www.docker.com/"
    exit 1
fi

# 3. Verificación de Tailscale
if ! command -v tailscale &> /dev/null; then
    echo "⚠️ [ADVERTENCIA] Tailscale no está instalado en el sistema."
    echo "Para sincronización P2P en red mesh, instálalo desde: https://tailscale.com/download"
else
    echo "🚀 [1/6] Conectando a la red Tailscale..."
    tailscale up || true
    TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "127.0.0.1")
    echo "✅ [OK] IP de Tailscale detectada: $TAILSCALE_IP"
fi

# 4. Instalación de dependencias
echo ""
echo "📦 [2/6] Instalando dependencias de Node.js..."
npm install

# 5. Levantar PostgreSQL con healthcheck real (docker compose up -d --wait)
echo ""
echo "🐳 [3/6] Iniciando servidor PostgreSQL con Docker (--wait para esperar healthcheck)..."
docker compose up -d --wait

# 6. Preparar Prisma con migraciones versionadas
echo ""
echo "🗄️ [4/6] Generando cliente de Prisma y aplicando migraciones versionadas..."
npx prisma generate
npx prisma migrate deploy

# 7. Compilar aplicación Next.js
echo ""
echo "🛠️ [5/6] Compilando aplicación Next.js..."
npm run build

# 8. Abrir navegador e iniciar app
echo ""
echo "🎉 [6/6] Iniciando servidor P2P en http://localhost:3000..."

if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

npm run start
