import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = os.getenv("JWT_SECRET", "ISO_SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))  # 8 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña plana coincida con el hash stored."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback o comparación básica si la librería falla
        return False


def get_password_hash(password: str) -> str:
    """Genera hash bcrypt para una contraseña plana."""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> tuple[str, int]:
    """Crea un token JWT de acceso. Devuelve (token_str, expires_in_seconds)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
        expires_seconds = int(expires_delta.total_seconds())
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expires_seconds = ACCESS_TOKEN_EXPIRE_MINUTES * 60

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expires_seconds


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica un token JWT. Devuelve el payload o None si es inválido/expirado."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
