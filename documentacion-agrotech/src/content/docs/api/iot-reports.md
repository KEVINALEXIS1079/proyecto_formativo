---
title: Reportes IoT
description: Documentación de los endpoints de reportes y análisis IoT
---

# API de Reportes IoT

Endpoints dedicados al análisis de datos de sensores y reportes históricos.

## Reportes Generales

### Reporte General
Obtiene un resumen de métricas en un rango de fechas.

- **URL**: `/api/v1/iot/reports/general` (o `/iot/general-report` en versiones anteriores)
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `loteId`: ID del lote
- `sensorId`: ID del sensor
- `startDate`: Fecha inicio (ISO 8601)
- `endDate`: Fecha fin (ISO 8601)

**Respuesta Exitosa (200 OK):**
```json
{
  "resumen": {
    "temperaturaPromedio": 24.5,
    "humedadPromedio": 60.2,
    "totalAlertas": 3
  },
  "grafica": [
    { "fecha": "2025-10-01", "valor": 24.0 },
    { "fecha": "2025-10-02", "valor": 25.0 }
  ]
}
```

### Comparativa de Lotes
Compara el rendimiento o métricas entre diferentes lotes.

- **URL**: `/api/v1/iot/comparison` (o `/iot/comparison`)
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `loteIds`: Lista de IDs separados por coma (ej: `1,2,3`)
- `tipoSensorId`: ID del tipo de sensor a comparar
- `startDate`: Fecha inicio
- `endDate`: Fecha fin

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "loteId": 1,
    "loteNombre": "Lote Norte",
    "promedio": 24.5
  },
  {
    "loteId": 2,
    "loteNombre": "Lote Sur",
    "promedio": 26.1
  }
]
```

---

## Analítica por Lote

### Analítica Detallada
Provee análisis estadístico (min, max, promedio) para un lote.

- **URL**: `/api/v1/iot/analytics/lot`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `loteId`: ID del lote (Requerido)
- `subLoteId`: ID del sublote (Opcional)
- `sensorId`: ID del sensor específico (Opcional)
- `startDate`: Fecha inicio
- `endDate`: Fecha fin

**Respuesta Exitosa (200 OK):**
```json
{
  "loteId": 1,
  "metricas": {
    "temperatura": { "min": 18, "max": 30, "avg": 24 },
    "humedad": { "min": 40, "max": 80, "avg": 60 }
  }
}
```

---

## Alertas

### Listar Alertas
Obtiene el historial de alertas generadas por sensores fuera de rango.

- **URL**: `/iot/alerts`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `sensorId`
- `loteId`
- `from`
- `to`

**Respuesta Exitosa (200 OK):**
```json
[
  {
    "id": 10,
    "sensorId": 5,
    "tipo": "TEMPERATURA_ALTA",
    "valor": 35.5,
    "mensaje": "Temperatura crítica detectada",
    "fecha": "2025-11-20T14:30:00Z"
  }
]
```

### Contexto de Alerta
Obtiene detalles del entorno cuando ocurrió una alerta.

- **URL**: `/iot/alerts/:id/context`
- **Método**: `GET`
