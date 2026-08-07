from backend.models.cliente import Cliente
from backend.models.models import Propiedad
from backend.services.matching_service import _score_economico, _score_familiar, _score_geografico
from backend.services.cliente_service import _values_equivalent


def make_cliente(**overrides):
    data = {
        "nombre": "Test",
        "apellido_paterno": "User",
        "estado_busqueda": "Veracruz",
        "ciudad_busqueda": "Veracruz",
        "municipio": "Boca del Río",
        "colonia": "Costa de Oro",
        "fraccionamiento_colonia": "Costa de Oro",
    }
    data.update(overrides)
    return Cliente(**data)


def make_propiedad(**overrides):
    data = {
        "titulo": "Casa test",
        "tipo": "casa",
        "tipo_operacion": "venta",
        "precio": 1000000,
        "estado": "Veracruz",
        "municipio": "Boca del Río",
        "colonia": "Costa de Oro",
        "fraccionamiento": "Costa de Oro",
        "hijos_ideal": 0,
        "mascotas_ideal": 0,
    }
    data.update(overrides)
    return Propiedad(**data)


def test_score_geografico_uses_municipio_and_colonia_fields():
    cliente = make_cliente()
    propiedad = make_propiedad()

    score, details = _score_geografico(cliente, propiedad)

    assert score >= 80
    assert details.get("municipio") == "✓"
    assert details.get("colonia_fraccionamiento") == "✓"


def test_score_familiar_does_not_reward_pet_unfriendly_property():
    cliente = make_cliente(mascotas=1)
    propiedad = make_propiedad(mascotas_ideal=0)

    score, details = _score_familiar(cliente, propiedad)

    assert score == 0.0
    assert details.get("mascotas") == "✗"


def test_score_economico_rewards_properties_below_the_minimum_budget():
    cliente = make_cliente(presupuesto_min=1_000_000, presupuesto_max=2_000_000)
    propiedad = make_propiedad(precio=500_000)

    score, details = _score_economico(cliente, propiedad)

    assert score == 30.0
    assert details.get("precio_por_debajo")


def test_values_equivalent_normalizes_date_strings():
    assert _values_equivalent("1990-01-01", "01/01/1990")
    assert _values_equivalent("10", "10.0")
