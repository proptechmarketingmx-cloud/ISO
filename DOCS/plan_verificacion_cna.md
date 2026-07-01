# Plan de Verificación Funcional – Módulos Customer Needs Analysis (CNA)

## Objetivo
Realizar una verificación funcional completa de los módulos **Customer Needs Analysis (CNA)** para confirmar que todas las funcionalidades implementadas en el backend y frontend se encuentren correctamente integradas, accesibles desde la interfaz y operando conforme a la arquitectura definida para la versión 2.0.

La validación deberá abarcar la navegación, el consumo de APIs, la visualización de información, la interacción entre módulos y la correcta generación de resultados.

---

# Alcance
Los siguientes componentes deberán ser verificados:

- Módulo Customer Needs Analysis (CNA)
- Dashboard CNA
- Expediente de Clientes
- Expediente de Propiedades
- Motor de Compatibilidad
- Navegación cruzada
- Desglose del Score
- Recomendaciones
- KPIs asociados al CNA

---

# 1. Acceso al Módulo

## Verificar

- El menú principal muestra la opción **Customer Needs Analysis**.
- La opción es visible para los perfiles autorizados.
- La navegación abre correctamente la vista principal del módulo.
- No existen errores 404, 403 ni pantallas en blanco.

**Resultado esperado**

El módulo carga correctamente y presenta la interfaz principal.

---

# 2. Dashboard CNA

## Verificar

- Carga sin errores.
- Obtiene información desde el backend.
- Presenta indicadores actualizados.
Validar la existencia de los siguientes indicadores:

- Total de clientes analizados.
- Total de propiedades analizadas.
- Compatibilidad promedio.
- Matches superiores al 90%.
- Matches entre 80% y 90%.
- Clientes sin coincidencias.
- Propiedades sin coincidencias.

**Resultado esperado**

Todos los indicadores muestran datos válidos o un estado vacío controlado.

---

# 3. Expediente del Cliente
Abrir un cliente existente.

Verificar que exista la pestaña:

**Customer Needs Analysis**

Comprobar que se muestre:

- Score CNA.
- Perfil financiero.
- Perfil familiar.
- Perfil demográfico.
- Preferencias inmobiliarias.
- Recomendaciones.
- Lista de propiedades compatibles.

**Resultado esperado**

La información coincide con los datos almacenados del cliente.

---

# 4. Expediente de la Propiedad
Abrir una propiedad existente.

Verificar que exista la pestaña:

**Customer Needs Analysis**

Comprobar que se muestre:

- Score atractivo.
- Perfil objetivo.
- Clientes compatibles.
- Recomendaciones.
- Compatibilidad promedio.

---

# 5. Motor de Compatibilidad
Validar que el sistema consulte correctamente los endpoints:

```
GET /api/clientes/{id}/matches
GET /api/propiedades/{id}/matches
```
Comprobar que:

- No existan errores HTTP.
- Se reciban datos válidos.
- La interfaz represente correctamente la respuesta.

---

# 6. Navegación Cruzada
Desde un cliente:

- Abrir una propiedad compatible.
Desde una propiedad:

- Abrir un cliente compatible.
Verificar que:

- El expediente correspondiente se abra correctamente.
- No se pierda el contexto de navegación.
- Los identificadores enviados sean correctos.

---

# 7. Desglose del Score
Seleccionar la opción:

**Ver desglose**

Verificar que el sistema muestre:

- Factores evaluados.
- Peso de cada factor.
- Resultado obtenido.
- Score total.
- Nivel de compatibilidad.
No deberán mostrarse valores vacíos o inconsistentes.

---

# 8. Recomendaciones
Comprobar que el módulo genere recomendaciones automáticas según el resultado del análisis.

Ejemplos:

- Ajustar presupuesto.
- Buscar otra ubicación.
- Cambiar tipo de propiedad.
- Ampliar rango de búsqueda.
- Utilizar otro esquema de financiamiento.
Las recomendaciones deberán variar de acuerdo con el perfil del cliente y la propiedad.

---

# 9. Filtros
Verificar el funcionamiento de los filtros disponibles.

Clientes:

- Estado.
- Ciudad.
- Tipo de crédito.
- Presupuesto.
- Score.
Propiedades:

- Tipo.
- Precio.
- Área.
- Habitaciones.
- Amenidades.

---

# 10. Rendimiento
Validar que:

- La carga del módulo sea fluida.
- Las consultas respondan en tiempos aceptables.
- La navegación entre clientes y propiedades no genere bloqueos.

---

# 11. Manejo de Errores
Simular escenarios como:

- Cliente sin coincidencias.
- Propiedad sin coincidencias.
- Error de comunicación con la API.
- Identificador inexistente.
El sistema deberá mostrar mensajes claros y controlar los errores sin interrumpir la navegación.

---

# 12. Seguridad
Verificar que:

- Solo los perfiles autorizados puedan acceder al módulo.
- Los usuarios sin permisos no visualicen el menú ni puedan acceder mediante URL directa.

---

# 13. Compatibilidad del Frontend
Verificar que todos los componentes estén correctamente registrados e integrados.

- Dashboard CNA.
- Vista de Clientes.
- Vista de Propiedades.
- Vista de Compatibilidades.
- Modal de Desglose.
- Panel de Recomendaciones.
No deberán existir componentes implementados pero inaccesibles.

---

# Criterios de Aceptación
La verificación se considerará satisfactoria cuando:

- El módulo **Customer Needs Analysis** sea completamente accesible desde el menú principal.
- Todas las rutas funcionen correctamente.
- Los expedientes de clientes y propiedades muestren la información del CNA.
- El motor de compatibilidad entregue resultados consistentes.
- La navegación cruzada funcione en ambos sentidos.
- El desglose del score y las recomendaciones se visualicen correctamente.
- El Dashboard CNA presente indicadores válidos.
- Los filtros y búsquedas operen correctamente.
- No existan errores de JavaScript, errores HTTP ni fallos de integración entre frontend y backend.
- La experiencia de usuario permita utilizar el módulo CNA de principio a fin sin recurrir a funciones ocultas o enlaces internos.
