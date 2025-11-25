---
title: API de Wiki
description: Documentación de los endpoints del módulo de wiki
---

# API de Wiki

Esta sección documenta los endpoints relacionados con la wiki de buenas prácticas agrícolas (EPA).

## Endpoints

### GET /wiki/epa
Obtiene la lista de EPA.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "tipoCultivo": "string"
    }
  ]
}
```

### POST /wiki/epa
Crea una nueva EPA.

**Parámetros de entrada:**
- `title`: string (requerido)
- `description`: string (requerido)
- `tipoCultivo`: string (requerido)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "tipoCultivo": "string"
}
```

### GET /wiki/tipos-cultivo
Obtiene la lista de tipos de cultivo.

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

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Recurso no encontrado