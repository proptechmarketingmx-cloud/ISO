from enum import Enum


class SystemRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN       = "admin"
    GERENTE     = "gerente"
    VENDEDOR    = "vendedor"
    INVITADO    = "invitado"


class SystemModule(str, Enum):
    CLIENTES       = "clientes"
    CLIENTES_AJENOS = "clientes_ajenos"
    PROPIEDADES    = "propiedades"
    CNA            = "cna"
    RED_CONTACTOS  = "red_contactos"
    KPIS           = "kpis"
    ASESORES       = "asesores"
    USUARIOS       = "usuarios"
    FACTURACION    = "facturacion"
    CONFIG_TENANT  = "config_tenant"
