#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <WiFiManager.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


// ===================
// CONFIGURACIÓN PANTALLA OLED
// ===================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_SDA 21
#define OLED_SCL 22


Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);


// ===================
// CONFIGURACIÓN PINES SENSORES
// ===================
#define DHT_PIN 4       // Sensor DHT22
#define SOIL_PIN A0     // Sensor Humedad suelo (GPIO 36/VP en muchos ESP32)
#define BOMBA_PIN 5     // Bomba


// ===================
// CALIBRACIÓN
// ===================
const int VALOR_SECO   = 4095;
const int VALOR_MOJADO = 1200;


// ===================
// CONFIGURACIÓN MQTT
// ===================
const char* mqtt_server = "test.mosquitto.org";
const int   mqtt_port   = 1883;


// Temas de Datos (JSON)
const char* topic_temp        = "agrotech/temperatura";
const char* topic_humAire     = "agrotech/humedadAire";
const char* topic_humSuelo    = "agrotech/humedadSuelo";
const char* topic_estadoBomba = "agrotech/estadoBomba";


// Temas de Estado (salud del sistema)
const char* topic_status_dht   = "agrotech/status/dht";
const char* topic_status_suelo = "agrotech/status/suelo";


WiFiClient espClient;
PubSubClient client(espClient);
DHTesp dht;


// ===================
// VARIABLES GLOBALES
// ===================
float temperatura    = 0;
float humedadAire    = 0;
float humedadSuelo   = 0;
bool  bombaEncendida = false;


// Estado de sensores
String estadoDHT   = "INICIANDO";
String estadoSuelo = "INICIANDO";


// Para detectar desconexión del sensor de suelo
int lecturasInvalidasSuelo = 0;
const int MAX_LECTURAS_INVALIDAS_SUELO = 5;


unsigned long ultimoEnvio  = 0;
const long intervalo       = 3000; // 3 segundos


// ===================
// FUNCIONES AUXILIARES
// ===================
float filtrarLectura(float anterior, float nueva, float factor = 0.35) {
  if (isnan(nueva)) return anterior;
  return anterior + (nueva - anterior) * factor;
}


// Publicar lectura de sensor como JSON
void publicarLecturaSensor(
  const char* topic,       // ej: "agrotech/temperatura"
  const char* tipo,        // ej: "TEMPERATURA"
  const char* unidad,      // ej: "C" o "%"
  float valor,             // ej: 23.5
  const String& estado     // "ACTIVO" o "DESCONECTADO"
) {
  char payload[128];


  if (estado == "ACTIVO") {
    // Con valor numérico
    snprintf(payload, sizeof(payload),
      "{\"tipo\":\"%s\",\"unidad\":\"%s\",\"valor\":%.2f,\"estado\":\"%s\"}",
      tipo, unidad, valor, estado.c_str()
    );
  } else {
    // Sin valor (sensor desconectado)
    snprintf(payload, sizeof(payload),
      "{\"tipo\":\"%s\",\"unidad\":\"%s\",\"estado\":\"%s\"}",
      tipo, unidad, estado.c_str()
    );
  }


  client.publish(topic, payload);
}


// Publicar estado de la bomba como JSON (valor 1/0)
void publicarEstadoBombaJSON() {
  if (!client.connected()) return;


  char payload[128];
  int valorBomba = bombaEncendida ? 1 : 0;   // 1 = prendido, 0 = apagado


  // Compartimos el mismo estado del sensor de suelo
  snprintf(payload, sizeof(payload),
    "{\"tipo\":\"BOOLEANO\",\"valor\":%d,\"estado\":\"%s\"}",
    valorBomba,
    estadoSuelo.c_str()
  );


  client.publish(topic_estadoBomba, payload);
}


// ===================
// PANTALLA OLED (CON BORDES)
// ===================
void actualizarPantalla() {
  // Fondo blanco
  display.clearDisplay();
  display.fillScreen(SSD1306_WHITE);


  // MARCO EXTERIOR (negro)
  display.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SSD1306_BLACK);


  // HEADER (barra superior negra con texto blanco)
  display.fillRect(1, 1, SCREEN_WIDTH - 2, 10, SSD1306_BLACK);
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 3);
  display.println(F("AGROTECH - ESP32"));


  // A partir de aquí, texto negro sobre fondo blanco
  display.setTextColor(SSD1306_BLACK);


  // Caja DHT
  display.drawRect(1, 13, SCREEN_WIDTH - 2, 12, SSD1306_BLACK);
  display.setCursor(4, 16);
  if (estadoDHT != "ACTIVO") {
    display.print(F("DHT: DESC."));
  } else {
    display.print(F("T: "));
    display.print(temperatura, 1);
    display.print(F("C "));
    display.print(F("H: "));
    display.print(humedadAire, 0);
    display.print(F("%"));
  }


  // Caja Humedad Suelo
  display.drawRect(1, 26, SCREEN_WIDTH - 2, 12, SSD1306_BLACK);
  display.setCursor(4, 29);
  if (estadoSuelo != "ACTIVO") {
    display.print(F("Suelo: DESC."));
  } else {
    display.print(F("Suelo: "));
    display.print(humedadSuelo, 1);
    display.print(F("%"));
  }


  // Caja Bomba + WiFi
  display.drawRect(1, 39, SCREEN_WIDTH - 2, 12, SSD1306_BLACK);
  display.setCursor(4, 42);
  display.print(F("Bomba: "));


  if (bombaEncendida) {
    // Resaltamos ENCENDIDA con una pastilla negra y texto blanco
    int xEtiqueta = 50;
    int yEtiqueta = 40;
    int wEtiqueta = 60;
    int hEtiqueta = 14;


    display.fillRect(xEtiqueta, yEtiqueta, wEtiqueta, hEtiqueta, SSD1306_BLACK);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(xEtiqueta + 2, yEtiqueta + 3);
    display.print(F("ENCENDIDA"));
    display.setTextColor(SSD1306_BLACK); // volver a negro para lo demás
  } else {
    display.print(F("APAGADA"));
  }


  // Icono WiFi (esquina derecha de esta caja)
  display.setCursor(100, 42);
  if (WiFi.status() == WL_CONNECTED) {
    display.print(F("(W)"));
  } else {
    display.print(F("(X)"));
  }


  display.display();
}




// ===================
// CONEXIÓN MQTT
// ===================
void reconnectMQTT() {
  if (client.connected()) return;


  String clientId = "ESP32-Agro-" + String(random(0xffff), HEX);
  if (client.connect(clientId.c_str())) {
    Serial.println("\n[MQTT] Conectado ✅");
    client.publish("agrotech/conexion", "EN LINEA");
  } else {
    Serial.print("[MQTT] Fallo, rc=");
    Serial.println(client.state());
  }
}


// ===================
// CONTROL BOMBA
// ===================
void controlarBomba() {
  // Seguridad: si el sensor de suelo está desconectado, no regamos
  if (estadoSuelo != "ACTIVO") {
    if (bombaEncendida) {
      digitalWrite(BOMBA_PIN, LOW);
      bombaEncendida = false;
      Serial.println(">>> Sensor suelo DESCONECTADO - Bomba OFF por seguridad <<<");
    }
    return;
  }


  // Solo controlamos la bomba si el sensor de suelo está funcionando
  if (humedadSuelo < 20 && !bombaEncendida) {
    digitalWrite(BOMBA_PIN, HIGH);
    bombaEncendida = true;
    Serial.println(">>> ALERTA: SUELO SECO - Bomba ON <<<");
  }
  else if (humedadSuelo > 25 && bombaEncendida) {
    digitalWrite(BOMBA_PIN, LOW);
    bombaEncendida = false;
    Serial.println(">>> RIEGO FINALIZADO - Bomba OFF <<<");
  }
}


// ===================
// LECTURA SENSORES CON DETECCIÓN DE ERRORES
// ===================
void leerSensores() {
  // 1. LECTURA DHT22
  TempAndHumidity data = dht.getTempAndHumidity();
 
  if (dht.getStatus() == DHTesp::ERROR_NONE) {
    estadoDHT = "ACTIVO";
    float t = data.temperature;


    // Conversión simple si da lectura errónea muy alta (bug común en algunas libs)
    if (t > 60 && t < 200) {
      t = (t - 32) * 5.0 / 9.0;
    }
   
    temperatura = filtrarLectura(temperatura, t);
    humedadAire = filtrarLectura(humedadAire, data.humidity);
  } else {
    estadoDHT = "DESCONECTADO";
    Serial.println("Error: Sensor DHT no responde o desconectado");
  }


  // 2. LECTURA SUELO
  int crudo = analogRead(SOIL_PIN);


  // Desconectado típico: lectura clavada en 0 o muy cercana al máximo (sensor al aire)
  bool posibleDesconectado = (crudo == 0 || crudo >= 4045);


  if (posibleDesconectado) {
    lecturasInvalidasSuelo++;
  } else {
    lecturasInvalidasSuelo = 0;
  }


  if (lecturasInvalidasSuelo >= MAX_LECTURAS_INVALIDAS_SUELO) {
    estadoSuelo = "DESCONECTADO";
    // Puedes dejar la última lectura válida de humedadSuelo
    // o poner un valor fijo si quieres:
    // humedadSuelo = 0;
  } else {
    estadoSuelo = "ACTIVO";
    int porcentaje = map(crudo, VALOR_SECO, VALOR_MOJADO, 0, 100);
    porcentaje = constrain(porcentaje, 0, 100);
    humedadSuelo = filtrarLectura(humedadSuelo, porcentaje);
  }


  // DEBUG
  Serial.printf("T:%.1f | HumA:%.1f | Suelo:%.1f%% | Bomba:%s | DHT:%s | SueloEstado:%s | crudo:%d\n",
                temperatura, humedadAire, humedadSuelo,
                bombaEncendida ? "ON" : "OFF",
                estadoDHT.c_str(), estadoSuelo.c_str(), crudo);
}


// ===================
// ENVÍO DE DATOS MQTT (JSON)
// ===================
void enviarDatos() {
  if (!client.connected()) return;


  // Temperatura (°C)
  publicarLecturaSensor(
    topic_temp,
    "TEMPERATURA",
    "C",
    temperatura,
    estadoDHT
  );


  // Humedad del aire (%)
  publicarLecturaSensor(
    topic_humAire,
    "HUMEDAD_AIRE",
    "%",
    humedadAire,
    estadoDHT
  );


  // Humedad del suelo (%)
  publicarLecturaSensor(
    topic_humSuelo,
    "HUMEDAD_SUELO",
    "%",
    humedadSuelo,
    estadoSuelo
  );


  // Estado de la bomba (JSON con valor 1/0)
  publicarEstadoBombaJSON();


  // Estado de sensores en topics separados
  client.publish(topic_status_dht, estadoDHT.c_str());
  client.publish(topic_status_suelo, estadoSuelo.c_str());
}


// ===================
// SETUP
// ===================
void setup() {
  Serial.begin(115200);
 
  // INICIO OLED
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
       Serial.println(F("Fallo OLED"));
    }
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println(F("Iniciando Sistema..."));
  display.display();


  // PINES
  pinMode(SOIL_PIN, INPUT);
  pinMode(BOMBA_PIN, OUTPUT);
  digitalWrite(BOMBA_PIN, LOW);


  // DHT
  dht.setup(DHT_PIN, DHTesp::DHT22);


  // WIFI (WiFiManager crea AP si no hay credenciales)
  WiFiManager wifiManager;
  wifiManager.autoConnect("AgroTech_AP");


  // MQTT
  client.setServer(mqtt_server, mqtt_port);
 
  display.clearDisplay();
  display.setCursor(0,0);
  display.println(F("Sistema Listo"));
  display.display();
}


// ===================
// LOOP
// ===================
void loop() {
  reconnectMQTT();  
  client.loop();    


  unsigned long ahora = millis();
  if (ahora - ultimoEnvio >= intervalo) {
    ultimoEnvio = ahora;


    leerSensores();     // Lee y verifica errores (DHT + suelo)
    controlarBomba();   // Decide si encender/apagar la bomba
    enviarDatos();      // Envía JSON + estados
    actualizarPantalla();
  }
}


