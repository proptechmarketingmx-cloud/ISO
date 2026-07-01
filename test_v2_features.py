import requests

BASE = 'http://localhost:8000/api'
results = []

def check(name, cond, detail=''):
    status = 'PASS' if cond else 'FAIL'
    results.append({'test': name, 'status': status, 'detail': detail})
    icon = '[PASS]' if cond else '[FAIL]'
    print(f'{icon} {name}' + (f'  -> {detail}' if detail else ''))

print("=== INICIANDO VERIFICACIÓN DE CARACTERÍSTICAS V2 ===")

# 1. Crear un asesor de prueba para asociar a la propiedad
r_asesor = requests.post(f'{BASE}/asesores', json={
    'nombre': 'Juan',
    'apellidos': 'Asesor Test',
    'telefono': '1234567890',
    'correo': 'juan.asesor@test.com'
})
check('Creación de asesor de prueba', r_asesor.status_code == 201)
asesor_id = r_asesor.json().get('id_asesor')

# 2. Crear una propiedad de prueba para el matching
r_prop = requests.post(f'{BASE}/propiedades', json={
    'titulo': 'Casa en Venta en Costa de Oro',
    'tipo': 'casa',
    'tipo_operacion': 'venta',
    'precio': 3000000.0,
    'status': 'disponible',
    'estado': 'Veracruz',
    'municipio': 'Boca del Río',
    'colonia': 'Costa de Oro',
    'id_asesor': asesor_id,
    'm2_construccion': 250,
    'm2_terreno': 300,
    'recamaras': 3,
    'banos': 3.5,
    'estacionamientos': 2,
    'exclusiva': True,
    'documentacion_completa': True,
    'creditos_aceptados': '["bancario", "infonavit"]',
    'amenidades': '["alberca", "jardin", "seguridad_24h"]'
})
check('Creación de propiedad de prueba', r_prop.status_code == 201)
prop = r_prop.json()
prop_id = prop.get('id_propiedad')

# 2.1 Verificar campos calculados en la propiedad
check('Ingreso recomendado calculado (precio/120 para venta)', float(prop.get('ingreso_recomendado')) == 25000.0, f"Obtenido: {prop.get('ingreso_recomendado')}")
check('Score de atractivo calculado', float(prop.get('score_atractivo')) > 50, f"Obtenido: {prop.get('score_atractivo')}")

# 3. Crear cliente con campos del CNA y datos personales válidos
cliente_payload = {
    'nombre': 'Carlos',
    'apellido_paterno': 'Mendoza',
    'apellido_materno': 'Rojas',
    'fecha_nacimiento': '1990-05-15', # Millennials (1981 - 1996)
    'genero': 'masculino',
    'estado_civil': 'casado',
    'curp': 'MERC900515HDFRJS01',
    'rfc': 'MERC900515AB1',
    'whatsapp': '+5212299887766', # WhatsApp con lada internacional
    'correo': 'carlos.mendoza@test.com',
    'estado_busqueda': 'Veracruz',
    'fraccionamiento_colonia': 'Costa de Oro',
    'tipo_credito': 'bancario',
    'presupuesto_min': 2000000.0,
    'presupuesto_max': 3500000.0,
    'ingreso_mensual': 30000.0,
    'tipo_propiedad': 'casa',
    'operacion': 'venta',
    'hijos': 1,
    'mascotas': 1,
    'integrantes_hogar': 3,
    'amenidades_deseadas': '["alberca", "jardin"]'
}

r_client = requests.post(f'{BASE}/clientes', json=cliente_payload)
check('Creación de cliente con CNA exitoso', r_client.status_code == 201)
cliente = r_client.json()
cliente_id = cliente.get('id_cliente')

# 3.1 Verificar campos calculados del cliente
check('Edad calculada correctamente', cliente.get('edad') == 36, f"Edad: {cliente.get('edad')}") # Asumiendo fecha base 2026
check('Generación calculada correctamente (Millennials)', cliente.get('generacion') == 'Millennials', f"Gen: {cliente.get('generacion')}")
check('Lada internacional inferida (+52)', cliente.get('lada') == '+5212', f"Lada: {cliente.get('lada')}")

# 4. Prevención de registros duplicados
# Intento de duplicar correo
payload_dupe_correo = cliente_payload.copy()
payload_dupe_correo['curp'] = 'MERC900515HDFRJS02'
payload_dupe_correo['rfc'] = 'MERC900515AB2'
payload_dupe_correo['whatsapp'] = '+5212299887799'
r_dupe_c = requests.post(f'{BASE}/clientes', json=payload_dupe_correo)
check('Rechazo por correo duplicado (409)', r_dupe_c.status_code == 409)

# Intento de duplicar CURP
payload_dupe_curp = cliente_payload.copy()
payload_dupe_curp['correo'] = 'otro@correo.com'
payload_dupe_curp['rfc'] = 'MERC900515AB2'
payload_dupe_curp['whatsapp'] = '+5212299887799'
r_dupe_curp = requests.post(f'{BASE}/clientes', json=payload_dupe_curp)
check('Rechazo por CURP duplicada (409)', r_dupe_curp.status_code == 409)

# 5. Obtener compatibilidad (matches)
r_matches_c = requests.get(f'{BASE}/clientes/{cliente_id}/matches')
check('GET matches para cliente responde 200', r_matches_c.status_code == 200)
matches_c = r_matches_c.json()
check('Existen coincidencias calculadas', len(matches_c) > 0)
if len(matches_c) > 0:
    top_match = matches_c[0]
    check('Coincidencia superior tiene score total alto', float(top_match.get('score_total')) >= 80.0, f"Score: {top_match.get('score_total')}%")

# 6. Obtener compatibilidad desde la propiedad
r_matches_p = requests.get(f'{BASE}/propiedades/{prop_id}/matches')
check('GET matches para propiedad responde 200', r_matches_p.status_code == 200)
matches_p = r_matches_p.json()
check('Existen coincidencias para la propiedad', len(matches_p) > 0)

# 7. Agregar multimedia a la propiedad
r_media = requests.post(f'{BASE}/propiedades/{prop_id}/multimedia', json={
    'tipo': 'foto',
    'url': 'https://ejemplo.com/fotos/fachada.jpg',
    'nombre': 'Fachada Principal',
    'descripcion': 'Vista frontal desde la calle'
})
check('Agregar multimedia responde 201', r_media.status_code == 201)

# Listar multimedia
r_media_list = requests.get(f'{BASE}/propiedades/{prop_id}/multimedia')
check('GET multimedia responde 200', r_media_list.status_code == 200)
check('Multimedia listado contiene el elemento agregado', len(r_media_list.json()) > 0)

# 8. Limpiar datos de prueba
requests.delete(f'{BASE}/clientes/{cliente_id}')
requests.delete(f'{BASE}/propiedades/{prop_id}')
requests.delete(f'{BASE}/asesores/{asesor_id}')
print("=== VERIFICACIÓN COMPLETADA ===")
