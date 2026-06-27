# Documentación de la API REST — Plataforma ISO

Esta API está desarrollada sobre **FastAPI (Python)** y expone endpoints bajo el prefijo `/api`. Las peticiones y respuestas manejan el tipo de contenido `application/json`.

---

## 1. Clientes
Endpoints para la administración de la cartera de clientes.

* **`GET /api/clientes`**
  * **Query Params (Opcionales):** `skip` (int, default: 0), `limit` (int, default: 100), `search` (str).
  * **Retorna:** Colección de objetos `ClienteResponse`.
* **`GET /api/clientes/{id_cliente}`**
  * **Retorna:** Detalle del cliente. Lanza HTTP 404 si no se encuentra.
* **`POST /api/clientes`**
  * **Cuerpo (JSON):** Objeto `ClienteCreate`.
  * **Retorna:** El cliente registrado con `id_cliente` generado y código HTTP 201.
* **`PUT /api/clientes/{id_cliente}`**
  * **Cuerpo (JSON):** Objeto `ClienteUpdate` (campos parciales).
  * **Retorna:** El cliente con los campos modificados aplicados.
* **`DELETE /api/clientes/{id_cliente}`**
  * **Retorna:** Estado vacío con código HTTP 204.

---

## 2. Leads (Pipeline)
Manejados bajo la misma lógica, pero mapeados a sus propios flujos de negociación.

* **`GET /api/leads`**
  * **Query Params:** `skip` (int), `limit` (int), `search` (str), `etapa` (str, filtra por etapa del lead).
  * **Retorna:** Listado de leads. Sincroniza automáticamente la respuesta mapeando el campo interno `origen` al campo `fuente` consumido por la UI.
* **`GET /api/leads/{id_lead}`**
  * **Retorna:** Detalle del lead (incluye la transformación de `origen` a `fuente`).
* **`POST /api/leads`**
  * **Cuerpo (JSON):** `LeadCreate`. Mapea el campo `fuente` de la UI al campo de base de datos `origen` antes de insertar.
  * **Retorna:** Lead creado (HTTP 201).
* **`PUT /api/leads/{id_lead}`**
  * **Cuerpo (JSON):** `LeadUpdate`.
* **`DELETE /api/leads/{id_lead}`**
  * **Retorna:** Código HTTP 204.

---

## 3. Propiedades (Inmuebles)
* **`GET /api/propiedades`** (con soporte para filtros de búsqueda y paginación)
* **`GET /api/propiedades/{id_propiedad}`**
* **`POST /api/propiedades`**
* **`PUT /api/propiedades/{id_propiedad}`**
* **`DELETE /api/propiedades/{id_propiedad}`**

---

## 4. Asesores (Agentes Comerciales)
* **`GET /api/asesores`**
* **`GET /api/asesores/{id_asesor}`**
* **`POST /api/asesores`**
* **`PUT /api/asesores/{id_asesor}`**
* **`DELETE /api/asesores/{id_asesor}`**

---

## 5. CNA (Customer Network Analysis)
Servicios de cálculo de teoría de grafos.

* **`GET /api/cna/clientes/network`**
  * **Retorna:** Datos estructurados para visualizaciones de grafos en 2D/3D:
    ```json
    {
      "nodes": [{"id": 1, "label": "Juan Pérez", "size": 15}],
      "links": [{"source": 1, "target": 2, "type": "FAMILIAR", "weight": 1.0}]
    }
    ```
* **`GET /api/cna/clientes/scores`**
  * **Retorna:** Índices de **Influence Score** y **Provider Score** de todos los clientes.
* **`GET /api/cna/clientes/rankings`**
  * **Retorna:** Rankings ordenados de recomendadores estrella, mayor volumen acumulado y mayores puntuaciones de negocio.
* **`GET /api/cna/clientes/communities`**
  * **Retorna:** Listado de clusters (grupos familiares, profesionales, geográficos).
* **`GET /api/cna/asesores/network`**, **`scores`**, **`rankings`**, **`communities`**
  * Equivalentes para la red de asesores.

---

## 6. Dashboard y KPIs
* **`GET /api/dashboard/summary`:** Retorna indicadores globales de la inmobiliaria (recuentos de leads por etapas, clientes totales, propiedades disponibles).
* **`GET /api/kpis/clientes`**, **`propiedades`**, **`asesores`:** Endpoints para la extracción de analíticas agregadas listas para gráficos.
