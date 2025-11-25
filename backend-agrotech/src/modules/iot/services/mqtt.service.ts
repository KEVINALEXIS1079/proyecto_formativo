import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { IotGateway } from '../gateways/iot.gateway';
import { Sensor } from '../entities/sensor.entity';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private clients: Map<string, mqtt.MqttClient> = new Map();
  private sensorTopicMap: Map<string, number> = new Map(); // topic -> sensorId
  private sensors: Sensor[] = [];

  constructor(
    @Inject(forwardRef(() => IotGateway))
    private readonly iotGateway: IotGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing MQTT service...');

    // Initialize MQTT connections - for now, we'll initialize with empty sensors
    // In a real implementation, you might want to load sensors from database here
    // But to avoid circular dependencies, we'll initialize empty and add sensors dynamically

    // Listen for MQTT readings from handleMessage
    this.iotGateway.server.on('mqttReading', async (data: { sensorId: number; valor: number; fechaLectura: Date; protocolo: string }) => {
      // Emit to gateway for processing
      this.iotGateway.server.emit('processMqttReading', data);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down MQTT service...');
    for (const [broker, client] of this.clients) {
      client.end();
      this.logger.log(`Disconnected from MQTT broker: ${broker}`);
    }
  }

  private async initializeMqttConnections() {
    const mqttSensors = this.sensors.filter((sensor: Sensor) => sensor.protocolo === 'MQTT' && sensor.mqttBroker);

    for (const sensor of mqttSensors) {
      await this.connectAndSubscribe(sensor);
    }
  }

  private async connectAndSubscribe(sensor: Sensor) {
    const brokerKey = `${sensor.mqttBroker}:${sensor.mqttPort || 1883}`;

    if (!this.clients.has(brokerKey)) {
      const options: mqtt.IClientOptions = {
        host: sensor.mqttBroker,
        port: sensor.mqttPort || 1883,
        username: sensor.mqttUsername || undefined,
        password: sensor.mqttPassword || undefined,
        reconnectPeriod: 5000, // Reconnect every 5 seconds
        connectTimeout: 30000,
      };

      const client = mqtt.connect(options);

      client.on('connect', () => {
        this.logger.log(`Connected to MQTT broker: ${brokerKey}`);
      });

      client.on('error', (error) => {
        this.logger.error(`MQTT connection error for ${brokerKey}:`, error);
      });

      client.on('reconnect', () => {
        this.logger.log(`Reconnecting to MQTT broker: ${brokerKey}`);
      });

      client.on('offline', () => {
        this.logger.warn(`MQTT client offline for ${brokerKey}`);
      });

      this.clients.set(brokerKey, client);
    }

    const client = this.clients.get(brokerKey);
    if (client && sensor.mqttTopic) {
      client.subscribe(sensor.mqttTopic, { qos: Math.min(Math.max(sensor.mqttQos || 0, 0), 2) as any }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to topic ${sensor.mqttTopic}:`, err);
        } else {
          this.logger.log(`Subscribed to topic: ${sensor.mqttTopic} for sensor ${sensor.id}`);
          this.sensorTopicMap.set(sensor.mqttTopic, sensor.id);
        }
      });

      client.on('message', async (topic, message) => {
        await this.handleMessage(topic, message);
      });
    }
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      const sensorId = this.sensorTopicMap.get(topic);
      if (!sensorId) {
        this.logger.warn(`Received message on unknown topic: ${topic}`);
        return;
      }

      const payload = JSON.parse(message.toString());
      const valor = payload.valor || payload.value || payload.data;

      if (typeof valor !== 'number') {
        this.logger.warn(`Invalid valor in MQTT message for topic ${topic}: ${valor}`);
        return;
      }

      // Emit event for IotService to handle
      this.iotGateway.server.emit('mqttReading', {
        sensorId,
        valor,
        fechaLectura: new Date(),
        protocolo: 'MQTT'
      });

      this.logger.debug(`Processed MQTT reading for sensor ${sensorId}: ${valor}`);
    } catch (error) {
      this.logger.error(`Error processing MQTT message on topic ${topic}:`, error);
    }
  }

  // Method to set all sensors (called by IotService)
  async setSensors(sensors: Sensor[]) {
    this.sensors = sensors;
    await this.initializeMqttConnections();
  }

  // Method to add a new sensor dynamically
  async addSensor(sensor: Sensor) {
    if (sensor.protocolo === 'MQTT' && sensor.mqttBroker) {
      await this.connectAndSubscribe(sensor);
    }
  }

  // Method to remove a sensor
  async removeSensor(sensor: Sensor) {
    if (sensor.mqttTopic) {
      this.sensorTopicMap.delete(sensor.mqttTopic);
      // Note: We don't disconnect clients as other sensors might use the same broker
    }
  }
}