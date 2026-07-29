import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import (
    asesores, propiedades, cna, kpis, dashboard, cliente_routes,
    auth, roles, usuarios
)
import backend.models.cliente  # noqa: F401 — registra tablas del módulo Clientes
import backend.models.models   # noqa: F401 — registra tablas compartidas
import backend.models.auth     # noqa: F401 — registra tablas de RBAC y Multi-Tenancy

# Crear tablas en la base de datos de manera automática
Base.metadata.create_all(bind=engine)

# Aplicar migraciones incrementales automáticas (si corresponde a MySQL)
from backend.database_migration import run_database_migrations
run_database_migrations(engine)

app = FastAPI(
    title="ISO API",
    description="Backend API para la plataforma inmobiliaria ISO y su sistema CNA",
    version="1.0.0"
)

# Configurar middleware de CORS
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers bajo el prefijo /api

app.include_router(auth.router, prefix="/api")
app.include_router(roles.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
app.include_router(cliente_routes.router, prefix="/api")
app.include_router(asesores.router, prefix="/api")
app.include_router(propiedades.router, prefix="/api")
app.include_router(cna.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ISO API Service",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
