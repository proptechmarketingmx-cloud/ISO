import os
import secrets
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Set
from jose import jwt, JWTError
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

# Configuración de Secret Key segura
ENV = os.getenv("ENV", "development").lower()
RAW_SECRET = os.getenv("JWT_SECRET")

if not RAW_SECRET:
    if ENV == "production":
        raise ValueError(
            "CRÍTICO: La variable de entorno 'JWT_SECRET' no está configurada en producción. "
            "Defina una clave secreta fuerte para iniciar el servidor."
        )
    else:
        # Generar clave secreta aleatoria segura por sesión de ejecución en desarrollo
        SECRET_KEY = secrets.token_urlsafe(32)
        logger.warning(
            "[JWT] 'JWT_SECRET' no definida en entorno de desarrollo. "
            "Se generó una clave aleatoria temporal para esta sesión."
        )
else:
    SECRET_KEY = RAW_SECRET

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Blacklist de tokens revocados (jti -> exp timestamp)
_REVOKED_JTIS: Dict[str, datetime] = {}


def _cleanup_revoked_tokens():
    """Limpia tokens expirados de la lista de revocación en memoria."""
    now = datetime.utcnow()
    expired_jtis = [jti for jti, exp in _REVOKED_JTIS.items() if exp < now]
    for jti in expired_jtis:
        _REVOKED_JTIS.pop(jti, None)


def revoke_token(jti: str, exp_timestamp: Optional[int] = None):
    """Añade un JTI a la lista de revocación."""
    if not jti:
        return
    _cleanup_revoked_tokens()
    if exp_timestamp:
        exp_dt = datetime.utcfromtimestamp(exp_timestamp)
    else:
        exp_dt = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    _REVOKED_JTIS[jti] = exp_dt


def is_token_revoked(jti: Optional[str]) -> bool:
    """Verifica si un JTI ha sido revocado."""
    if not jti:
        return False
    _cleanup_revoked_tokens()
    return jti in _REVOKED_JTIS


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña plana coincida con el hash stored."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Genera hash bcrypt para una contraseña plana."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> tuple[str, int]:
    """Crea un token JWT de acceso con jti único. Devuelve (token_str, expires_in_seconds)."""
    to_encode = data.copy()
    now = datetime.utcnow()

    if expires_delta:
        expire = now + expires_delta
        expires_seconds = int(expires_delta.total_seconds())
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_seconds = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    # Asignar JTI único para revocación en logout
    token_jti = str(uuid.uuid4())
    to_encode.update({
        "exp": expire,
        "iat": now,
        "jti": token_jti,
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expires_seconds


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica un token JWT. Devuelve el payload o None si es inválido/expirado/revocado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        if jti and is_token_revoked(jti):
            return None
        return payload
    except JWTError:
        return None
