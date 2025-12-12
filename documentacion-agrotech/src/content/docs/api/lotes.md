---
title: API de Lotes y Sublotes
description: Documentacion del modulo de georreferenciacion (lotes y sublotes) con calculo automatico de area y validaciones espaciales
---

# API de Lotes y Sublotes

## Vision General

El modulo de georreferenciacion administra lotes y sublotes con apoyo de PostGIS. Todos los poligonos se almacenan en SRID 4326 y el sistema calcula automaticamente area (m2, ha) y centroide. Las operaciones aplican validaciones de contencion y no solape para proteger la integridad espacial.

### Caracteristicas principales

- **Calculo automatico**: area en m2 y ha, mas centroide a partir del GeoJSON enviado
- **Validaciones PostGIS**: contencion obligatoria de sublotes dentro del lote y bloqueo de solapes
- **Permisos granulares**: claves `lotes.*` y `sublotes.*` para crear, ver, editar y eliminar
- **Soft delete**: eliminaciones logicas mantienen historico de relaciones
- **Filtro por lote**: listado de sublotes admite query `loteId` para vistas por ubicacion

### Formato de geometria

- Tipo: GeoJSON Polygon (SRID 4326). Se almacena en columnas `geometry`.
- Campo requerido: `geom` en todos los POST/PATCH que modifiquen el poligono.
- Ejemplo:

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [-74.1, 4.7],
      [-74.1, 4.71],
      [-74.09, 4.71],
      [-74.09, 4.7],
      [-74.1, 4.7]
    ]
  ]
}
```

### Permisos clave

- Lotes: `lotes.ver`, `lotes.crear`, `lotes.editar`, `lotes.eliminar`
- Sublotes: `sublotes.ver`, `sublotes.crear`, `sublotes.editar`, `sublotes.eliminar`

## Endpoints de Lotes

Base path: `/geo`

### POST /geo/lotes

**Permisos:** `lotes.crear`

**Body:**

```json
{
  "nombre": "Lote Principal",
  "descripcion": "Zona norte",
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-74.1, 4.7], [-74.09, 4.7], [-74.09, 4.71], [-74.1, 4.71], [-74.1, 4.7]]]
  }
}
```

**Comportamiento:**

- Requiere `geom` valido; calcula `areaM2`, `areaHa` y `centroide`.
- Estado inicial: `activo`.

**Respuesta 201:**

```json
{
  "id": 7,
  "nombre": "Lote Principal",
  "descripcion": "Zona norte",
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-74.1, 4.7], [-74.09, 4.7], [-74.09, 4.71], [-74.1, 4.71], [-74.1, 4.7]]]
  },
  "areaM2": 12500.35,
  "areaHa": 1.25,
  "centroide": { "type": "Point", "coordinates": [-74.095, 4.705] },
  "estado": "activo",
  "createdAt": "2025-12-04T10:00:00.000Z",
  "updatedAt": "2025-12-04T10:00:00.000Z"
}
```

### GET /geo/lotes

**Permisos:** `lotes.ver`

- Lista todos los lotes con relacion `sublotes`.

### GET /geo/lotes/:id

**Permisos:** `lotes.ver`

- Retorna un lote especifico.
- Error `404` si no existe.

### PATCH /geo/lotes/:id

**Permisos:** `lotes.editar`

- Acepta cualquier campo del DTO de creacion.
- Si se envia `geom`, recalcula `areaM2`, `areaHa` y `centroide` antes de guardar.

### DELETE /geo/lotes/:id

**Permisos:** `lotes.eliminar`

- Soft delete (marca `deleted_at`), conserva historial y referencias.

## Endpoints de Sublotes

### POST /geo/sublotes

**Permisos:** `sublotes.crear`

**Body:**

```json
{
  "loteId": 7,
  "nombre": "Subparcela A",
  "descripcion": "Bloque de pruebas",
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-74.1, 4.7], [-74.09, 4.7], [-74.09, 4.71], [-74.1, 4.71], [-74.1, 4.7]]]
  }
}
```

**Validaciones:**

- El `geom` del sublote debe estar contenido en el poligono del lote (`ST_Contains`).
- Bloquea solapes con otros sublotes del mismo lote (`ST_Overlaps`).
- `nombre` debe ser unico dentro del lote.

**Respuesta 201:**

```json
{
  "id": 12,
  "loteId": 7,
  "nombre": "Subparcela A",
  "descripcion": "Bloque de pruebas",
  "geom": {
    "type": "Polygon",
    "coordinates": [[[-74.095, 4.705], [-74.094, 4.705], [-74.094, 4.706], [-74.095, 4.706], [-74.095, 4.705]]]
  },
  "areaM2": 3200.5,
  "areaHa": 0.32,
  "centroide": { "type": "Point", "coordinates": [-74.094, 4.704] },
  "lote": { "id": 7, "nombre": "Lote Principal" },
  "createdAt": "2025-12-04T10:05:00.000Z",
  "updatedAt": "2025-12-04T10:05:00.000Z"
}
```

### GET /geo/sublotes

**Permisos:** `sublotes.ver`

- Admite filtro opcional `?loteId=` para traer solo los sublotes de un lote.

### GET /geo/sublotes/:id

**Permisos:** `sublotes.ver`

- Incluye relacion `lote`.
- Error `404` si no existe.

### PATCH /geo/sublotes/:id

**Permisos:** `sublotes.editar`

- Permite actualizar nombre, descripcion o geometria.
- Si se envia `geom`, repite las validaciones de contencion/no solape (ignorando el propio id) y recalcula areas/centroide.

### DELETE /geo/sublotes/:id

- **Permisos:** `sublotes.eliminar`
- Soft delete.

## Validaciones y reglas de negocio

- **Calculo espacial**: `areaM2` y `areaHa` se obtienen con `ST_Area`, `centroide` con `ST_Centroid`.
- **Contencion de sublotes**: `ST_Contains(lote.geom, sublote.geom)` debe ser `true`.
- **No solape**: `ST_Overlaps` se usa para evitar intersecciones entre sublotes del mismo lote (se excluye el sublote actual al editar).
- **Unicidad de nombre**: no se permite repetir `nombre` dentro del mismo `loteId`.
- **Estado de lotes**: se inicia como `activo`; cambios de geometria siempre recalculan metricas.

## Entidades relacionadas

### Lote

```typescript
{
  id: number;
  nombre: string;
  descripcion?: string;
  geom: GeoJSON.Polygon;
  areaM2?: number;
  areaHa?: number;
  centroide?: GeoJSON.Point;
  estado: string; // 'activo' por defecto
  sublotes?: SubLote[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### SubLote

```typescript
{
  id: number;
  loteId: number;
  nombre: string;
  descripcion?: string;
  geom: GeoJSON.Polygon;
  areaM2?: number;
  areaHa?: number;
  centroide?: GeoJSON.Point;
  lote?: Lote;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

## Respuestas de error comunes

```json
{
  "statusCode": 400,
  "message": "El sublote se solapa con otro sublote existente",
  "error": "Bad Request"
}
```

- **400 Bad Request**: geometria fuera del lote, solapes o violaciones de unicidad.
- **401 Unauthorized**: token JWT invalido o vencido.
- **403 Forbidden**: permisos insuficientes (ver claves arriba).
- **404 Not Found**: lote o sublote inexistente.
