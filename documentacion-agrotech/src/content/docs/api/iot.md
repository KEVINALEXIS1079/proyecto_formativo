---
title: IoT y Sensores
description: Documentación de los endpoints del módulo de IoT
---

# API de IoT y Sensores

Gestiona la red de sensores, la telemetría y la configuración global de IoT.

## Configuración Global

### Ver Configuraciones
- **URL**: `/iot/config`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`
```json
[
  {
    "id": 1,
    "clave": "MQTT_BROKER_URL",
    "valor": "mqtt://localhost:1883",
    "descripcion": "URL del broker MQTT"
  }
]
```

### Crear Configuración Global
- **URL**: `/iot/config`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `iot.editar`

### Actualizar Configuración
- **URL**: `/iot/config/:id`
- **Método**: `PATCH`

### Eliminar Configuración
- **URL**: `/iot/config/:id`
- **Método**: `DELETE`

### Test de Conexión MQTT
Prueba la conexión con el broker MQTT.

- **URL**: `/api/v1/iot/global-configs/test-connection`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `iot.ver`

---

## Gestión de Sensores

### Listar Sensores
Muestra los sensores registrados, con filtros opcionales.

- **URL**: `/iot/sensors`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `loteId`: Filtrar por lote
- `subLoteId`: Filtrar por sublote

### Crear Sensor
Registra un nuevo sensor.

- **URL**: `/iot/sensors`
- **Método**: `POST`
- **Auth**: Requiere autenticación y permiso `iot.crear`

**Body (JSON):**
```json
{
  "codigoDispositivo": "SENSOR-001",
  "tipoSensorId": 1,
  "loteId": 2,
  "alias": "Sensor Humedad Norte",
  "configuracion": { "intervalo": 60 }
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": 20,
  "codigoDispositivo": "SENSOR-001",
  "alias": "Sensor Humedad Norte",
  "estado": "ACTIVO",
  "ultimaLectura": null
}
```

### Actualizar Sensor
- **URL**: `/iot/sensors/:id`
- **Método**: `PATCH`

### Eliminar Sensor
- **URL**: `/iot/sensors/:id`
- **Método**: `DELETE`

### Alternar Estado (Activo/Inactivo)
- **URL**: `/iot/sensors/:id/toggle`
- **Método**: `PATCH`

---

## Tipos de Sensor

### Listar Tipos
- **URL**: `/iot/sensor-types`
- **Método**: `GET`

### Crear Tipo de Sensor
- **URL**: `/iot/sensor-types`
- **Método**: `POST`

---

## Telemetría (Lecturas)

### Listar Lecturas (Histórico)
- **URL**: `/iot/lecturas`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:** `sensorId`

```json
[
  {
    "fecha": "2025-11-15T10:00:00Z",
    "valor": 45.5,
    "unidad": "%",
    "sensorId": 20
  },
  {
    "fecha": "2025-11-15T10:01:00Z",
    "valor": 45.2,
    "unidad": "%",
    "sensorId": 20
  }
]
```

### Últimas Lecturas de un Sensor
- **URL**: `/iot/sensors/:id/readings`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:** `limit` (default 100)

### Lecturas Agregadas (Gráficas)
Obtiene lecturas agrupadas por intervalo (hora, día, semana).

- **URL**: `/iot/sensors/:id/aggregated`
- **Método**: `GET`
- **Auth**: Requiere autenticación y permiso `iot.ver`

**Parámetros:**
- `from`: Fecha inicio
- `to`: Fecha fin
- `interval`: 'hour' | 'day' | 'week'
