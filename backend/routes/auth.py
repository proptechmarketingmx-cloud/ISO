import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session, joinedload
from backend.database import get_db
from backend.models.auth import Usuario, Rol, Permiso
from backend.schemas.auth import LoginRequest, Token, UserProfile
from backend.auth.jwt import verify_password, create_access_token, revoke_token
from backend.auth.dependencies import get_current_user
from backend.auth.rate_limiter import check_login_rate_limit, record_failed_login, reset_failed_logins

router = APIRouter(prefix="/auth", tags=["Autenticación"])

ENV = os.getenv("ENV", "development").lower()


@router.post("/login", response_model=Token)
def login(data: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    """Inicia sesión con email y contraseña. Cuenta con protección de rate limiting y emite cookie HttpOnly."""
    # 1. Verificar rate limit de intentos de inicio de sesión
    check_login_rate_limit(request, data.email)

    user = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles).joinedload(Rol.permisos))
        .filter(Usuario.email == data.email)
        .first()
    )

    if not user or not verify_password(data.password, user.password_hash):
        record_failed_login(request, data.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (email o contraseña inválidos)"
        )

    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario está desactivada"
        )

    # Login exitoso: reiniciar contador de fallos
    reset_failed_logins(request, data.email)

    # Actualizar último acceso
    user.ultimo_acceso = datetime.utcnow()
    db.commit()

    token_str, expires_in = create_access_token(
        data={
            "sub": str(user.id_usuario),
            "email": user.email,
            "tenant_id": user.id_tenant,
        }
    )

    # Establecer cookie HttpOnly para protección XSS adicional
    response.set_cookie(
        key="access_token",
        value=token_str,
        max_age=expires_in,
        httponly=True,
        samesite="lax",
        secure=(ENV == "production")
    )

    return Token(
        access_token=token_str,
        token_type="bearer",
        expires_in=expires_in
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: Usuario = Depends(get_current_user)):
    """Devuelve el perfil del usuario actual junto con sus roles y permisos."""
    return current_user


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    current_user: Usuario = Depends(get_current_user)
):
    """Cierra la sesión revocando el token JWT en el servidor y limpiando cookies HttpOnly."""
    payload = getattr(request.state, "jwt_payload", None)
    if payload:
        jti = payload.get("jti")
        exp = payload.get("exp")
        if jti:
            revoke_token(jti, exp)

    response.delete_cookie("access_token")
    return {"message": "Sesión cerrada correctamente y token revocado en el servidor"}
