import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import { Sensor } from '../entities/sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { SensorAlerta, AlertaTipo } from '../entities/sensor-alert.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { IotGlobalConfig } from '../entities/iot-global-config.entity';
import { CreateSensorDto } from '../dtos/create-sensor.dto';
import { UpdateSensorDto } from '../dtos/update-sensor.dto';
import { CreateSensorLecturaDto } from '../dtos/create-sensor-lectura.dto';
import { IotGateway } from '../gateways/iot.gateway';
import { MqttService } from '../../../common/services/mqtt.service';
import { ProtocoloSensor } from '../dtos/create-sensor.dto';
import { Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { GeoService } from '../../geo/services/geo.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { MqttClient } from 'mqtt';

@Injectable()
export class IotService implements OnModuleInit {
  private sensorClients: Map<number, MqttClient> = new Map();
  private globalClients: Map<number, MqttClient> = new Map();

  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura)
    private lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(SensorAlerta)
    private alertaRepo: Repository<SensorAlerta>,
    @InjectRepository(TipoSensor)
    private tipoSensorRepo: Repository<TipoSensor>,
    @InjectRepository(IotGlobalConfig)
    private configRepo: Repository<IotGlobalConfig>,
    private mqttService: MqttService,
    @Inject(forwardRef(() => IotGateway))
    private iotGateway: IotGateway,
    private geoService: GeoService,
  ) {}

  async onModuleInit() {
    // 1. Connect to existing sensors
    const sensors = await this.sensorRepo.find({ where: { activo: true } });
    for (const sensor of sensors) {
      if (sensor.protocolo === ProtocoloSensor.MQTT) {
        this.connectToMqttSensor(sensor);
      }
    }

    // 2. Connect to Global Discovery
    await this.connectToGlobalDiscovery();
  }

  // ==================== CRON JOBS ====================

  @Cron('*/5 * * * * *')
  async checkSensorConnections() {
    const now = new Date();
    // Only check active sensors
    const sensores = await this.sensorRepo.find({
      where: { activo: true },
      relations: ['tipoSensor'],
    });

    for (const sensor of sensores) {
      // Skip if no lastSeenAt or no TTL defined (for non-global config sensors)
      if (
        !sensor.lastSeenAt ||
        (!sensor.tipoSensor?.ttlMinutos && !sensor.globalConfigId)
      )
        continue;

      const ttlMs = sensor.globalConfigId
        ? 5_000
        : sensor.tipoSensor.ttlMinutos * 60_000;
      const limite = sensor.lastSeenAt.getTime() + ttlMs;

      if (now.getTime() > limite) {
        if (sensor.estadoConexion !== 'DESCONECTADO') {
          console.log(
            `[IoT] Sensor ${sensor.id} marked as DISCONNECTED (TTL expired)`,
          );
          sensor.estadoConexion = 'DESCONECTADO';
          await this.sensorRepo.save(sensor);
          this.iotGateway.emitSensor(sensor);
        }
      }
    }
  }

  // ==================== HELPER METHODS ====================

  async mapTopicToTipoSensor(topic: string): Promise<TipoSensor | null> {
    const normalized = topic.trim().toLowerCase();
    let typeName = 'GENÉRICO';

    if (
      ['temp', 'temperatura', 'temperatura_aire'].some((k) =>
        normalized.includes(k),
      )
    ) {
      typeName = 'TEMPERATURA_AIRE';
    } else if (
      ['humedad', 'humedad_aire', 'humedadaire'].some((k) =>
        normalized.includes(k),
      )
    ) {
      typeName = 'HUMEDAD_AIRE';
    } else if (
      ['humedad_suelo', 'humedadsuelo', 'suelo'].some((k) =>
        normalized.includes(k),
      )
    ) {
      typeName = 'HUMEDAD_SUELO';
    } else if (
      ['bomba', 'estado_bomba', 'relay_bomba'].some((k) =>
        normalized.includes(k),
      )
    ) {
      typeName = 'ESTADO_BOMBA';
    }

    return this.tipoSensorRepo.findOne({ where: { nombre: typeName } });
  }

  // ==================== GLOBAL CONFIG & DISCOVERY ====================

  async getGlobalConfigs() {
    return this.configRepo.find({ order: { id: 'ASC' } });
  }

  async getGlobalConfig(id?: number) {
    if (id) {
      return this.configRepo.findOne({ where: { id } });
    }
    // Fallback to first config or default
    const configs = await this.configRepo.find({ take: 1 });
    if (configs.length > 0) return configs[0];

    // Return default empty config if not found
    return {
      name: 'Default',
      broker: '',
      port: 1883,
      protocol: 'mqtt',
      loteId: null,
      subLoteId: null,
      topicPrefix: 'agrotech/',
      defaultTopics: [],
      customTopics: [],
      username: '',
      password: '',
    };
  }

  async createGlobalConfig(data: Partial<IotGlobalConfig>) {
    const config = this.configRepo.create(data);
    const saved = await this.configRepo.save(config);
    await this.connectToGlobalDiscovery(saved);
    return saved;
  }

  async updateGlobalConfig(id: number, data: Partial<IotGlobalConfig>) {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Config ${id} not found`);

    Object.assign(config, data);
    const saved = await this.configRepo.save(config);

    // Reconnect discovery for this config
    await this.connectToGlobalDiscovery(saved);

    // Reconnect sensors linked to this config
    const linkedSensors = await this.sensorRepo.find({
      where: { globalConfigId: id, protocolo: ProtocoloSensor.MQTT },
    });

    console.log(
      `[IoT] Reconnecting ${linkedSensors.length} sensors linked to Config ${id}...`,
    );
    for (const sensor of linkedSensors) {
      await this.connectToMqttSensor(sensor);
    }

    return saved;
  }

  async deleteGlobalConfig(id: number) {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Config ${id} not found`);

    // Manually delete dependencies to ensure clean removal regardless of DB constraints
    const linkedSensors = await this.sensorRepo.find({
      where: { globalConfigId: id },
      withDeleted: true 
    });

    if (linkedSensors.length > 0) {
      const sensorIds = linkedSensors.map(s => s.id);
      console.log(`[IoT] Deleting ${linkedSensors.length} sensors linked to Global Config ${id}`);
      
      // Delete readings and alerts first (if DB cascade fails)
      await this.lecturaRepo.delete({ sensorId: In(sensorIds) } as any); // Cast to any if needed or use FindOptions
      await this.alertaRepo.delete({ sensorId: In(sensorIds) } as any);
      
      // Delete sensors
      await this.sensorRepo.remove(linkedSensors);
    }

    // Stop the Global Discovery Client so it stops spawning zombies
    if (this.globalClients.has(id)) {
        console.log(`[IoT] Stopping Discovery Client for Deleted Config ${id}`);
        const client = this.globalClients.get(id);
        if (client) client.end();
        this.globalClients.delete(id);
    }

    return this.configRepo.remove(config);
  }

  async connectToGlobalDiscovery(config?: IotGlobalConfig) {
    if (!config) {
      // Connect all configs
      const configs = await this.configRepo.find();
      for (const c of configs) {
        await this.connectToGlobalDiscovery(c);
      }
      return;
    }

    if (!config.broker) return;

    // Disconnect existing client if any
    if (this.globalClients.has(config.id)) {
        console.log(`[IoT] Disconnecting existing Global Client for Config ${config.id}`);
        const existing = this.globalClients.get(config.id);
        if (existing) existing.end();
        this.globalClients.delete(config.id);
    }

    console.log(
      `[IoT] Connecting to Global Broker: ${config.broker} (${config.name})`,
    );

    const client = this.mqttService.connect(
      config.broker,
      config.port,
      `agrotech-server-discovery-${config.id}`, // Unique CLIENT ID to avoid conflicts
      {
        username: config.username,
        password: config.password,
      },
    );

    this.globalClients.set(config.id, client);

    // Subscribe to Default Topics
    if (config.defaultTopics) {
      for (const topic of config.defaultTopics) {
        const fullTopic = `${config.topicPrefix}${topic}`;
        this.mqttService.subscribe(client, fullTopic, (t, m) =>
          this.handleDiscoveryMessage(t, m, config),
        );
      }
    }

    // Subscribe to Custom Topics
    if (config.customTopics) {
      for (const topic of config.customTopics) {
        const fullTopic = `${config.topicPrefix}${topic}`;
        this.mqttService.subscribe(client, fullTopic, (t, m) =>
          this.handleDiscoveryMessage(t, m, config),
        );
      }
    }
  }

  private async handleDiscoveryMessage(
    topic: string,
    message: Buffer,
    config: IotGlobalConfig,
  ) {
    try {
      // 1. Check if sensor exists for this topic
      let sensor = await this.sensorRepo.findOne({
        where: { mqttTopic: topic },
      });

      // 2. If not, create it automatically
      if (!sensor) {
        console.log(`[IoT] Auto-discovering new sensor for topic: ${topic}`);

        let tipoNombre = 'Desconocido';
        let unidad = 'N/A';
        let estado = 'CONECTADO';

        // Try to parse JSON to get Type and Unit
        try {
          const payload = message.toString();
          const json = JSON.parse(payload);
          if (json.tipo) tipoNombre = json.tipo;
          if (json.unidad) unidad = json.unidad;
          if (json.estado)
            estado = json.estado === 'ACTIVO' ? 'CONECTADO' : json.estado;
        } catch (e) {
          // Fallback to topic name if not JSON
          tipoNombre = topic.replace(config.topicPrefix, '');
        }

        // Find or create TipoSensor
        let tipoSensor = await this.tipoSensorRepo.findOne({
          where: { nombre: tipoNombre },
        });

        if (!tipoSensor) {
          console.log(
            `[IoT] TipoSensor "${tipoNombre}" not found, creating it...`,
          );
          tipoSensor = this.tipoSensorRepo.create({
            nombre: tipoNombre,
            unidad: unidad,
            descripcion: `Auto-creado desde tópico ${topic}`,
          });
          tipoSensor = await this.tipoSensorRepo.save(tipoSensor);
        }

        // Create Sensor linked to Global Config
        sensor = this.sensorRepo.create({
          nombre: tipoNombre, // Use Type name as Sensor Name by default
          tipoSensorId: tipoSensor.id,
          protocolo: ProtocoloSensor.MQTT,
          mqttTopic: topic,
          // Inherit from Global Config
          globalConfigId: config.id,
          loteId: config.loteId,
          subLoteId: config.subLoteId,

          activo: true,
          estadoConexion: estado,
          creadoPorUsuarioId: 1, // System
        } as Partial<Sensor>);

        sensor = await this.sensorRepo.save(sensor);
        console.log(
          `[IoT] Sensor created: ${sensor.nombre} (ID: ${sensor.id}) linked to Config ${config.id}`,
        );
      }

      // 3. Process the message (save reading)
      await this.handleMqttMessage(sensor, message);
    } catch (err) {
      console.error(`[IoT] Error in auto-discovery for topic ${topic}:`, err);
    }
  }

  async connectToMqttSensor(sensor: Sensor) {
    if (!sensor.globalConfigId) {
      console.warn(
        `[IoT] Sensor ${sensor.id} has no Global Config linked. Cannot connect.`,
      );
      return;
    }

    const globalConfig = await this.configRepo.findOne({
      where: { id: sensor.globalConfigId },
    });

    if (!globalConfig || !globalConfig.broker) {
      console.warn(
        `[IoT] Global Config ${sensor.globalConfigId} not found or missing broker url.`,
      );
      return;
    }

    if (!sensor.mqttTopic) {
      console.warn(`[IoT] Sensor ${sensor.id} missing mqttTopic.`);
      return;
    }

    // Construct full topic if needed, or assume mqttTopic is the full topic?
    // The requirement says: "mqttTopic (SOLO la parte final del topic (sin topicPrefix))"
    // So we must prepend the prefix from global config.
    const fullTopic = `${globalConfig.topicPrefix || ''}${sensor.mqttTopic}`;

    // Close previous client (if any) to avoid staying connected to old broker/config
    this.disconnectSensorClient(sensor.id);

    const client = this.mqttService.connect(
      globalConfig.broker,
      globalConfig.port,
      `sensor-${sensor.id}`,
      {
        username: globalConfig.username || undefined,
        password: globalConfig.password || undefined,
      },
    );

    this.sensorClients.set(sensor.id, client);

    this.mqttService.subscribe(client, fullTopic, (topic, message) => {
      this.handleMqttMessage(sensor, message);
    });
  }

  private disconnectSensorClient(sensorId: number) {
    const existing = this.sensorClients.get(sensorId);
    if (existing) {
      existing.end(true);
      this.sensorClients.delete(sensorId);
    }
  }

  private async handleMqttMessage(sensor: Sensor, message: Buffer) {
    try {
      // Refrescar sensor desde DB por si fue eliminado mientras el cliente sigue conectado
      const currentSensor = await this.sensorRepo.findOne({
        where: { id: sensor.id },
        relations: ['tipoSensor'],
      });
      if (!currentSensor) {
        console.warn(
          `[MQTT] Sensor ${sensor.id} no existe (quizá fue eliminado). Ignorando mensaje.`,
        );
        return;
      }
      sensor = currentSensor;

      const payload = message.toString();
      // console.log(`[MQTT] Sensor ${sensor.id} (${sensor.nombre}) received:`, payload);

      let valor: any = payload;
      let estadoConexion = 'CONECTADO';
      let estado: string | undefined;
      let unidad = '';

      try {
        const json = JSON.parse(payload);

        // 1. Extract Data
        const tipoNombre = json.tipo;
        unidad = json.unidad;
        const valorJson = json.valor;
        const estadoJson = json.estado;

        if (valorJson !== undefined) valor = valorJson;
        if (estadoJson) {
          estado = estadoJson;
          estadoConexion =
            estadoJson === 'ACTIVO' ? 'CONECTADO' : 'DESCONECTADO';
        }

        // 2. Dynamic Type Handling
        if (tipoNombre) {
          // Check if sensor needs type update or type creation
          let tipoSensor = await this.tipoSensorRepo.findOne({
            where: { nombre: tipoNombre },
          });

          if (!tipoSensor) {
            console.log(
              `[IoT] Creating new TipoSensor: ${tipoNombre} (${unidad || ''})`,
            );
            tipoSensor = this.tipoSensorRepo.create({
              nombre: tipoNombre,
              unidad: unidad || 'N/A',
              descripcion: `Auto-generated from MQTT: ${tipoNombre}`,
            });
            tipoSensor = await this.tipoSensorRepo.save(tipoSensor);
          }

          // Link sensor to type if not linked or different
          if (!sensor.tipoSensorId || sensor.tipoSensorId !== tipoSensor.id) {
            console.log(
              `[IoT] Linking Sensor ${sensor.id} to TipoSensor ${tipoSensor.nombre}`,
            );
            sensor.tipoSensorId = tipoSensor.id;
            sensor.tipoSensor = tipoSensor; // Update relation for current scope
            await this.sensorRepo.save(sensor);
          }
        }
      } catch (e) {
        // Not JSON, keep as string/raw value
        // console.log('[MQTT] Payload is not JSON, using raw value');
      }

      // Convert to string for storage
      const valorString = String(valor);

      // 3. Save Reading
      await this.createLectura(
        {
          sensorId: sensor.id,
          valor: valorString,
          fechaLectura: new Date(),
        },
        this.iotGateway,
      );

      // 4. Update Status (Override createLectura's status update if we have explicit state)
      let changed = false;
      if (sensor.estadoConexion !== estadoConexion) {
        sensor.estadoConexion = estadoConexion;
        changed = true;
      }
      if (sensor.estado !== (estado ?? null)) {
        sensor.estado = estado ?? null;
        changed = true;
      }

      // Update lastSeenAt
      sensor.lastSeenAt = new Date();
      sensor.ultimoValor = valorString;

      // Always save and emit since lastSeenAt and ultimoValor changed, ensuring real-time updates
      await this.sensorRepo.save(sensor);
      this.iotGateway.emitSensor(sensor);
    } catch (err) {
      console.error(`Error handling MQTT message for sensor ${sensor.id}`, err);
    }
  }

  // ==================== TIPO SENSOR ====================

  async findAllTiposSensor() {
    return this.tipoSensorRepo.find();
  }

  async createTipoSensor(data: {
    nombre: string;
    unidad: string;
    descripcion?: string;
  }) {
    const tipo = this.tipoSensorRepo.create(data);
    return this.tipoSensorRepo.save(tipo);
  }

  async findTipoSensorById(id: number) {
    const tipo = await this.tipoSensorRepo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoSensor ${id} not found`);
    return tipo;
  }

  async updateTipoSensor(id: number, data: any) {
    const tipo = await this.findTipoSensorById(id);
    Object.assign(tipo, data);
    return this.tipoSensorRepo.save(tipo);
  }

  async removeTipoSensor(id: number) {
    const tipo = await this.findTipoSensorById(id);
    return this.tipoSensorRepo.softRemove(tipo);
  }

  // ==================== HELPER METHODS FOR GLOBAL CONFIG ====================

  async findSensorByTopicAndConfig(mqttTopic: string, globalConfigId: number) {
    return this.sensorRepo.findOne({
      where: { mqttTopic, globalConfigId },
    });
  }

  async reconnectSensorsByGlobalConfigId(globalConfigId: number) {
    const sensors = await this.sensorRepo.find({
      where: { globalConfigId, protocolo: ProtocoloSensor.MQTT, activo: true },
    });

    for (const sensor of sensors) {
      await this.connectToMqttSensor(sensor);
    }
  }

  async updateSensorsLoteSubLoteByGlobalConfigId(
    globalConfigId: number,
    loteId: number | null,
    subLoteId: number | null,
  ) {
    await this.sensorRepo.update(
      { globalConfigId },
      {
        ...(loteId !== null && { loteId }),
        ...(subLoteId !== null && { subLoteId }),
      },
    );
  }

  async getGeneralReport(params: {
    loteId?: number;
    startDate?: Date;
    endDate?: Date;
    sensorId?: number;
  }) {
    const { loteId, startDate, endDate, sensorId } = params;
    const queryBuilder = this.sensorRepo
      .createQueryBuilder('sensor')
      .leftJoinAndSelect('sensor.tipoSensor', 'tipoSensor')
      .leftJoinAndSelect('sensor.globalConfig', 'globalConfig')
      .where('sensor.activo = :activo', { activo: true });

    if (loteId) {
      queryBuilder.andWhere('sensor.loteId = :loteId', { loteId });
    }

    if (sensorId) {
      queryBuilder.andWhere('sensor.id = :sensorId', { sensorId });
    }

    const sensors = await queryBuilder.getMany();
    const sensorIds = sensors.map((s) => s.id);

    // 1. Protocolos utilizados
    const protocolos = {
      mqtt: sensors.filter((s) => s.protocolo === ProtocoloSensor.MQTT).length,
      http: sensors.filter((s) => s.protocolo === ProtocoloSensor.HTTP).length,
      otros: sensors.filter(
        (s) =>
          s.protocolo !== ProtocoloSensor.MQTT &&
          s.protocolo !== ProtocoloSensor.HTTP,
      ).length,
    };

    // 2. Estados
    const conectados = sensors.filter(
      (s) => s.estadoConexion === 'CONECTADO',
    ).length;
    const desconectados = sensors.length - conectados;

    // 3. Alertas Activas (count)
    let alertasActivas = 0;
    if (sensorIds.length > 0) {
      alertasActivas = await this.alertaRepo.count({
        where: {
          sensor: { id: In(sensorIds) },
        },
      });
    }

    // 4. Configuración MQTT (si existe)
    let configuracionMqtt = null;
    const mqttSensors = sensors.filter(
      (s) => s.protocolo === ProtocoloSensor.MQTT && s.globalConfig,
    );
    if (mqttSensors.length > 0) {
      const config = mqttSensors[0].globalConfig;
      configuracionMqtt = {
        broker: config?.broker || 'N/A',
        topicPrefix: config?.topicPrefix || '',
        sensoresConectados: mqttSensors.filter(
          (s) => s.estadoConexion === 'CONECTADO',
        ).length,
      };
    }

    // 5. Detalles por sensor con estadísticas y tendencias
    const sensoresDetalle = [];

    for (const sensor of sensors) {
      // Estadísticas del sensor - SIN restricción de fechas
      const qbStats = this.lecturaRepo
        .createQueryBuilder('lectura')
        .select('AVG(CAST(lectura.valor AS decimal))', 'promedio')
        .addSelect('MIN(CAST(lectura.valor AS decimal))', 'minimo')
        .addSelect('MAX(CAST(lectura.valor AS decimal))', 'maximo')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
        .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'"); // Solo valores numéricos

      const stats = await qbStats.getRawOne();

      // Obtener lectura con valor mínimo (con fecha) - SIN restricción de fechas
      const qbMin = this.lecturaRepo
        .createQueryBuilder('lectura')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
        .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'") // Solo valores numéricos
        .orderBy('CAST(lectura.valor AS decimal)', 'ASC')
        .limit(1);

      const minReading = await qbMin.getOne();

      // Obtener lectura con valor máximo (con fecha) - SIN restricción de fechas
      const qbMax = this.lecturaRepo
        .createQueryBuilder('lectura')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
        .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'") // Solo valores numéricos
        .orderBy('CAST(lectura.valor AS decimal)', 'DESC')
        .limit(1);

      const maxReading = await qbMax.getOne();

      // Obtener última lectura - SIN restricción de fechas
      const qbLast = this.lecturaRepo
        .createQueryBuilder('lectura')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
        .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'") // Solo valores numéricos
        .orderBy('lectura.fechaLectura', 'DESC')
        .limit(1);

      const lastReading = await qbLast.getOne();

      console.log(`[IoT Report] Sensor "${sensor.nombre}": Stats=${!!stats}, Min=${!!minReading}, Max=${!!maxReading}, Last=${!!lastReading}`);

      // Obtener datos de tendencia (últimas 48 horas o rango especificado, agregado por hora)
      const qbTrend = this.lecturaRepo
        .createQueryBuilder('lectura')
        .select("date_trunc('hour', lectura.fechaLectura)", 'fecha')
        .addSelect('AVG(CAST(lectura.valor AS decimal))', 'valor')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
        .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'"); // Solo valores numéricos

      if (startDate) {
        qbTrend.andWhere('lectura.fechaLectura >= :start', {
          start: startDate,
        });
      } else {
        // Default: últimas 48 horas
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
        qbTrend.andWhere('lectura.fechaLectura >= :twoDaysAgo', {
          twoDaysAgo,
        });
      }

      if (endDate) {
        qbTrend.andWhere('lectura.fechaLectura <= :end', { end: endDate });
      }

      const trendData = await qbTrend
        .groupBy("date_trunc('hour', lectura.fechaLectura)")
        .orderBy('fecha', 'ASC')
        .limit(48) // Limitar a 48 puntos máximo
        .getRawMany();

      console.log(`[IoT Report] Sensor "${sensor.nombre}": ${trendData.length} puntos de tendencia encontrados en rango especificado`);

      // FALLBACK: Si no hay datos en el rango, buscar en los últimos 30 días
      let finalTrendData = trendData;
      if (finalTrendData.length === 0) {
        console.log(`[IoT Report] Sensor "${sensor.nombre}" (ID: ${sensor.id}): Buscando en últimos 30 días...`);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        finalTrendData = await this.lecturaRepo
          .createQueryBuilder('lectura')
          .select("date_trunc('hour', lectura.fechaLectura)", 'fecha')
          .addSelect('AVG(CAST(lectura.valor AS decimal))', 'valor')
          .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
          .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'") // Solo valores numéricos
          .andWhere('lectura.fechaLectura >= :thirtyDaysAgo', { thirtyDaysAgo })
          .groupBy("date_trunc('hour', lectura.fechaLectura)")
          .orderBy('fecha', 'DESC')
          .limit(48)
          .getRawMany();
        
        console.log(`[IoT Report] Sensor "${sensor.nombre}": ${finalTrendData.length} puntos encontrados en últimos 30 días`);
      }

      // FALLBACK 2: Si aún no hay datos, buscar CUALQUIER dato sin restricción de fechas
      if (finalTrendData.length === 0) {
        console.log(`[IoT Report] Sensor "${sensor.nombre}" (ID: ${sensor.id}): Buscando CUALQUIER dato disponible...`);
        
        finalTrendData = await this.lecturaRepo
          .createQueryBuilder('lectura')
          .select("date_trunc('hour', lectura.fechaLectura)", 'fecha')
          .addSelect('AVG(CAST(lectura.valor AS decimal))', 'valor')
          .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
          .andWhere("lectura.valor ~ '^[0-9]+(\\.[0-9]+)?$'") // Solo valores numéricos
          .groupBy("date_trunc('hour', lectura.fechaLectura)")
          .orderBy('fecha', 'DESC')
          .limit(48)
          .getRawMany();
        
        console.log(`[IoT Report] Sensor "${sensor.nombre}": ${finalTrendData.length} puntos encontrados SIN restricción de fechas`);
        
        // Verificar si hay ALGUNA lectura para este sensor
        const totalCount = await this.lecturaRepo
          .createQueryBuilder('lectura')
          .where('lectura.sensorId = :sensorId', { sensorId: sensor.id })
          .getCount();
        
        console.log(`[IoT Report] Sensor "${sensor.nombre}" (ID: ${sensor.id}): Total lecturas en BD: ${totalCount}`);
      }

      const tendencia = finalTrendData.map((t) => ({
        fecha: t.fecha,
        valor: parseFloat(t.valor),
      }));

      // Construir objeto de detalle del sensor
      sensoresDetalle.push({
        id: sensor.id,
        nombre: sensor.nombre,
        protocolo: sensor.protocolo || 'N/A',
        tipoSensor: sensor.tipoSensor?.nombre || 'N/A',
        unidad: sensor.tipoSensor?.unidad || '',
        estadoConexion: sensor.estadoConexion || 'DESCONOCIDO',
        estadisticas: {
          promedio: stats?.promedio ? parseFloat(stats.promedio) : 0,
          minimo: {
            valor: minReading ? parseFloat(minReading.valor) : 0,
            fecha: minReading?.fechaLectura || null,
          },
          maximo: {
            valor: maxReading ? parseFloat(maxReading.valor) : 0,
            fecha: maxReading?.fechaLectura || null,
          },
          ultimaLectura: {
            valor: lastReading ? parseFloat(lastReading.valor) : 0,
            fecha: lastReading?.fechaLectura || null,
          },
        },
        tendencia,
      });
    }

    // 6. Promedios globales (para compatibilidad con código existente)
    const promedios = sensoresDetalle.map((s) => ({
      label: s.nombre,
      value: s.estadisticas.promedio.toFixed(2),
      min: s.estadisticas.minimo.valor.toFixed(2),
      max: s.estadisticas.maximo.valor.toFixed(2),
      unit: s.unidad,
    }));

    // 7. Chart Data global (TimeSeries promedio de todos los sensores)
    let chartData: { fecha: Date; valor: string }[] = [];
    if (sensorIds.length > 0) {
      const qbChart = this.lecturaRepo
        .createQueryBuilder('lectura')
        .select("date_trunc('hour', lectura.fechaLectura)", 'fecha')
        .addSelect('AVG(CAST(lectura.valor AS decimal))', 'valor')
        .where('lectura.sensorId IN (:...ids)', { ids: sensorIds });

      if (startDate) {
        qbChart.andWhere('lectura.fechaLectura >= :start', { start: startDate });
      }
      if (endDate) {
        qbChart.andWhere('lectura.fechaLectura <= :end', { end: endDate });
      }

      const rawChart = await qbChart
        .groupBy("date_trunc('hour', lectura.fechaLectura)")
        .orderBy('fecha', 'ASC')
        .getRawMany();

      chartData = rawChart.map((r) => ({
        fecha: r.fecha,
        valor: parseFloat(r.valor).toFixed(2),
      }));
    }

    // Global Min/Max for context
    const allValues = promedios.map((p) => parseFloat(p.value));
    const minGlobal =
      allValues.length > 0 ? Math.min(...allValues).toFixed(2) : 0;
    const maxGlobal =
      allValues.length > 0 ? Math.max(...allValues).toFixed(2) : 0;

    // 8. Obtener alertas detalladas
    const qbAlertas = this.alertaRepo
      .createQueryBuilder('alerta')
      .leftJoinAndSelect('alerta.sensor', 'sensor')
      .leftJoinAndSelect('sensor.tipoSensor', 'tipoSensor')
      .where('alerta.loteId = :loteId', { loteId });

    if (startDate) {
      qbAlertas.andWhere('alerta.fechaAlerta >= :start', { start: startDate });
    }
    if (endDate) {
      qbAlertas.andWhere('alerta.fechaAlerta <= :end', { end: endDate });
    }

    const alertas = await qbAlertas
      .orderBy('alerta.fechaAlerta', 'DESC')
      .limit(50) // Limitar a últimas 50 alertas
      .getMany();

    const alertasDetalle = alertas.map((alerta) => ({
      id: alerta.id,
      sensorNombre: alerta.sensor?.nombre || 'Desconocido',
      tipoSensor: alerta.sensor?.tipoSensor?.nombre || 'N/A',
      tipoAlerta: alerta.tipo,
      valor: alerta.valor,
      umbral: alerta.umbral,
      fechaDeteccion: alerta.fechaAlerta,
      resuelta: false,
      fechaResolucion: null,
    }));

    return {
      totalSensors: sensors.length,
      protocolos,
      estados: {
        conectados,
        desconectados,
      },
      alertasActivas,
      alertasDetalle, // NUEVO: Alertas detalladas
      configuracionMqtt,
      sensoresDetalle,
      promedios, // Mantener para compatibilidad
      minGlobal,
      maxGlobal,
      chartData,
    };
  }

  async createAutoSensor(data: {
    nombre: string;
    mqttTopic: string;
    globalConfigId: number;
    loteId?: number;
    subLoteId?: number;
    tipoNombre?: string;
  }) {
    let tipoSensorId: number | undefined = undefined;

    // 1. Try to find type by provided name (from MQTT payload)
    if (data.tipoNombre) {
      let tipo = await this.tipoSensorRepo.findOne({
        where: { nombre: data.tipoNombre },
      });
      if (tipo) {
        tipoSensorId = tipo.id;
      }
    }

    // 2. If not found or not provided, try mapping from topic
    if (!tipoSensorId) {
      const mappedType = await this.mapTopicToTipoSensor(data.mqttTopic);
      if (mappedType) {
        tipoSensorId = mappedType.id;
      } else {
        // 3. Fallback to GENÉRICO
        let generico = await this.tipoSensorRepo.findOne({
          where: { nombre: 'GENÉRICO' },
        });
        if (!generico) {
          generico = this.tipoSensorRepo.create({
            nombre: 'GENÉRICO',
            unidad: 'N/A',
            descripcion: 'Tipo genérico para sensores sin clasificación',
          });
          generico = await this.tipoSensorRepo.save(generico);
        }
        tipoSensorId = generico.id;
      }
    }

    const sensor = this.sensorRepo.create({
      nombre: data.nombre,
      mqttTopic: data.mqttTopic,
      globalConfigId: data.globalConfigId,
      loteId: data.loteId || undefined,
      subLoteId: data.subLoteId || undefined,
      tipoSensorId: tipoSensorId,
      protocolo: ProtocoloSensor.MQTT,
      activo: true,
      estadoConexion: 'DESCONOCIDO', // Initial state
      creadoPorUsuarioId: 1, // System
    });

    const saved = await this.sensorRepo.save(sensor);

    // Connect immediately
    this.connectToMqttSensor(saved);

    return saved;
  }

  // ==================== SENSORES ====================

  // DB Reset and Seed (Dev only)
  async resetAndSeed() {
    // 1. Truncate tables (cascade will handle relations)
    await this.lecturaRepo.query('TRUNCATE TABLE sensor_lectura CASCADE');
    await this.sensorRepo.query('TRUNCATE TABLE sensores CASCADE');
    await this.tipoSensorRepo.query('TRUNCATE TABLE tipo_sensor CASCADE');

    // 2. Seed default sensor types (matching topic names)
    const defaultTypes = [
      {
        nombre: 'temperatura',
        unidad: '°C',
        descripcion: 'Temperatura ambiente',
      },
      {
        nombre: 'humedadAire',
        unidad: '%',
        descripcion: 'Humedad relativa del aire',
      },
      { nombre: 'humedadSuelo', unidad: '%', descripcion: 'Humedad del suelo' },
      {
        nombre: 'estadoBomba',
        unidad: 'ON/OFF',
        descripcion: 'Estado de la bomba de riego',
      },
    ];

    for (const typeData of defaultTypes) {
      await this.tipoSensorRepo.save(this.tipoSensorRepo.create(typeData));
    }

    return {
      message: 'Database reset and seeded successfully',
      types: defaultTypes.length,
    };
  }

  // RF32: CRUD de sensores
  async findAllSensors(loteId?: number, subLoteId?: number) {
    const where: any = {};
    if (loteId) where.loteId = loteId;
    if (subLoteId) where.subLoteId = subLoteId;

    return this.sensorRepo.find({
      where,
      relations: ['tipoSensor', 'cultivo', 'lote', 'subLote'],
    });
  }

  async findSensorById(id: number) {
    const sensor = await this.sensorRepo.findOne({
      where: { id },
      relations: ['tipoSensor', 'cultivo', 'lote', 'subLote'],
    });
    if (!sensor) throw new NotFoundException(`Sensor ${id} not found`);
    return sensor;
  }

  async createSensor(data: CreateSensorDto, usuarioId: number) {
    // Validation: If loteId is provided, check if it has sublotes
    if (data.loteId) {
      const sublotes = await this.geoService.findAllSubLotes(data.loteId);
      if (sublotes && sublotes.length > 0 && !data.subLoteId) {
        throw new BadRequestException(
          `El lote seleccionado tiene sublotes. Debe seleccionar un sublote.`,
        );
      }
    }

    // If tipoSensorId is missing, we allow it (it will be auto-detected)
    // But we might want to set a "Pending" type or just null.
    // The entity allows null? Let's check entity.
    // Entity: @Column({ name: 'tipo_sensor_id' }) tipoSensorId: number; -> Not nullable by default?
    // We need to check Sensor entity definition.
    // If it's not nullable, we might need to make it nullable or assign a default "Unknown" type.
    // For now, assuming we can make it nullable or it is nullable (previous code didn't show nullable: true explicitly but let's assume we need to fix it if it fails).

    const sensor = this.sensorRepo.create({
      ...data,
      estadoConexion: 'desconectado',
      creadoPorUsuarioId: usuarioId,
    });
    const savedSensor = await this.sensorRepo.save(sensor);

    if (savedSensor.protocolo === ProtocoloSensor.MQTT) {
      this.connectToMqttSensor(savedSensor);
    }

    return savedSensor;
  }

  async updateSensor(id: number, data: UpdateSensorDto) {
    const sensor = await this.findSensorById(id);

    if (data.globalConfigId) {
      const cfg = await this.configRepo.findOne({
        where: { id: data.globalConfigId },
      });
      if (!cfg)
        throw new NotFoundException(`Config ${data.globalConfigId} not found`);
      sensor.globalConfigId = cfg.id;
      // Optionally update lot/sublot if they match the config's default?
      // sensor.loteId = cfg.loteId;
      // sensor.subLoteId = cfg.subLoteId;
    }

    if (data.nombre !== undefined) sensor.nombre = data.nombre;
    if (data.mqttTopic !== undefined) sensor.mqttTopic = data.mqttTopic;
    if (data.activo !== undefined) sensor.activo = data.activo;
    if (data.umbralMin !== undefined) sensor.umbralMin = data.umbralMin as any;
    if (data.umbralMax !== undefined) sensor.umbralMax = data.umbralMax as any;
    // Update other fields as needed from DTO...

    const savedSensor = await this.sensorRepo.save(sensor);

    if (savedSensor.protocolo === ProtocoloSensor.MQTT) {
      this.connectToMqttSensor(savedSensor);
    }

    return savedSensor;
  }

  async toggleSensorStatus(id: number) {
    const sensor = await this.findSensorById(id);
    sensor.activo = !sensor.activo;
    return this.sensorRepo.save(sensor);
  }

  async removeSensor(id: number) {
    const sensor = await this.findSensorById(id);
    
    // Manually delete dependencies first to ensure robust deletion
    try {
        console.log(`[IoT] Deleting dependencies for sensor ${id}`);
        await this.lecturaRepo.delete({ sensorId: id });
        await this.alertaRepo.delete({ sensorId: id });
    } catch (e) {
        console.warn(`[IoT] Warning deleting dependencies for sensor ${id}:`, e);
    }

    return this.sensorRepo.remove(sensor); // Use remove (hard delete) instead of softRemove if we want to clean up completely, or softRemove if we want to keep it.
    // Given the user wants to "delete", and we are deleting dependencies hard, let's hard delete the sensor too to avoid zombie data.
  }

  // ==================== LECTURAS ====================

  async findAllLecturas(sensorId?: number) {
    const where: any = {};
    if (sensorId) where.sensorId = sensorId;

    return this.lecturaRepo.find({
      where,
      // relations: ['sensor'], // Removed for performance (charts dont need full sensor object)
      order: { fechaLectura: 'DESC' },
      take: 1000, 
    });
  }

  // RF34 (Optimized): Get aggregated readings for charts
  async getAggregatedReadings(
    sensorId: number,
    from: Date,
    to: Date,
    interval: 'hour' | 'day' | 'week' = 'day',
  ) {
    // Construct interval string for PostgreSQL date_trunc
    const intervalStr =
      interval === 'week' ? 'week' : interval === 'hour' ? 'hour' : 'day';

    try {
      const result = await this.lecturaRepo.query(
        `
        SELECT
          date_trunc($1, "fecha_lectura") as date,
          AVG(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as avg_value,
          MIN(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as min_value,
          MAX(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as max_value
        FROM "sensor_lecturas"
        WHERE "sensor_id" = $2
          AND "fecha_lectura" >= $3
          AND "fecha_lectura" <= $4
        GROUP BY 1
        ORDER BY 1 ASC
        `,
        [intervalStr, sensorId, from, to],
      );

      return result.map((r: any) => ({
        fecha: r.date,
        promedio: r.avg_value || 0,
        lecturaMinima: { valor: r.min_value || 0 },
        lecturaMaxima: { valor: r.max_value || 0 },
      }));
    } catch (error) {
      console.error('Error aggregated readings:', error);
      return [];
    }
  }

  // RF34 (Bulk Optimization): Get aggregated readings for MULTIPLE sensors
  async getBulkReadings(
    sensorIds: number[],
    from: Date,
    to: Date,
    interval: 'hour' | 'day' | 'week' = 'day'
  ) {
    if (!sensorIds.length) return {};
    
    // Construct interval string
    const intervalStr =
      interval === 'week' ? 'week' : interval === 'hour' ? 'hour' : 'day';

    try {
      // Use Postgres ANY($2) for array of IDs
      const result = await this.lecturaRepo.query(
        `
        SELECT
          "sensor_id",
          date_trunc($1, "fecha_lectura") as date,
          AVG(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as avg_value,
          MIN(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as min_value,
          MAX(CASE WHEN "valor" ~ '^[0-9.-]+$' THEN CAST("valor" AS FLOAT) ELSE NULL END) as max_value
        FROM "sensor_lecturas"
        WHERE "sensor_id" = ANY($2::int[])
          AND "fecha_lectura" >= $3
          AND "fecha_lectura" <= $4
        GROUP BY 1, 2
        ORDER BY 2 ASC
        `,
        [intervalStr, sensorIds, from, to],
      );
      
      // Group by sensorId
      const grouped: Record<number, any[]> = {};
      sensorIds.forEach(id => grouped[id] = []);
      
      result.forEach((r: any) => {
        if (!grouped[r.sensor_id]) grouped[r.sensor_id] = [];
        grouped[r.sensor_id].push({
           fecha: r.date,
           promedio: r.avg_value || 0,
           lecturaMinima: { valor: r.min_value || 0 }, // Mock object structure to match existing DTO
           lecturaMaxima: { valor: r.max_value || 0 }
        });
      });
      
      return grouped;
    } catch (error) {
      console.error('Error in bulk readings:', error);
      return {};
    }
  }


  async findAlerts(filters: {
    loteId?: number;
    sensorId?: number;
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};
    if (filters.sensorId) where.sensorId = filters.sensorId;
    if (filters.loteId) where.loteId = filters.loteId;
    if (filters.from) where.fechaAlerta = where.fechaAlerta || {};
    if (filters.from) where.fechaAlerta['$gte'] = filters.from;
    if (filters.to) {
      where.fechaAlerta = where.fechaAlerta || {};
      where.fechaAlerta['$lte'] = filters.to;
    }

    const query = this.alertaRepo
      .createQueryBuilder('alerta')
      .leftJoinAndSelect('alerta.sensor', 'sensor')
      .orderBy('alerta.fechaAlerta', 'DESC')
      .take(200);

    if (filters.sensorId) {
      query.andWhere('alerta.sensorId = :sensorId', {
        sensorId: filters.sensorId,
      });
    }
    if (filters.loteId) {
      query.andWhere('alerta.loteId = :loteId', { loteId: filters.loteId });
    }
    if (filters.from) {
      query.andWhere('alerta.fechaAlerta >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('alerta.fechaAlerta <= :to', { to: filters.to });
    }

    return query.getMany();
  }

  // RFxx: Get context (surrounding readings) for a specific alert
  async getAlertContext(alertId: number) {
    const alert = await this.alertaRepo.findOne({
      where: { id: alertId },
      relations: ['sensor'],
    });

    if (!alert) throw new NotFoundException(`Alert ${alertId} not found`);

    const contextBefore = await this.lecturaRepo
      .createQueryBuilder('l')
      .where('l.sensorId = :sensorId', { sensorId: alert.sensorId })
      .andWhere('l.fechaLectura <= :date', { date: alert.fechaAlerta })
      .orderBy('l.fechaLectura', 'DESC')
      .take(15) // 15 points before (including the point itself roughly)
      .getMany();
      
    const contextAfter = await this.lecturaRepo
      .createQueryBuilder('l')
      .where('l.sensorId = :sensorId', { sensorId: alert.sensorId })
      .andWhere('l.fechaLectura > :date', { date: alert.fechaAlerta })
      .orderBy('l.fechaLectura', 'ASC')
      .take(15) // 15 points after
      .getMany();

    // Combine and sort
    const context = [...contextBefore, ...contextAfter].sort((a, b) => 
        new Date(a.fechaLectura).getTime() - new Date(b.fechaLectura).getTime()
    );

    return {
       alert,
       context: context.map(c => ({
         ...c,
         valor: parseFloat(String(c.valor)) || 0
       }))
    };
  }

  async generateLotPdf(filters: {
    loteId?: number;
    sensorId?: number;
    from?: Date;
    to?: Date;
  }): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));

    const sensores = await this.sensorRepo.find({
      where: {
        ...(filters.loteId ? { loteId: filters.loteId } : {}),
        ...(filters.sensorId ? { id: filters.sensorId } : {}),
        activo: true,
      },
      relations: ['tipoSensor'],
    });

    const alerts = await this.findAlerts({
      loteId: filters.loteId,
      sensorId: filters.sensorId,
      from: filters.from,
      to: filters.to,
    });

    doc.fontSize(16).text('Reporte IoT', { align: 'left' });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .text(`Lote: ${filters.loteId ?? 'Todos'}`, { continued: true })
      .text(
        `   Rango: ${filters.from?.toISOString().slice(0, 10) || 'N/A'} - ${filters.to?.toISOString().slice(0, 10) || 'N/A'}`,
      );
    doc.moveDown(0.5);
    doc.text(`Sensores incluidos: ${sensores.length}`);
    doc.text(`Alertas en rango: ${alerts.length}`);
    doc.moveDown();

    for (const sensor of sensores.slice(0, 5)) {
      doc.fontSize(12).text(sensor.nombre, { underline: true });
      doc
        .fontSize(9)
        .text(
          `Tipo: ${sensor.tipoSensor?.nombre || ''} (${sensor.tipoSensor?.unidad || ''})`,
        );
      const lecturas = await this.lecturaRepo.find({
        where: { sensorId: sensor.id },
        order: { fechaLectura: 'ASC' },
        take: 120,
      });
      const fromTs = filters.from?.getTime() ?? -Infinity;
      const toTs = filters.to?.getTime() ?? Infinity;
      const lecturasFiltradas = lecturas.filter((l) => {
        const t = new Date(l.fechaLectura).getTime();
        return t >= fromTs && t <= toTs;
      });
      const vals = lecturasFiltradas
        .map((l) => Number(l.valor))
        .filter((v) => !Number.isNaN(v));
      if (vals.length > 0) {
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        doc.text(`Promedio: ${avg.toFixed(2)}   Min: ${min}   Max: ${max}`);

        const w = 400;
        const h = 60;
        const x0 = doc.x;
        const y0 = doc.y + h / 2;
        const range = max - min || 1;
        const points = vals.map((v, i) => {
          const x = x0 + (i / Math.max(vals.length - 1, 1)) * w;
          const y = y0 - ((v - min) / range) * (h / 2);
          return { x, y };
        });
        doc.moveTo(x0, y0);
        points.forEach((p, idx) => {
          if (idx === 0) doc.moveTo(p.x, p.y);
          else doc.lineTo(p.x, p.y);
        });
        doc.strokeColor('#0ea5e9').stroke();

        const alertasSensor = alerts.filter((a) => a.sensorId === sensor.id);
        alertasSensor.forEach((a) => {
          let idx = 0;
          if (lecturasFiltradas.length > 1 && a.fechaAlerta) {
            const tAlert = new Date(a.fechaAlerta).getTime();
            let best = Infinity;
            lecturasFiltradas.forEach((l, i) => {
              const diff = Math.abs(
                new Date(l.fechaLectura).getTime() - tAlert,
              );
              if (diff < best) {
                best = diff;
                idx = i;
              }
            });
          }
          const p = points[idx];
          doc.circle(p.x, p.y, 3).fillAndStroke('#ef4444', '#ef4444');
        });
        doc.moveDown(1.5);
      } else {
        doc.text('Sin lecturas en el rango.').moveDown();
      }
    }

    if (alerts.length > 0) {
      doc.addPage();
      doc.fontSize(12).text('Alertas', { underline: true });
      doc.moveDown(0.5);
      alerts.slice(0, 50).forEach((a) => {
        doc
          .fontSize(9)
          .fillColor(a.tipo === 'LOW' ? '#0f766e' : '#b91c1c')
          .text(
            `${a.sensor?.nombre || `Sensor ${a.sensorId}`} | ${a.tipo} | Valor ${a.valor} (umbral ${a.umbral ?? '-'}) | ${new Date(a.fechaAlerta).toLocaleString('es-ES')}`,
          );
      });
    }

    doc.end();
    return new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  // RF33: Ingestar lectura (multi-protocolo: HTTP, MQTT, WS)
  async createLectura(data: CreateSensorLecturaDto, gateway?: IotGateway) {
    const sensor = await this.findSensorById(data.sensorId);

    const fecha = data.fechaLectura ? new Date(data.fechaLectura) : new Date();

    const lectura = this.lecturaRepo.create({
      sensorId: data.sensorId,
      valor: data.valor,
      fechaLectura: fecha,
    });

    const saved = await this.lecturaRepo.save(lectura);

    // RF34: Actualizar estado de conexión del sensor
    await this.updateSensorEstado(sensor, data.valor, fecha, gateway);

    // RF34: Emitir evento en tiempo real vía WebSocket
    if (gateway) {
      gateway.emitLectura(saved);
    }

    return saved;
  }

  // RF34: Actualizar estado de conexión basado en TTL
  private async updateSensorEstado(
    sensor: Sensor,
    valor: any,
    fecha: Date,
    gateway?: IotGateway,
  ) {
    sensor.ultimaLectura = fecha;
    sensor.lastSeenAt = fecha;
    sensor.estadoConexion = 'CONECTADO';
    sensor.ultimoValor = String(valor);

    // Validar umbrales si están configurados y el valor es numérico
    const valorNum = Number(valor);
    if (!isNaN(valorNum)) {
      if (sensor.umbralMin !== null && valorNum < sensor.umbralMin) {
        sensor.estadoConexion = 'ALERTA_MIN';
        await this.registrarAlerta(
          sensor,
          valorNum,
          sensor.umbralMin,
          'LOW',
          fecha,
          gateway,
        );
      }

      if (sensor.umbralMax !== null && valorNum > sensor.umbralMax) {
        sensor.estadoConexion = 'ALERTA_MAX';
        await this.registrarAlerta(
          sensor,
          valorNum,
          sensor.umbralMax,
          'HIGH',
          fecha,
          gateway,
        );
      }
    }

    await this.sensorRepo.save(sensor);
  }

  // RF34: Calcular estado de conexión basado en TTL
  async calculateSensorStatus(sensor: Sensor): Promise<string> {
    if (!sensor.lastSeenAt) {
      return 'DESCONECTADO';
    }

    // Obtener TTL del tipo de sensor
    const tipoSensor =
      sensor.tipoSensor ||
      (await this.tipoSensorRepo.findOne({
        where: { id: sensor.tipoSensorId },
      }));

    if (!tipoSensor) {
      return 'DESCONECTADO';
    }

    const ttlMinutos = tipoSensor.ttlMinutos || 5; // Default 5 minutos
    const now = new Date();
    const lastSeen = new Date(sensor.lastSeenAt);
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);

    return diffMinutes <= ttlMinutos ? 'CONECTADO' : 'DESCONECTADO';
  }

  private async registrarAlerta(
    sensor: Sensor,
    valor: number,
    umbral: number | null,
    tipo: AlertaTipo,
    fecha: Date,
    gateway?: IotGateway,
  ) {
    const alerta = this.alertaRepo.create({
      sensorId: sensor.id,
      valor,
      umbral,
      tipo,
      fechaAlerta: fecha,
      loteId: sensor.loteId ?? null,
      subLoteId: sensor.subLoteId ?? null,
    });
    const saved = await this.alertaRepo.save(alerta);
    if (gateway) {
      gateway.emitAlert(saved);
    }
    return saved;
  }

  // RF34: Obtener estado actual de un sensor (on-demand)
  async getSensorStatus(sensorId: number) {
    const sensor = await this.findSensorById(sensorId);
    const estadoConexion = await this.calculateSensorStatus(sensor);

    // Actualizar si cambió
    if (sensor.estadoConexion !== estadoConexion) {
      sensor.estadoConexion = estadoConexion;
      await this.sensorRepo.save(sensor);
    }

    return {
      sensorId: sensor.id,
      nombre: sensor.nombre,
      estadoConexion,
      ultimoValor: sensor.ultimoValor,
      ultimaLectura: sensor.ultimaLectura,
      lastSeenAt: sensor.lastSeenAt,
      ttlMinutos: sensor.tipoSensor?.ttlMinutos || 5,
    };
  }

  // RF34: Actualizar estado de todos los sensores (job periódico)
  async updateAllSensorsStatus() {
    const sensores = await this.sensorRepo.find({ relations: ['tipoSensor'] });

    for (const sensor of sensores) {
      const nuevoEstado = await this.calculateSensorStatus(sensor);
      if (sensor.estadoConexion !== nuevoEstado) {
        sensor.estadoConexion = nuevoEstado;
        await this.sensorRepo.save(sensor);
      }
    }

    return { message: `${sensores.length} sensores actualizados` };
  }

  // Obtener últimas lecturas de un sensor
  async getUltimasLecturas(sensorId: number, limit: number = 100) {
    return this.lecturaRepo.find({
      where: { sensorId },
      order: { fechaLectura: 'DESC' },
      take: limit,
    });
  }

  // Obtener lecturas en rango de fechas
  async getLecturasByRango(
    sensorId: number,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    return this.lecturaRepo
      .createQueryBuilder('lectura')
      .where('lectura.sensorId = :sensorId', { sensorId })
      .andWhere('lectura.fechaLectura >= :fechaInicio', { fechaInicio })
      .andWhere('lectura.fechaLectura <= :fechaFin', { fechaFin })
      .orderBy('lectura.fechaLectura', 'ASC')
      .getMany();
  }
  // ==================== REPORTES ====================




  async getLotsComparison(
    loteIds?: number[],
    tipoSensorId?: number,
    startDate?: Date,
    endDate?: Date,
  ) {
    const start =
      startDate || new Date(new Date().setDate(new Date().getDate() - 7));
    const end = endDate || new Date();

    // Get all sensors, optionally filtered by lot IDs and sensor type
    const where: any = {};
    if (loteIds && loteIds.length > 0) {
      where.loteId = loteIds.length === 1 ? loteIds[0] : undefined;
    }
    if (tipoSensorId) {
      where.tipoSensorId = tipoSensorId;
    }

    let sensors = await this.sensorRepo.find({
      where,
      relations: ['tipoSensor', 'lote'],
    });

    // If multiple loteIds, filter manually
    if (loteIds && loteIds.length > 1) {
      sensors = sensors.filter((s) => s.loteId && loteIds.includes(s.loteId));
    }

    // Group sensors by lote
    const loteMap = new Map<number, any>();

    for (const sensor of sensors) {
      if (!sensor.loteId) continue;

      if (!loteMap.has(sensor.loteId)) {
        loteMap.set(sensor.loteId, {
          loteId: sensor.loteId,
          loteNombre: sensor.lote?.nombre || `Lote ${sensor.loteId}`,
          sensorIds: [],
          totalSensores: 0,
          activos: 0,
        });
      }

      const lote = loteMap.get(sensor.loteId);
      lote.sensorIds.push(sensor.id);
      lote.totalSensores++;
      if (sensor.estadoConexion === 'CONECTADO') lote.activos++;
    }

    // Calculate average for each lot
    const comparisonData: any[] = [];

    for (const [loteId, loteInfo] of loteMap) {
      if (loteInfo.sensorIds.length === 0) continue;

      const { avg } = await this.lecturaRepo
        .createQueryBuilder('lectura')
        .select('AVG(CAST(lectura.valor AS FLOAT))', 'avg')
        .where('lectura.sensorId IN (:...ids)', { ids: loteInfo.sensorIds })
        .andWhere('lectura.fechaLectura >= :start', { start })
        .andWhere('lectura.fechaLectura <= :end', { end })
        .getRawOne();

      comparisonData.push({
        loteId,
        loteNombre: loteInfo.loteNombre,
        metric: avg ? parseFloat(parseFloat(avg).toFixed(2)) : 0,
        totalSensores: loteInfo.totalSensores,
        activos: loteInfo.activos,
        isBest: false,
        isWorst: false,
      });
    }

    // Mark best/worst
    if (comparisonData.length > 0) {
      const metrics = comparisonData.map((d) => d.metric);
      const max = Math.max(...metrics);
      const min = Math.min(...metrics);

      comparisonData.forEach((d) => {
        d.isBest = d.metric === max;
        d.isWorst = d.metric === min;
      });
    }

    return {
      comparisonData,
      tipoSensor: tipoSensorId
        ? await this.findTipoSensorById(tipoSensorId)
        : null,
      rango: { start, end },
    };
  }
}
