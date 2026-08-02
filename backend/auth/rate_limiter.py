import time
from typing import Dict, List, Tuple
from fastapi import HTTPException, status, Request

# Formato: key -> list of timestamps (seconds)
_FAILED_ATTEMPTS: Dict[str, List[float]] = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60  # 15 minutos


def _cleanup_old_attempts(key: str, now: float):
    if key in _FAILED_ATTEMPTS:
        cutoff = now - WINDOW_SECONDS
        _FAILED_ATTEMPTS[key] = [t for t in _FAILED_ATTEMPTS[key] if t > cutoff]
        if not _FAILED_ATTEMPTS[key]:
            del _FAILED_ATTEMPTS[key]


def check_login_rate_limit(request: Request, email: str):
    """
    Verifica si la combinación de IP + Email ha superado el límite de intentos de login.
    Lanza HTTP 429 Too Many Requests si se excede MAX_ATTEMPTS en WINDOW_SECONDS.
    """
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{email.lower().strip()}"
    now = time.time()

    _cleanup_old_attempts(key, now)

    attempts = _FAILED_ATTEMPTS.get(key, [])
    if len(attempts) >= MAX_ATTEMPTS:
        retry_after = int(WINDOW_SECONDS - (now - attempts[0]))
        if retry_after < 1:
            retry_after = 60
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Demasiados intentos fallidos de inicio de sesión. Por favor reintente en {int(retry_after / 60) + 1} minutos.",
            headers={"Retry-After": str(retry_after)}
        )


def record_failed_login(request: Request, email: str):
    """Registra un intento fallido de inicio de sesión."""
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{email.lower().strip()}"
    now = time.time()

    _cleanup_old_attempts(key, now)
    if key not in _FAILED_ATTEMPTS:
        _FAILED_ATTEMPTS[key] = []
    _FAILED_ATTEMPTS[key].append(now)


def reset_failed_logins(request: Request, email: str):
    """Limpia los intentos fallidos al tener un login exitoso."""
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{email.lower().strip()}"
    _FAILED_ATTEMPTS.pop(key, None)
