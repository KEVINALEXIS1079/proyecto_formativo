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
Objeto JSON con los datos del cultivo creado.

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

---

### Ver Detalles de Cultivo
Obtiene la información completa de un cultivo específico.

- **URL**: `/cultivos/:id`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `cultivos.ver`

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

**Respuesta:**
Objeto actualizado del cultivo.

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
