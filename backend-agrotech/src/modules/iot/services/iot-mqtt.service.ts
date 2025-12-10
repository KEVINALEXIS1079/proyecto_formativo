import { Injectable, Logger, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MqttClient } from 'mqtt';
import { MqttService } from '../../../common/services/mqtt.service';
import { IotGlobalConfig } from '../entities/iot-global-config.entity';
import { Sensor } from '../entities/sensor.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { IotGateway } from '../gateways/iot.gateway';

@Injectable()
export class IotMqttService implements OnModuleDestroy {
  private readonly logger = new Logger(IotMqttService.name);
  private readonly clients = new Map<number, MqttClient>();

  constructor(
    @InjectRepository(IotGlobalConfig)
    private readonly configRepo: Repository<IotGlobalConfig>,
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(TipoSensor)
    private readonly tipoSensorRepo: Repository<TipoSensor>,
    @InjectRepository(SensorLectura)
    private readonly lecturaRepo: Repository<SensorLectura>,
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => IotGateway))
    private readonly iotGateway: IotGateway,
  ) {}

  async registerConfig(config: IotGlobalConfig) {
    if (!config || !config.id) return;
    await this.connectConfig(config);
  }

  async updateConfig(config: IotGlobalConfig) {
    if (!config || !config.id) return;
    await this.closeClient(config.id);
    await this.connectConfig(config);
  }

  async onModuleDestroy() {
    for (const [configId, client] of this.clients.entries()) {
      this.logger.log(`Closing MQTT client for config ${configId}`);
      client.end(true);
    }
    this.clients.clear();
  }

  private async connectConfig(config: IotGlobalConfig) {
    const url = `${config.protocol || 'mqtt'}://${config.broker}:${config.port}`;
    this.logger.log(`Connecting to MQTT broker ${url} (config ${config.id})`);

    const client = this.mqttService.connect(
      config.broker,
      config.port,
      `agrotech-config-${config.id}`,
      {
        username: config.username,
        password: config.password,
      },
    );

    this.clients.set(config.id, client);

    client.on('connect', () => {
      this.logger.log(`Connected to broker for config ${config.id}`);
      const topics = this.buildTopics(config);
      topics.forEach((t) => {
        client.subscribe(t, (err: Error | null) => {
          if (err) {
            this.logger.error(
              `Subscription error on ${t} (config ${config.id}): ${err.message}`,
            );
          } else {
            this.logger.log(`Subscribed to ${t} (config ${config.id})`);
          }
        });
      });
    });

    client.on('message', (topic: string, payload: Buffer) => {
      this.handleDiscoveryMessage(config, topic, payload).catch((err) => {
        this.logger.error(
          `Error handling message on ${topic}: ${err.message}`,
          err.stack,
        );
      });
    });

    client.on('error', (err: Error) => {
      this.logger.error(
        `MQTT client error (config ${config.id}): ${err.message}`,
      );
    });

    client.on('close', () => {
      this.logger.warn(`MQTT client closed (config ${config.id})`);
    });
  }

  private async handleDiscoveryMessage(
    config: IotGlobalConfig,
    topic: string,
    payload: Buffer,
  ) {
    const now = new Date();
    let tipo = 'DESCONOCIDO';
    let unidad = 'N/A';
    let valor: string = payload.toString();
    let estadoConexion = 'CONECTADO';
    let estado: string | undefined;

    try {
      const json = JSON.parse(payload.toString());
      if (json.tipo) tipo = json.tipo;
      if (json.unidad) unidad = json.unidad;
      if (json.valor !== undefined) {
        if (tipo === 'BOOLEANO' && typeof json.valor === 'boolean') {
          valor = json.valor ? '1' : '0';
        } else {
          valor = String(json.valor);
        }
      }
      if (json.estado) {
        estado = json.estado;
        if (json.estado === 'DESCONECTADO') {
          estadoConexion = 'DESCONECTADO';
        } else if (json.estado === 'ACTIVO') {
          estadoConexion = 'CONECTADO';
        }
      }
    } catch (err) {
      this.logger.warn(`Non-JSON payload on ${topic}, storing raw value.`);
    }

    let tipoSensor = await this.tipoSensorRepo.findOne({
      where: { nombre: tipo },
    });
    if (!tipoSensor) {
      tipoSensor = this.tipoSensorRepo.create({
        nombre: tipo,
        unidad,
        descripcion: `Auto-creado desde topic ${topic}`,
      });
      tipoSensor = await this.tipoSensorRepo.save(tipoSensor);
    }

    let sensor = await this.sensorRepo.findOne({ where: { mqttTopic: topic } });
    if (!sensor) {
      sensor = this.sensorRepo.create({
        nombre: tipo,
        tipoSensorId: tipoSensor.id,
        protocolo: 'MQTT',
        mqttTopic: topic,
        globalConfigId: config.id,
        loteId: config.loteId,
        subLoteId: config.subLoteId,
        mqttBroker: undefined,
        mqttPort: undefined,
        mqttUsername: undefined,
        mqttPassword: undefined,
        estadoConexion: estadoConexion,
        estado: estado,
        ultimoValor: valor,
        ultimaLectura: now,
        activo: true,
      } as Partial<Sensor>);
      sensor = await this.sensorRepo.save(sensor);
      this.iotGateway.emitSensor(sensor);
    } else {
      const previousEstadoConexion = sensor.estadoConexion;
      sensor.estadoConexion = estadoConexion;
      sensor.estado = estado ?? null;
      sensor.ultimoValor = valor;
      sensor.ultimaLectura = now;
      await this.sensorRepo.save(sensor);
      if (sensor.estadoConexion !== previousEstadoConexion) {
        this.iotGateway.emitSensor(sensor);
      }
    }

    const lectura = this.lecturaRepo.create({
      sensorId: sensor.id,
      valor,
      fechaLectura: now,
    });
    await this.lecturaRepo.save(lectura);
    this.iotGateway.emitLectura(lectura);
  }

  private buildTopics(config: IotGlobalConfig): string[] {
    const prefix = config.topicPrefix || '';
    const defaults = (config.defaultTopics || []).filter((t) => t);
    const customs = (config.customTopics || []).filter((t) => t);
    return [...defaults, ...customs].map((t) => `${prefix}${t}`);
  }

  private async closeClient(configId: number) {
    const client = this.clients.get(configId);
    if (client) {
      this.logger.log(`Closing existing MQTT client for config ${configId}`);
      client.end(true);
      this.clients.delete(configId);
    }
  }
}
