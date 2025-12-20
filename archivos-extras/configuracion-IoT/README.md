# 🌡️ Configuración IoT - Sensores ESP32

Este directorio contiene el código fuente para los sensores IoT del sistema Agrotech, desarrollado en C++ para microcontroladores ESP32.

## 📁 Archivos

### `sensores.c++`
Código principal para el ESP32 que implementa:
- Conexión WiFi
- Comunicación MQTT con el broker
- Lectura de sensores (temperatura, humedad, etc.)
- Envío de datos en tiempo real al backend
- Gestión de estados y reconexión automática

## 🔧 Hardware Requerido

- **Microcontrolador**: ESP32 (cualquier variante compatible)
- **Sensores soportados**:
  - DHT11/DHT22 (Temperatura y Humedad del Aire)
  - Sensor de Humedad del Suelo
  - Sensor de Temperatura del Suelo
  - Relé para control de bomba de agua

## 📡 Configuración de Conexión

### WiFi
Edita las siguientes líneas en `sensores.c++`:
```cpp
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_CONTRASEÑA_WIFI";
```

### MQTT Broker
Configura la conexión al broker MQTT:
```cpp
const char* mqtt_server = "test.mosquitto.org";  // O tu broker personalizado
const int mqtt_port = 1883;
const char* mqtt_topic = "agrotech/lote1/sensores";
```

## 🚀 Instalación y Carga

### Requisitos de Software
- **Arduino IDE** (v2.0 o superior) o **PlatformIO**
- **Librerías necesarias**:
  - `WiFi.h` (incluida en ESP32 core)
  - `PubSubClient.h` (para MQTT)
  - `DHT.h` (para sensores DHT)
  - `ArduinoJson.h` (para serialización de datos)

### Pasos de Instalación

1. **Instalar ESP32 Board Manager**:
   - En Arduino IDE: `File → Preferences → Additional Board Manager URLs`
   - Agregar: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Ir a `Tools → Board → Boards Manager` y buscar "ESP32"

2. **Instalar Librerías**:
   ```
   Sketch → Include Library → Manage Libraries
   ```
   Buscar e instalar:
   - PubSubClient
   - DHT sensor library
   - ArduinoJson

3. **Configurar el Código**:
   - Abrir `sensores.c++` en Arduino IDE
   - Modificar credenciales WiFi y MQTT
   - Ajustar pines según tu conexión de hardware

4. **Cargar al ESP32**:
   - Conectar ESP32 por USB
   - Seleccionar el puerto correcto en `Tools → Port`
   - Seleccionar la placa en `Tools → Board → ESP32 Dev Module`
   - Presionar `Upload` (→)

## 🔌 Conexión de Pines (Ejemplo)

```
DHT22 (Temp/Humedad Aire):
  - VCC → 3.3V
  - GND → GND
  - DATA → GPIO 4

Sensor Humedad Suelo:
  - VCC → 3.3V
  - GND → GND
  - ANALOG → GPIO 34

Relé Bomba:
  - VCC → 5V
  - GND → GND
  - IN → GPIO 5
```

> ⚠️ **Nota**: Ajusta los pines según tu configuración específica en el código.

## 📊 Formato de Datos Enviados

El ESP32 envía datos en formato JSON vía MQTT:

```json
{
  "sensorId": 1,
  "temperatura": 25.5,
  "humedadAire": 65.0,
  "humedadSuelo": 45.0,
  "estadoBomba": "OFF",
  "timestamp": "2024-02-25T10:30:00Z"
}
```

## 🔄 Integración con Backend

El backend Agrotech escucha los mensajes MQTT y:
1. Valida el `sensorId` contra la base de datos
2. Almacena las lecturas en tiempo real
3. Emite eventos WebSocket a los clientes conectados
4. Genera alertas si los valores están fuera de rango

## 🐛 Debugging

Para ver los logs del ESP32:
1. Abrir `Tools → Serial Monitor` en Arduino IDE
2. Configurar baud rate a `115200`
3. Observar mensajes de conexión y envío de datos

## 📝 Personalización

### Agregar Nuevos Sensores

1. Declarar el sensor en el código:
```cpp
#include <NuevoSensor.h>
NuevoSensor miSensor(PIN);
```

2. Leer datos en el loop:
```cpp
float valor = miSensor.read();
```

3. Agregar al payload JSON:
```cpp
doc["nuevoValor"] = valor;
```

4. Registrar el nuevo tipo de sensor en el backend (tabla `tipo_sensor`)

## 🔐 Seguridad

- **Producción**: Usar broker MQTT con autenticación (usuario/contraseña)
- **TLS/SSL**: Habilitar conexión segura para datos sensibles
- **Credenciales**: No hardcodear credenciales en el código (usar EEPROM o archivos de configuración)

## 📚 Recursos Adicionales

- [Documentación ESP32](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [PubSubClient Library](https://pubsubclient.knolleary.net/)
- [DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)

## 🆘 Soporte

Para problemas con la configuración IoT:
1. Verificar conexión WiFi y MQTT broker
2. Revisar logs en Serial Monitor
3. Consultar documentación del backend en `../../backend-agrotech/README.md`
4. Revisar configuración IoT en el panel web de Agrotech

---

📌 *Código IoT para el Sistema Agrotech – SENA 2025*
