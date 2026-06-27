import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_DIALECT = os.getenv("DB_DIALECT", "postgresql")
DB_USER = os.getenv("DB_USER", "postgres" if DB_DIALECT == "postgresql" else "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres" if DB_DIALECT == "postgresql" else "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432" if DB_DIALECT == "postgresql" else "3306")
DB_NAME = os.getenv("DB_NAME", "iso_dev" if DB_DIALECT == "postgresql" else "iso_db")

if DB_DIALECT == "mysql":
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para obtener la sesión de base de datos en las rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
