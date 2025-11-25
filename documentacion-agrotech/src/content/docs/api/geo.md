---
title: API de Geografía
description: Documentación de los endpoints del módulo de geografía
---

# API de Geografía

Esta sección documenta los endpoints relacionados con la gestión geográfica (cultivos, lotes, sublotes).

## Endpoints

### GET /geo/cultivos
Obtiene la lista de cultivos.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "description": "string"
    }
  ]
}
```

### POST /geo/cultivos
Crea un nuevo cultivo.

**Parámetros de entrada:**
- `name`: string (requerido)
- `description`: string (opcional)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "description": "string"
}
```

### GET /geo/lotes
Obtiene la lista de lotes.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "area": "number",
      "cultivoId": "number"
    }
  ]
}
```

### POST /geo/lotes
Crea un nuevo lote.

**Parámetros de entrada:**
- `name`: string (requerido)
- `area`: number (requerido)
- `cultivoId`: number (requerido)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "area": "number",
  "cultivoId": "number"
}
```

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Recurso no encontrado