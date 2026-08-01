from enum import Enum


class SystemRole(str, Enum):
    ADMIN  = "admin"
    ASESOR = "asesor"


class SystemModule(str, Enum):
    CLIENTES        = "clientes"
    CLIENTES_AJENOS = "clientes_ajenos"
    PROPIEDADES     = "propiedades"
    CNA             = "cna"
    RED_CONTACTOS   = "red_contactos"
    KPIS            = "kpis"
    ASESORES        = "asesores"
    USUARIOS        = "usuarios"
    FACTURACION     = "facturacion"
    CONFIG_TENANT   = "config_tenant"
