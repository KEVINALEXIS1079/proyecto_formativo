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

### Contexto de Alerta
Obtiene detalles del entorno cuando ocurrió una alerta.

- **URL**: `/iot/alerts/:id/context`
- **Método**: `GET`
