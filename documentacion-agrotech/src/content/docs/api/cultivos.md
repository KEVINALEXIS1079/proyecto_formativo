---
title: Cultivos
description: Documentación de los endpoints del módulo de cultivos
---

# API de Cultivos

Gestiona el ciclo de vida de los cultivos, desde la siembra hasta la cosecha/finalización.

## Endpoints de Cultivos

### Crear Cultivo
Registra un nuevo cultivo en el sistema. Soporta la carga de una imagen opcional.

- **URL**: `/cultivos`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `cultivos.crear`
- **Content-Type**: `multipart/form-data` (si envía imagen) o `application/json`

**Body (FormData o JSON):**
- `nombre`: string (requerido)
- `tipoCultivo`: string (requerido, ej: "MAIZ")
- `fechaSiembra`: string (ISO 8601, requerido)
- `fechaCosechaEstimada`: string (ISO 8601, opcional)
- `densidadPlantas`: number (opcional)
- `loteId`: number (requerido)
- `subLoteId`: number (opcional)
- `img`: File (imagen del cultivo, opcional)

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 10,
  "nombre": "Maíz Lote Norte",
  "tipoCultivo": "MAIZ",
  "fechaSiembra": "2025-11-15T00:00:00Z",
  "fechaCosechaEstimada": "2026-04-15T00:00:00Z",
  "estado": "ACTIVO",
  "loteId": 2,
  "imgUrl": "https://api.agrotech.com/uploads/cultivos/maiz.jpg"
}
```

---

### Listar Cultivos
Obtiene una lista de cultivos con opciones de filtrado.

- **URL**: `/cultivos`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `cultivos.ver`

**Parámetros de Consulta (Query Params):**
- `q`: Búsqueda por nombre (parcial)
- `loteId`: Filtrar por ID de lote
- `subLoteId`: Filtrar por ID de sublote
- `estado`: Filtrar por estado (ej: 'ACTIVO', 'COSECHADO', 'FINALIZADO')
- `tipoCultivo`: Filtrar por tipo

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 10,
    "nombre": "Maíz Lote Norte",
    "tipoCultivo": "MAIZ",
    "fechaSiembra": "2025-11-15T00:00:00Z",
    "estado": "ACTIVO",
    "lote": { "id": 2, "nombre": "Lote Norte" }
  },
  {
    "id": 8,
    "nombre": "Tomate Invernadero",
    "tipoCultivo": "TOMATE",
    "fechaSiembra": "2025-10-01T00:00:00Z",
    "estado": "COSECHADO",
    "lote": { "id": 3, "nombre": "Invernadero 1" }
  }
]
```

---

### Ver Detalles de Cultivo
Obtiene la información completa de un cultivo específico.

- **URL**: `/cultivos/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `cultivos.ver`

**Respuesta Exitosa (200 OK):**
```json
{
  "id": 10,
  "nombre": "Maíz Lote Norte",
  "tipoCultivo": "MAIZ",
  "descripcion": "Siembra experimental variedad híbrida",
  "fechaSiembra": "2025-11-15T00:00:00Z",
  "fechaCosechaEstimada": "2026-04-15T00:00:00Z",
  "densidadPlantas": 60000,
  "estado": "ACTIVO",
  "lote": {
    "id": 2,
    "nombre": "Lote Norte",
    "areaM2": 10000
  },
  "actividades": [
    { "id": 5, "tipo": "SIEMBRA", "estado": "COMPLETADA" }
  ],
  "imgUrl": "https://api.agrotech.com/uploads/cultivos/maiz.jpg",
  "createdAt": "2025-11-15T10:00:00Z"
}
```

---

### Actualizar Cultivo
Actualiza la información de un cultivo. Soporta actualización de imagen.

- **URL**: `/cultivos/:id`
- **Método**: `PATCH`
- **Auth**: Requiere autenticación y permiso `cultivos.editar`
- **Content-Type**: `multipart/form-data` o `application/json`

**Body (FormData):**
- Campos opcionales de creación (nombre, fechas, etc.)
- `img`: Nuevo archivo de imagen (si se desea actualizar)

**Respuesta Exitosa (200 OK):**
```json
{
  "id": 10,
  "nombre": "Maíz Lote Norte - Actualizado",
  "fechaCosechaEstimada": "2026-05-01T00:00:00Z",
  "imgUrl": "https://api.agrotech.com/uploads/cultivos/new-image.jpg"
}
```

---

### Eliminar Cultivo
Elimina un cultivo del sistema (o realiza borrado lógico según implementación).

- **URL**: `/cultivos/:id`
- **Método**: `DELETE`
- **Auth**: Requiere autenticación y permiso `cultivos.eliminar`

---

### Historial de Cultivos
Obtiene un historial de cambios o eventos del cultivo.

- **URL**: `/cultivos/historial`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `cultivos.ver`

**Parámetros:**
- `cultivoId`: ID del cultivo (opcional, para filtrar)
- `limit`: Número máximo de registros (default: 50)
