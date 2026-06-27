import logging
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Tuple
from backend.models.cliente import Cliente, ClienteHistorial, ClienteNota, ClienteDocumento, ClienteActividad
from backend.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteNotaCreate, ClienteActividadCreate, ClienteDocumentoCreate
from backend.services.delete_validations import validate_cliente_delete

logger = logging.getLogger(__name__)

class ClienteService:
    @staticmethod
    def _crear_historial(db: Session, id_cliente: int, accion: str, descripcion: str, usuario: str = "Sistema"):
        historial = ClienteHistorial(
            id_cliente=id_cliente,
            accion=accion,
            descripcion=descripcion,
            usuario=usuario
        )
        db.add(historial)

    @staticmethod
    def get_clientes(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, estado: Optional[str] = None) -> List[Cliente]:
        query = db.query(Cliente)
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
        db_cliente = Cliente(**cliente_in.model_dump())
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
        estado_previo = db_cliente.estado_cliente
        asesor_previo = db_cliente.id_asesor
        
        for key, value in update_data.items():
            setattr(db_cliente, key, value)
            
        db.commit()
        db.refresh(db_cliente)
        
        # Validar cambios importantes para el historial
        if "estado_cliente" in update_data and update_data["estado_cliente"] != estado_previo:
            ClienteService._crear_historial(
                db, 
                id_cliente, 
                accion="cambio_estado", 
                descripcion=f"Estado cambiado de {estado_previo} a {db_cliente.estado_cliente}"
            )
            
        if "id_asesor" in update_data and update_data["id_asesor"] != asesor_previo:
            ClienteService._crear_historial(
                db, 
                id_cliente, 
                accion="cambio_asesor", 
                descripcion=f"Asesor cambiado de {asesor_previo} a {db_cliente.id_asesor}"
            )
            
        db.commit()
        return db_cliente

    @staticmethod
    def delete_cliente(db: Session, id_cliente: int) -> Tuple[bool, Optional[str]]:
        can_delete, reason = validate_cliente_delete(db, id_cliente)
        if not can_delete:
            return False, reason

        db_cliente = ClienteService.get_cliente_by_id(db, id_cliente)
        db.delete(db_cliente)
        db.commit()
        logger.info("Cliente eliminado: id=%s", id_cliente)
        return True, None

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
