from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from backend.database import get_db
from backend.models.auth import Usuario, Rol, Permiso
from backend.schemas.auth import LoginRequest, Token, UserProfile, RolSchema, PermisoSchema
from backend.auth.jwt import verify_password, create_access_token
from backend.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Inicia sesión con email y contraseña, devuelve un JWT token."""
    user = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles).joinedload(Rol.permisos))
        .filter(Usuario.email == data.email)
        .first()
    )

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (email o contraseña inválidos)"
        )

    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario está desactivada"
        )

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
def logout():
    """Cierra la sesión del usuario client-side."""
    return {"message": "Sesión cerrada correctamente"}
