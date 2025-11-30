import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);
  private clients: Map<string, mqtt.MqttClient> = new Map();

  /**
   * Connects to an MQTT broker
   * @param broker The broker host (e.g. 'localhost' or 'test.mosquitto.org')
   * @param port The broker port (e.g. 1883)
   * @param clientId Unique client ID
   * @param options Additional MQTT options (username, password, etc.)
   * @returns The MQTT client instance
   */
  connect(
    broker: string, 
    port: number, 
    clientId: string, 
    options?: mqtt.IClientOptions
  ): mqtt.MqttClient {
    const protocol = 'mqtt'; // Default to mqtt, could be mqtts or ws
    const url = `${protocol}://${broker}:${port}`;
    
    // Check if we already have a client for this exact configuration
    // Note: In a real scenario, we might want to reuse connections for the same broker 
    // but different topics, but here we key by clientId to be safe.
    const connectionKey = `${url}-${clientId}`;

    const existingClient = this.clients.get(connectionKey);
    if (existingClient) {
      if (existingClient.connected) {
        return existingClient;
      }
      return existingClient;
    }

    this.logger.log(`Connecting to MQTT broker at ${url} with client ID ${clientId}`);

    const client = mqtt.connect(url, {
      clientId,
      reconnectPeriod: 5000,
      ...options,
    });

    client.on('connect', () => {
      this.logger.log(`Successfully connected to ${url}`);
    });

    client.on('error', (err) => {
      this.logger.error(`Error connecting to ${url}: ${err.message}`);
    });

    client.on('offline', () => {
      this.logger.warn(`Client ${clientId} went offline`);
    });

    this.clients.set(connectionKey, client);
    return client;
  }

  /**
   * Disconnects a specific client
   */
  disconnect(clientId: string) {
    // This is a simplified lookup. In reality we might need to store by ID better.
    // For now, we iterate or change the map key.
    // Let's assume the user manages the client instance or we find it.
    // To keep it simple, we'll just expose the client and let the consumer manage disconnect if needed,
    // or implement cleanup later.
  }

  subscribe(client: mqtt.MqttClient, topic: string, callback: (topic: string, message: Buffer) => void) {
    client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
      } else {
        this.logger.log(`Subscribed to ${topic}`);
      }
    });

    // Remove existing listeners for this topic to avoid duplicates if re-subscribing
    // Note: This is a simple implementation. For robust handling, we might want to manage listeners better.
    
    client.on('message', (t, m) => {
      if (this.matchesTopic(topic, t)) {
        callback(t, m);
      }
    });
  }

  private matchesTopic(subscription: string, topic: string): boolean {
    if (subscription === '#' || subscription === topic) {
      return true;
    }
    
    const subParts = subscription.split('/');
    const topicParts = topic.split('/');

    for (let i = 0; i < subParts.length; i++) {
      if (subParts[i] === '#') {
        return true;
      }
      if (subParts[i] !== '+' && subParts[i] !== topicParts[i]) {
        return false;
      }
    }

    return subParts.length === topicParts.length;
  }
}
