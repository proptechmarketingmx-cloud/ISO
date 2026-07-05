import os
import logging
from sqlalchemy import text
from sqlalchemy.exc import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)

def run_database_migrations(engine):
    # Solo ejecutar si el dialecto es MySQL (para ambientes con volúmenes persistentes desactualizados)
    if engine.dialect.name != "mysql":
        logger.info("Dialecto de base de datos no es MySQL. Omitiendo ejecución de script de migración SQL.")
        return

    # Buscar el script de migración
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    migration_file = os.path.join(base_dir, "database", "migration_v2.sql")
    if not os.path.exists(migration_file):
        logger.warning(f"No se encontró el archivo de migración en {migration_file}")
        return

    logger.info("Iniciando aplicación de migraciones incrementales automáticas (migration_v2.sql)...")
    try:
        with open(migration_file, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        logger.error(f"No se pudo leer el archivo de migración: {e}")
        return

    # Eliminar comentarios de línea simples
    lines = []
    for line in content.splitlines():
        stripped = line.strip()
        if not stripped.startswith("--") and not stripped.startswith("#"):
            lines.append(line)
    
    clean_sql = "\n".join(lines)
    # Separar por punto y coma (;)
    statements = clean_sql.split(";")
    
    with engine.connect() as connection:
        for stmt in statements:
            stmt = stmt.strip()
            if not stmt:
                continue
            # Ignorar comandos USE ya que SQLAlchemy está conectado a la base de datos correcta
            if stmt.lower().startswith("use "):
                continue
            
            try:
                # Cada sentencia se ejecuta en su propia transacción para que
                # las fallas de columnas/índices duplicados no aborten el resto
                with connection.begin():
                    connection.execute(text(stmt))
            except (OperationalError, ProgrammingError) as e:
                err_str = str(e)
                # Códigos/mensajes comunes de duplicados en MySQL a ignorar:
                # 1060: Duplicate column name
                # 1061: Duplicate key name (index)
                # 1050: Table already exists
                # 1091: Can't DROP key / column doesn't exist
                if any(code in err_str for code in ["1060", "1061", "1050", "1091", "already exists"]):
                    logger.debug(f"Ignorado error esperado al aplicar migración: {err_str.splitlines()[0]}")
                else:
                    logger.warning(f"Advertencia al ejecutar sentencia SQL: {stmt[:100]}...\nDetalle: {err_str.splitlines()[0]}")
    logger.info("Verificación/aplicación de migraciones incrementales finalizada con éxito.")
