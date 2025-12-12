# Configuración IoT (ESP32)

Este directorio contiene el código fuente en C++ para los microcontroladores **ESP32** utilizados en el sistema Agrotech.

## Archivos

-   `sensores.c++`: Código principal para leer sensores (DHT11/22, Humedad de Suelo) y enviar datos vía MQTT.

## Requisitos

-   IDE de Arduino o PlatformIO.
-   Librerias: `PubSubClient` (MQTT), `DHT sensor library`.

## Configuración

1.  Abrir el archivo.
2.  Configurar las credenciales Wi-Fi (`SSID`, `PASSWORD`).
3.  Configurar la IP del Broker MQTT (`MQTT_SERVER`).
4.  Subir el código a la placa ESP32.
