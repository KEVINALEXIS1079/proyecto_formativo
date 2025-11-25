---
title: API de Actividades
description: Documentación de los endpoints del módulo de actividades
---

# API de Actividades

Esta sección documenta los endpoints relacionados con la gestión de actividades agrícolas.

## Endpoints

### GET /activities
Obtiene la lista de actividades.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string",
      "date": "string",
      "status": "string"
    }
  ]
}
```

### POST /activities
Crea una nueva actividad.

**Parámetros de entrada:**
- `name`: string (requerido)
- `description`: string (opcional)
- `date`: string (requerido, formato ISO)
- `status`: string (opcional)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "date": "string",
  "status": "string"
}
```

### PUT /activities/:id
Actualiza una actividad existente.

**Parámetros de entrada:**
- `name`: string (opcional)
- `description`: string (opcional)
- `status`: string (opcional)

**Respuesta exitosa (200):**
```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "date": "string",
  "status": "string"
}
```

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Actividad no encontrada