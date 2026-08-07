# ──────────────────────────────────────────────────────────────
# Stage 1: Build CRM frontend con Vite → genera dist/
# ──────────────────────────────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# build:crm ejecuta "vite build" → salida en dist/
RUN npm run build:crm

# ──────────────────────────────────────────────────────────────
# Stage 2: Nginx sirve dist/ en puerto 80
# ──────────────────────────────────────────────────────────────
FROM nginx:alpine

# Archivos compilados del CRM
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de Nginx (proxy /api/ → backend:8000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
