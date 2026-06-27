from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routes import asesores, propiedades, cna, kpis, dashboard, cliente_routes
import backend.models.cliente  # noqa: F401 — registra tablas del módulo Clientes
import backend.models.models  # noqa: F401 — registra tablas compartidas

# Crear tablas en la base de datos de manera automática
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ISO API",
    description="Backend API para la plataforma inmobiliaria ISO y su sistema CNA",
    version="1.0.0"
)

# Configurar middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir al host frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers bajo el prefijo /api

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
