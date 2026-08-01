import logging
import re
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import or_
import sqlalchemy.exc
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from backend.models.cliente import Cliente, ClienteHistorial, ClienteNota, ClienteDocumento, ClienteActividad
from backend.models.models import AuditoriaCambios
from backend.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteNotaCreate, ClienteActividadCreate, ClienteDocumentoCreate
from backend.services.delete_validations import validate_cliente_delete

logger = logging.getLogger(__name__)


def _values_equivalent(prev_value, value) -> bool:
    if prev_value == value:
        return True

    if prev_value is None or value is None:
        return prev_value is None and value is None

    try:
        if isinstance(prev_value, (int, float)) and isinstance(value, (int, float)):
            return float(prev_value) == float(value)
    except (TypeError, ValueError):
        pass

    if isinstance(prev_value, str) and isinstance(value, str):
        prev_text = prev_value.strip()
        value_text = value.strip()
        if not prev_text and not value_text:
            return True
        try:
            if float(prev_text) == float(value_text):
                return True
        except ValueError:
            pass

        date_formats = ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y")
        for prev_fmt in date_formats:
            try:
                prev_date = datetime.strptime(prev_text, prev_fmt).date()
            except ValueError:
                continue
            for value_fmt in date_formats:
                try:
                    value_date = datetime.strptime(value_text, value_fmt).date()
                except ValueError:
                    continue
                if prev_date == value_date:
                    return True

    return False


def calcular_campos_automaticos(data: dict):
    # Calcular edad y generación
    fnac = data.get("fecha_nacimiento")
    if fnac:
        try:
            # Intentar parsear YYYY-MM-DD
            birth_date = datetime.strptime(fnac, "%Y-%m-%d")
            today = datetime.today()
            edad = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            # Acotar edad a rango válido; datos corruptos (ej. año 0516) producen
            # valores negativos o > 120 que hacen fallar la serialización Pydantic.
            data["edad"] = edad if 0 <= edad <= 120 else None
            
            year = birth_date.year
            if year <= 1945:
                data["generacion"] = "Generación Silenciosa"
            elif year <= 1964:
                data["generacion"] = "Baby Boomers"
            elif year <= 1980:
                data["generacion"] = "Generación X"
            elif year <= 1996:
                data["generacion"] = "Millennials"
            elif year <= 2012:
                data["generacion"] = "Generación Z"
            else:
                data["generacion"] = "Generación Alfa"
        except Exception as e:
            logger.warning(f"Error al calcular edad/generación: {e}")

    # Lada
    tel = data.get("whatsapp") or data.get("telefono_principal")
    if tel:
        tel = tel.strip()
        if tel.startswith("+"):
            match = re.match(r"^(\+\d{1,4})", tel)
            if match:
                data["lada"] = match.group(1)
        else:
            data["lada"] = "+52"  # Por defecto México


class ClienteService:
    @staticmethod
    def _crear_historial(db: Session, id_cliente: int, accion: str, descripcion: str, campo: Optional[str] = None, valor_anterior: Optional[str] = None, valor_nuevo: Optional[str] = None, usuario: str = "Sistema"):
        historial = ClienteHistorial(
            id_cliente=id_cliente,
            accion=accion,
            descripcion=descripcion,
            campo=campo,
            valor_anterior=valor_anterior,
            valor_nuevo=valor_nuevo,
            usuario=usuario
        )
        db.add(historial)
        
        # Registrar también en la tabla global de auditoría
        auditoria = AuditoriaCambios(
            tabla="clientes",
            id_registro=id_cliente,
            campo=campo or "general",
            valor_anterior=valor_anterior,
            valor_nuevo=valor_nuevo,
            usuario=usuario
        )
        db.add(auditoria)

    @staticmethod
    def check_duplicados(db: Session, email: Optional[str], phone: Optional[str], wa: Optional[str], curp: Optional[str], exclude_id: Optional[int] = None):
        filters = []
        if email:
            filters.append(Cliente.correo == email)
        if phone:
            filters.append(Cliente.telefono_principal == phone)
        if wa:
            filters.append(Cliente.whatsapp == wa)
        if curp:
            filters.append(Cliente.curp == curp)
            
        if not filters:
            return
            
        query = db.query(Cliente).filter(or_(*filters))
        if exclude_id is not None:
            query = query.filter(Cliente.id_cliente != exclude_id)
            
        dupe = query.first()
        if dupe:
            reasons = []
            if email and dupe.correo == email: reasons.append("correo")
            if phone and dupe.telefono_principal == phone: reasons.append("teléfono")
            if wa and dupe.whatsapp == wa: reasons.append("whatsapp")
            if curp and dupe.curp == curp: reasons.append("CURP")
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un cliente registrado con el mismo: {', '.join(reasons)}."
            )

    @staticmethod
    def get_clientes(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, estado: Optional[str] = None, scope_info: Optional[dict] = None) -> List[Cliente]:
        query = db.query(Cliente)

        if scope_info:
            if scope_info.get("id_tenant"):
                query = query.filter(or_(Cliente.id_tenant == scope_info["id_tenant"], Cliente.id_tenant.is_(None)))

            allowed = scope_info.get("allowed_asesores_ids")
            if allowed is not None:
                if allowed:
                    query = query.filter(Cliente.id_asesor.in_(allowed))
                else:
                    return []

        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                or_(
                    Cliente.nombre.ilike(search_filter),
                    Cliente.apellido_paterno.ilike(search_filter),
                    Cliente.apellido_materno.ilike(search_filter),
                    Cliente.correo.ilike(search_filter),
                    Cliente.telefono_principal.ilike(search_filter),
                    Cliente.whatsapp.ilike(search_filter)
                )
            )
        if estado:
            query = query.filter(Cliente.estado_cliente == estado)

        return query.order_by(Cliente.fecha_registro.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_cliente_by_id(db: Session, id_cliente: int) -> Optional[Cliente]:
        return db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()

    @staticmethod
    def create_cliente(db: Session, cliente_in: ClienteCreate) -> Cliente:
        data = cliente_in.model_dump()
        
        # Validar duplicados
        ClienteService.check_duplicados(
            db,
            email=data.get("correo"),
            phone=data.get("telefono_principal"),
            wa=data.get("whatsapp"),
            curp=data.get("curp")
        )
        
        # Calcular campos automáticos
        calcular_campos_automaticos(data)
        
        db_cliente = Cliente(**data)
        db.add(db_cliente)
        db.commit()
        db.refresh(db_cliente)
        
        # Registrar en el historial
        ClienteService._crear_historial(
            db, 
            id_cliente=db_cliente.id_cliente, 
            accion="creado", 
            descripcion=f"Cliente creado en estado: {db_cliente.estado_cliente}"
        )
        db.commit()
        return db_cliente

    @staticmethod
    def update_cliente(db: Session, id_cliente: int, cliente_in: ClienteUpdate) -> Optional[Cliente]:
        db_cliente = ClienteService.get_cliente_by_id(db, id_cliente)
        if not db_cliente:
            return None
            
        update_data = cliente_in.model_dump(exclude_unset=True)
        
        # Validar duplicados (excluyendo el registro actual)
        ClienteService.check_duplicados(
            db,
            email=update_data.get("correo"),
            phone=update_data.get("telefono_principal"),
            wa=update_data.get("whatsapp"),
            curp=update_data.get("curp"),
            exclude_id=id_cliente
        )
        
        # Si se modificó la fecha de nacimiento o whatsapp/teléfono, recalcular campos automáticos
        if "fecha_nacimiento" in update_data or "whatsapp" in update_data or "telefono_principal" in update_data:
            temp_data = {
                "fecha_nacimiento": update_data.get("fecha_nacimiento", db_cliente.fecha_nacimiento),
                "whatsapp": update_data.get("whatsapp", db_cliente.whatsapp),
                "telefono_principal": update_data.get("telefono_principal", db_cliente.telefono_principal)
            }
            calcular_campos_automaticos(temp_data)
            if "edad" in temp_data: update_data["edad"] = temp_data["edad"]
            if "generacion" in temp_data: update_data["generacion"] = temp_data["generacion"]
            if "lada" in temp_data: update_data["lada"] = temp_data["lada"]
            
        # Hacer tracking de los cambios para la auditoría
        for key, value in update_data.items():
            prev_value = getattr(db_cliente, key)
            if prev_value != value:
                if _values_equivalent(prev_value, value):
                    continue

                setattr(db_cliente, key, value)
                
                # Registrar cambio de campo en historial
                ClienteService._crear_historial(
                    db,
                    id_cliente=id_cliente,
                    accion="actualizado",
                    descripcion=f"Campo '{key}' modificado",
                    campo=key,
                    valor_anterior=str(prev_value) if prev_value is not None else None,
                    valor_nuevo=str(value) if value is not None else None
                )
            
        db.commit()
        db.refresh(db_cliente)
        return db_cliente

    @staticmethod
    def delete_cliente(db: Session, id_cliente: int) -> Tuple[bool, Optional[str]]:
        try:
            db_cliente = ClienteService.get_cliente_by_id(db, id_cliente)
            if not db_cliente:
                return False, "Cliente no encontrado"

            can_delete, reason = validate_cliente_delete(db, id_cliente)
            if not can_delete:
                return False, reason

            db.delete(db_cliente)
            db.commit()
            return True, None
        except sqlalchemy.exc.IntegrityError:
            db.rollback()
            return False, "No fue posible eliminar el cliente porque existen registros asociados."
        except Exception as e:
            db.rollback()
            return False, f"Error al eliminar: {str(e)}"

    # --- Métodos del Expediente ---
    
    @staticmethod
    def add_nota(db: Session, id_cliente: int, nota_in: ClienteNotaCreate) -> ClienteNota:
        nota = ClienteNota(id_cliente=id_cliente, **nota_in.model_dump())
        db.add(nota)
        ClienteService._crear_historial(db, id_cliente, accion="nota_agregada", descripcion="Se ha agregado una nota al expediente.")
        db.commit()
        db.refresh(nota)
        return nota

    @staticmethod
    def add_actividad(db: Session, id_cliente: int, actividad_in: ClienteActividadCreate) -> ClienteActividad:
        actividad = ClienteActividad(id_cliente=id_cliente, **actividad_in.model_dump())
        db.add(actividad)
        ClienteService._crear_historial(db, id_cliente, accion="actividad_registrada", descripcion=f"Se registró una actividad: {actividad.tipo}.")
        db.commit()
        db.refresh(actividad)
        return actividad

    @staticmethod
    def add_documento(db: Session, id_cliente: int, documento_in: ClienteDocumentoCreate) -> ClienteDocumento:
        documento = ClienteDocumento(id_cliente=id_cliente, **documento_in.model_dump())
        db.add(documento)
        ClienteService._crear_historial(db, id_cliente, accion="documento_agregado", descripcion=f"Documento subido: {documento.nombre_archivo}.")
        db.commit()
        db.refresh(documento)
        return documento

