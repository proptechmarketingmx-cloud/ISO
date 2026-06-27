import requests

BASE = 'http://localhost:8000/api'
results = []

def check(name, cond, detail=''):
    status = 'PASS' if cond else 'FAIL'
    results.append({'test': name, 'status': status, 'detail': detail})
    icon = '[PASS]' if cond else '[FAIL]'
    print(f'{icon} {name}' + (f'  -> {detail}' if detail else ''))

# 1. GET /clientes - lista vacia
r = requests.get(f'{BASE}/clientes')
check('GET /clientes responde 200', r.status_code == 200)
check('GET /clientes devuelve lista', isinstance(r.json(), list))

# 2. POST /clientes - creacion valida
payload = {
    'nombre': 'Maria',
    'apellido_paterno': 'Garcia',
    'apellido_materno': 'Lopez',
    'correo': 'maria@test.com',
    'whatsapp': '5551234567',
    'estado_cliente': 'nuevo',
    'canal_captacion': 'Facebook'
}
r = requests.post(f'{BASE}/clientes', json=payload)
check('POST /clientes 201 Created', r.status_code == 201)
cliente = r.json()
cliente_id = cliente.get('id_cliente')
check('POST respuesta tiene id_cliente', cliente_id is not None, str(cliente_id))

# 3. POST /clientes - validacion campo faltante
r = requests.post(f'{BASE}/clientes', json={'nombre': 'Solo'})
check('POST valida campo requerido (422)', r.status_code == 422)

# 4. GET /clientes/{id}
r = requests.get(f'{BASE}/clientes/{cliente_id}')
check('GET /clientes/{id} 200', r.status_code == 200)
check('GET respuesta nombre correcto', r.json().get('nombre') == 'Maria')

# 5. PUT /clientes/{id} - actualizar estado
r = requests.put(f'{BASE}/clientes/{cliente_id}', json={'estado_cliente': 'contactado'})
check('PUT /clientes/{id} 200', r.status_code == 200)
check('PUT estado actualizado', r.json().get('estado_cliente') == 'contactado')

# 6. GET expediente
r = requests.get(f'{BASE}/clientes/{cliente_id}/expediente')
check('GET expediente 200', r.status_code == 200)
exp = r.json()
historial = exp.get('historial', [])
n_hist = len(historial)
check('Expediente incluye historial', n_hist > 0, f'{n_hist} eventos')
acciones = [h.get('accion') for h in historial]
check('Historial registra creacion', 'creado' in acciones)
check('Historial registra cambio_estado', 'cambio_estado' in acciones)

# 7. POST nota al expediente
r = requests.post(f'{BASE}/clientes/{cliente_id}/notas', json={'contenido': 'Test nota de verificacion'})
check('POST nota 201', r.status_code == 201)
check('Nota tiene id_nota', r.json().get('id_nota') is not None)

# 8. POST actividad
r = requests.post(f'{BASE}/clientes/{cliente_id}/actividades', json={'tipo': 'Llamada', 'descripcion': 'Primera llamada de seguimiento'})
check('POST actividad 201', r.status_code == 201)

# 9. GET expediente con nota y actividad
r = requests.get(f'{BASE}/clientes/{cliente_id}/expediente')
exp = r.json()
check('Expediente incluye notas', len(exp.get('notas', [])) > 0)
check('Expediente incluye actividades', len(exp.get('actividades', [])) > 0)

# 10. Busqueda por nombre
r = requests.get(f'{BASE}/clientes?search=Maria')
check('Busqueda por nombre funciona', any(c.get('nombre') == 'Maria' for c in r.json()))

# 11. Busqueda por correo
r = requests.get(f'{BASE}/clientes?search=maria@test.com')
check('Busqueda por correo funciona', len(r.json()) > 0)

# 12. Busqueda por whatsapp
r = requests.get(f'{BASE}/clientes?search=5551234567')
check('Busqueda por telefono funciona', len(r.json()) > 0)

# 13. Filtro por estado
r = requests.get(f'{BASE}/clientes?estado=contactado')
clientes_filtrados = r.json()
check('Filtro por estado funciona', all(c['estado_cliente'] == 'contactado' for c in clientes_filtrados))

# 14. GET cliente inexistente
r = requests.get(f'{BASE}/clientes/99999')
check('GET cliente inexistente 404', r.status_code == 404)

# 15. DELETE cliente
r = requests.delete(f'{BASE}/clientes/{cliente_id}')
check('DELETE /clientes/{id} 204', r.status_code == 204)

# 16. Confirmar eliminacion
r = requests.get(f'{BASE}/clientes/{cliente_id}')
check('Cliente eliminado no existe (404)', r.status_code == 404)

# 17. Asesores endpoint (integracion)
r = requests.get(f'{BASE}/asesores')
check('GET /asesores disponible (integracion)', r.status_code == 200)

# 18. Propiedades endpoint (integracion)
r = requests.get(f'{BASE}/propiedades')
check('GET /propiedades disponible (integracion)', r.status_code == 200)

print()
passed = sum(1 for r in results if r['status'] == 'PASS')
failed = sum(1 for r in results if r['status'] == 'FAIL')
fails = [r for r in results if r['status'] == 'FAIL']
print(f'RESUMEN: {passed} PASS | {failed} FAIL de {len(results)} pruebas totales')
if fails:
    print('Pruebas fallidas:')
    for f in fails:
        print(f"  - {f['test']}: {f['detail']}")
print('RESULTADO:', 'APROBADO' if failed == 0 else 'REQUIERE CORRECCIONES')
