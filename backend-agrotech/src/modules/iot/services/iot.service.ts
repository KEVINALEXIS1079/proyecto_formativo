import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../entities/sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { IotGlobalConfig } from '../entities/iot-global-config.entity';
import { CreateSensorDto } from '../dtos/create-sensor.dto';
import { CreateSensorLecturaDto } from '../dtos/create-sensor-lectura.dto';
import { IotGateway } from '../gateways/iot.gateway';
import { MqttService } from '../../../common/services/mqtt.service';
import { ProtocoloSensor } from '../dtos/create-sensor.dto';
import { Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { GeoService } from '../../geo/services/geo.service';

@Injectable()
export class IotService implements OnModuleInit {
  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura)
    private lecturaRepo: Repository<SensorLectura>,
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

  // ==================== GLOBAL CONFIG & DISCOVERY ====================

  async getGlobalConfig() {
    const config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      // Return default empty config if not found
      return {
        broker: '',
        port: 1883,
        protocol: 'mqtt',
        loteId: null,
        topicPrefix: 'agrotech/',
        defaultTopics: [],
        customTopics: [],
      };
    }
    return config;
  }

  async saveGlobalConfig(data: Partial<IotGlobalConfig>) {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create(data);
    } else {
      Object.assign(config, data);
    }
    const saved = await this.configRepo.save(config);
    
    // Reconnect with new config
    await this.connectToGlobalDiscovery();
    
    return saved;
  }

  async connectToGlobalDiscovery() {
    const config = await this.configRepo.findOne({ where: {} });
    if (!config || !config.broker) return;

    console.log(`[IoT] Connecting to Global Broker: ${config.broker}`);

    const client = this.mqttService.connect(
      config.broker,
      config.port,
      `agrotech-server-discovery`,
      {
        username: config.username,
        password: config.password,
      },
    );

    // Subscribe to Default Topics
    if (config.defaultTopics) {
      for (const topic of config.defaultTopics) {
        const fullTopic = `${config.topicPrefix}${topic}`;
        this.mqttService.subscribe(client, fullTopic, (t, m) => 
          this.handleDiscoveryMessage(t, m, config)
        );
      }
    }

    // Subscribe to Custom Topics
    if (config.customTopics) {
      for (const topic of config.customTopics) {
        const fullTopic = `${config.topicPrefix}${topic}`;
        this.mqttService.subscribe(client, fullTopic, (t, m) => 
          this.handleDiscoveryMessage(t, m, config)
        );
      }
    }
  }

  private async handleDiscoveryMessage(topic: string, message: Buffer, config: IotGlobalConfig) {
    try {
      // 1. Check if sensor exists for this topic
      let sensor = await this.sensorRepo.findOne({ where: { mqttTopic: topic } });

      // 2. If not, create it automatically
      if (!sensor) {
        console.log(`[IoT] Auto-discovering new sensor for topic: ${topic}`);
        
        // Extract simple name from topic (remove prefix)
        const simpleName = topic.replace(config.topicPrefix, '');
        
        // Find or create TipoSensor based on topic name
        let tipoSensor = await this.tipoSensorRepo.findOne({ 
          where: { nombre: simpleName } 
        });
        
        if (!tipoSensor) {
          console.log(`[IoT] TipoSensor "${simpleName}" not found, creating it...`);
          tipoSensor = this.tipoSensorRepo.create({
            nombre: simpleName,
            unidad: 'N/A',
            descripcion: `Auto-creado desde tópico ${topic}`,
          });
          tipoSensor = await this.tipoSensorRepo.save(tipoSensor);
        }

        sensor = this.sensorRepo.create({
          nombre: simpleName.charAt(0).toUpperCase() + simpleName.slice(1), // Capitalize
          tipoSensorId: tipoSensor.id,
          protocolo: ProtocoloSensor.MQTT,
          mqttBroker: config.broker,
          mqttPort: config.port,
          mqttTopic: topic,
          mqttUsername: config.username,
          mqttPassword: config.password,
          cultivoId: undefined,
          activo: true,
          estadoConexion: 'CONECTADO',
          creadoPorUsuarioId: 1, // System or Admin
        });
        
        sensor = await this.sensorRepo.save(sensor);
      }

      // 3. Process the message (save reading)
      await this.handleMqttMessage(sensor, message);

    } catch (err) {
      console.error(`[IoT] Error in auto-discovery for topic ${topic}:`, err);
    }
  }

  connectToMqttSensor(sensor: Sensor) {
    if (!sensor.mqttBroker || !sensor.mqttPort || !sensor.mqttTopic) {
      return;
    }

    const client = this.mqttService.connect(
      sensor.mqttBroker,
      sensor.mqttPort,
      `sensor-${sensor.id}`,
      {
        username: sensor.mqttUsername,
        password: sensor.mqttPassword,
      },
    );

    this.mqttService.subscribe(client, sensor.mqttTopic, (topic, message) => {
      this.handleMqttMessage(sensor, message);
    });
  }

  private async handleMqttMessage(sensor: Sensor, message: Buffer) {
    try {
      const payload = message.toString();
      console.log(`[MQTT] Sensor ${sensor.id} (${sensor.nombre}) received:`, payload, 'Type:', typeof payload);
      
      let valor: any = payload;
      try {
        const json = JSON.parse(payload);
        valor = json.value !== undefined ? json.value : (json.valor !== undefined ? json.valor : json);
        console.log(`[MQTT] Parsed JSON value:`, valor, 'Type:', typeof valor);
      } catch {
        // Not JSON, keep as string
      }

      // Convert to string for storage if it's not already
      const valorString = String(valor);

      await this.createLectura(
        {
          sensorId: sensor.id,
          valor: valorString,
          fechaLectura: new Date(),
        },
        this.iotGateway,
      );
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

  // ==================== SENSORES ====================

  // DB Reset and Seed (Dev only)
  async resetAndSeed() {
    // 1. Truncate tables (cascade will handle relations)
    await this.lecturaRepo.query('TRUNCATE TABLE sensor_lectura CASCADE');
    await this.sensorRepo.query('TRUNCATE TABLE sensores CASCADE');
    await this.tipoSensorRepo.query('TRUNCATE TABLE tipo_sensor CASCADE');

    // 2. Seed default sensor types (matching topic names)
    const defaultTypes = [
      { nombre: 'temperatura', unidad: '°C', descripcion: 'Temperatura ambiente' },
      { nombre: 'humedadAire', unidad: '%', descripcion: 'Humedad relativa del aire' },
      { nombre: 'humedadSuelo', unidad: '%', descripcion: 'Humedad del suelo' },
      { nombre: 'estadoBomba', unidad: 'ON/OFF', descripcion: 'Estado de la bomba de riego' },
    ];

    for (const typeData of defaultTypes) {
      await this.tipoSensorRepo.save(this.tipoSensorRepo.create(typeData));
    }

    return { message: 'Database reset and seeded successfully', types: defaultTypes.length };
  }

  // RF32: CRUD de sensores
  async findAllSensors() {
    return this.sensorRepo.find({ relations: ['tipoSensor', 'cultivo'] });
  }

  async findSensorById(id: number) {
    const sensor = await this.sensorRepo.findOne({
      where: { id },
      relations: ['tipoSensor', 'cultivo'],
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
          `El lote seleccionado tiene sublotes. Debe seleccionar un sublote.`
        );
      }
    }

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

  async updateSensor(id: number, data: Partial<CreateSensorDto>) {
    const sensor = await this.findSensorById(id);
    
    // Check if MQTT config changed to reconnect
    const mqttChanged = 
      data.protocolo === ProtocoloSensor.MQTT ||
      (sensor.protocolo === ProtocoloSensor.MQTT && (
        data.mqttBroker !== undefined ||
        data.mqttPort !== undefined ||
        data.mqttTopic !== undefined ||
        data.mqttUsername !== undefined ||
        data.mqttPassword !== undefined
      ));

    Object.assign(sensor, data);
    const savedSensor = await this.sensorRepo.save(sensor);

    if (mqttChanged && savedSensor.protocolo === ProtocoloSensor.MQTT) {
      // In a real scenario, we should disconnect the old client first if the ID changed or force reconnect
      // For now, we just connect (our MqttService handles reuse if same config, but here config changed)
      // Ideally MqttService should support disconnect or we generate a new client ID if needed.
      // Let's assume we just connect with the new config.
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
    return this.sensorRepo.softRemove(sensor);
  }

  // ==================== LECTURAS ====================

  async findAllLecturas(sensorId?: number) {
    const where: any = {};
    if (sensorId) where.sensorId = sensorId;

    return this.lecturaRepo.find({
      where,
      relations: ['sensor'],
      order: { fecha: 'DESC' },
      take: 1000, // Limitar resultados
    });
  }

  // RF33: Ingestar lectura (multi-protocolo: HTTP, MQTT, WS)
  async createLectura(data: CreateSensorLecturaDto, gateway?: IotGateway) {
    const sensor = await this.findSensorById(data.sensorId);

    const fecha = data.fechaLectura ? new Date(data.fechaLectura) : new Date();

    const lectura = this.lecturaRepo.create({
      sensorId: data.sensorId,
      valor: data.valor,
      fecha: fecha,
    });

    const saved = await this.lecturaRepo.save(lectura);

    // RF34: Actualizar estado de conexión del sensor
    await this.updateSensorEstado(sensor, data.valor, fecha);

    // RF34: Emitir evento en tiempo real vía WebSocket
    if (gateway) {
      gateway.emitLectura(saved);
    }

    return saved;
  }

  // RF34: Actualizar estado de conexión basado en TTL
  private async updateSensorEstado(sensor: Sensor, valor: any, fecha: Date) {
    sensor.ultimaLectura = fecha;
    sensor.lastSeenAt = fecha;
    sensor.estadoConexion = 'CONECTADO';
    sensor.ultimoValor = String(valor);

    // Validar umbrales si están configurados y el valor es numérico
    const valorNum = Number(valor);
    if (!isNaN(valorNum)) {
      if (sensor.umbralMin !== null && valorNum < sensor.umbralMin) {
        sensor.estadoConexion = 'ALERTA_MIN';
      }

      if (sensor.umbralMax !== null && valorNum > sensor.umbralMax) {
        sensor.estadoConexion = 'ALERTA_MAX';
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
      order: { fecha: 'DESC' },
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
      .andWhere('lectura.timestamp >= :fechaInicio', { fechaInicio })
      .andWhere('lectura.timestamp <= :fechaFin', { fechaFin })
      .orderBy('lectura.timestamp', 'ASC')
      .getMany();
  }
}
