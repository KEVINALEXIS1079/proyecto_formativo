---
title: API de Inventario
description: Documentación de los endpoints del módulo de inventario
---

# API de Inventario

Esta sección documenta los endpoints relacionados con la gestión de inventario (insumos, almacenes, proveedores).

## Endpoints

### GET /inventory/insumos
Obtiene la lista de insumos.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "category": "string"
    }
  ]
}
```

### POST /inventory/insumos
Crea un nuevo insumo.

**Parámetros de entrada:**
- `name`: string (requerido)
- `quantity`: number (requerido)
- `unit`: string (requerido)
- `category`: string (opcional)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "quantity": "number",
  "unit": "string",
  "category": "string"
}
```

### GET /inventory/almacenes
Obtiene la lista de almacenes.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "location": "string"
    }
  ]
}
```

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Recurso no encontrado