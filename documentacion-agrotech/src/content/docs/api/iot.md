---
title: API de IoT
description: Documentación de los endpoints del módulo de IoT
---

# API de IoT

Esta sección documenta los endpoints relacionados con sensores y lecturas IoT.

## Endpoints

### GET /iot/sensores
Obtiene la lista de sensores.

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "name": "string",
      "type": "string",
      "location": "string"
    }
  ]
}
```

### POST /iot/sensores
Crea un nuevo sensor.

**Parámetros de entrada:**
- `name`: string (requerido)
- `type`: string (requerido)
- `location`: string (opcional)

**Respuesta exitosa (201):**
```json
{
  "id": "number",
  "name": "string",
  "type": "string",
  "location": "string"
}
```

### GET /iot/lecturas
Obtiene las lecturas de sensores.

**Parámetros de consulta:**
- `sensorId`: number (opcional)
- `startDate`: string (opcional)
- `endDate`: string (opcional)

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "number",
      "sensorId": "number",
      "value": "number",
      "timestamp": "string"
    }
  ]
}
```

## Respuestas de Error
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autorizado
- `404 Not Found`: Sensor no encontrado