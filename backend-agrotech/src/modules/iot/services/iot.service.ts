import { Injectable, NotFoundException, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sensor } from '../entities/sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { CreateSensorDto } from '../dtos/create-sensor.dto';
import { CreateSensorLecturaDto } from '../dtos/create-sensor-lectura.dto';
import { CreateTipoSensorDto } from '../dtos/create-tipo-sensor.dto';
import { UpdateTipoSensorDto } from '../dtos/update-tipo-sensor.dto';
import { IotGateway } from '../gateways/iot.gateway';
import { MqttService } from './mqtt.service';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

@Injectable()
export class IotService implements OnModuleInit {
  private readonly logger = new Logger(IotService.name);

  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura) private lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(TipoSensor) private tipoSensorRepo: Repository<TipoSensor>,
    @Inject(forwardRef(() => IotGateway))
    private iotGateway: IotGateway,
  ) {}

  // ==================== TIPO SENSOR ====================
  
  async findAllTiposSensor() {
    return this.tipoSensorRepo.find();
  }

  async findAllTiposSensorPaginated(pagination: PaginationDto, filters?: { q?: string }) {
    const { page = 1, limit = 20, orderBy = 'nombre', orderDir = 'ASC', q } = pagination;

    const queryBuilder = this.tipoSensorRepo.createQueryBuilder('tipoSensor')
      .where('tipoSensor.deletedAt IS NULL');

    // Búsqueda de texto
    if (q) {
      queryBuilder.andWhere(
        '(tipoSensor.nombre ILIKE :q OR tipoSensor.descripcion ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    // Paginación
    queryBuilder
      .orderBy(`tipoSensor.${orderBy}`, orderDir.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createTipoSensor(data: CreateTipoSensorDto) {
    const tipo = this.tipoSensorRepo.create(data);
    return this.tipoSensorRepo.save(tipo);
  }

  async findTipoSensorById(id: number) {
    const tipoSensor = await this.tipoSensorRepo.findOne({ where: { id } });
    if (!tipoSensor) throw new NotFoundException(`TipoSensor ${id} not found`);
    return tipoSensor;
  }

  async updateTipoSensor(id: number, data: UpdateTipoSensorDto) {
    const tipoSensor = await this.findTipoSensorById(id);
    Object.assign(tipoSensor, data);
    return this.tipoSensorRepo.save(tipoSensor);
  }

  async removeTipoSensor(id: number) {
    const tipoSensor = await this.findTipoSensorById(id);
    return this.tipoSensorRepo.softRemove(tipoSensor);
  }

  // ==================== SENSORES ====================
  
  // RF32: CRUD de sensores
  async findAllSensors() {
    return this.sensorRepo.find({ relations: ['tipoSensor', 'lote', 'subLote'] });
  }

  // RF65: Búsqueda paginada
  async findAllSensorsPaginated(pagination: PaginationDto, filters?: { tipoSensorId?: number; loteId?: number; estadoConexion?: string }) {
    const { page = 1, limit = 20, orderBy = 'nombre', orderDir = 'ASC', q } = pagination;

    const queryBuilder = this.sensorRepo.createQueryBuilder('sensor')
      .leftJoinAndSelect('sensor.tipoSensor', 'tipoSensor')
      .leftJoinAndSelect('sensor.lote', 'lote')
      .leftJoinAndSelect('sensor.subLote', 'subLote')
      .where('sensor.deletedAt IS NULL');

    if (filters?.tipoSensorId) {
      queryBuilder.andWhere('sensor.tipoSensorId = :tipoSensorId', { tipoSensorId: filters.tipoSensorId });
    }

    if (filters?.loteId) {
      queryBuilder.andWhere('sensor.loteId = :loteId', { loteId: filters.loteId });
    }

    if (filters?.estadoConexion) {
      queryBuilder.andWhere('sensor.estadoConexion = :estadoConexion', { estadoConexion: filters.estadoConexion });
    }

    // Búsqueda de texto
    if (q) {
      queryBuilder.andWhere(
        '(sensor.nombre ILIKE :q OR sensor.codigoDispositivo ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    // Paginación
    queryBuilder
      .orderBy(`sensor.${orderBy}`, orderDir.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findSensorById(id: number) {
    const sensor = await this.sensorRepo.findOne({ 
      where: { id }, 
      relations: ['tipoSensor', 'lote', 'subLote'] 
    });
    if (!sensor) throw new NotFoundException(`Sensor ${id} not found`);
    return sensor;
  }

  async onModuleInit() {
    // MQTT service will be initialized separately
  }

  async createSensor(data: CreateSensorDto, usuarioId: number) {
    const sensor = this.sensorRepo.create({
      ...data,
      estadoConexion: 'desconectado',
      creadoPorUsuarioId: usuarioId,
    });
    const savedSensor = await this.sensorRepo.save(sensor);

    // Emitir evento WebSocket
    this.iotGateway.broadcast('iot:sensors:created', savedSensor);

    return savedSensor;
  }

  async updateSensor(id: number, data: Partial<CreateSensorDto>) {
    const sensor = await this.findSensorById(id);
    Object.assign(sensor, data);
    const updatedSensor = await this.sensorRepo.save(sensor);

    // Emitir evento WebSocket
    this.iotGateway.broadcast('iot:sensors:updated', updatedSensor);

    return updatedSensor;
  }

  async removeSensor(id: number) {
    const sensor = await this.findSensorById(id);
    const removed = await this.sensorRepo.softRemove(sensor);

    // Emitir evento WebSocket
    this.iotGateway.broadcast('iot:sensors:deleted', removed);

    return removed;
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
    
    const lectura = this.lecturaRepo.create({
      sensorId: data.sensorId,
      valor: data.valor,
      fecha: new Date(),
    });
    
    const saved = await this.lecturaRepo.save(lectura);
    
    // RF34: Actualizar estado de conexión del sensor
    await this.updateSensorEstado(sensor, data.valor);
    
    // RF34: Emitir evento en tiempo real vía WebSocket
    if (gateway) {
      gateway.emitLectura(saved);
    }
    
    return saved;
  }

  // RF34: Actualizar estado de conexión basado en TTL
  private async updateSensorEstado(sensor: Sensor, valor: number) {
    const now = new Date();
    sensor.ultimaLectura = now;
    sensor.estadoConexion = 'conectado';
    
    // Validar umbrales si están configurados
    if (sensor.umbralMin !== null && valor < sensor.umbralMin) {
      sensor.estadoConexion = 'alerta_min';
    }
    
    if (sensor.umbralMax !== null && valor > sensor.umbralMax) {
      sensor.estadoConexion = 'alerta_max';
    }
    
    await this.sensorRepo.save(sensor);
  }

  // RF34: Calcular estado de conexión basado en TTL
  async calculateSensorStatus(sensor: Sensor): Promise<string> {
    if (!sensor.lastSeenAt) {
      return 'DESCONECTADO';
    }

    // Obtener TTL del tipo de sensor
    const tipoSensor = sensor.tipoSensor || await this.tipoSensorRepo.findOne({ 
      where: { id: sensor.tipoSensorId } 
    });

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
  // Ejecuta cada 5 minutos para detectar sensores offline/online
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateAllSensorsStatus() {
    this.logger.log('Iniciando actualización de estado de sensores IoT...');
    
    const sensores = await this.sensorRepo.find({ relations: ['tipoSensor'] });
    let actualizados = 0;
    
    for (const sensor of sensores) {
      const nuevoEstado = await this.calculateSensorStatus(sensor);
      if (sensor.estadoConexion !== nuevoEstado) {
        sensor.estadoConexion = nuevoEstado;
        await this.sensorRepo.save(sensor);
        actualizados++;
        this.logger.debug(`Sensor ${sensor.id} cambió a ${nuevoEstado}`);
      }
    }

    this.logger.log(`Estado de sensores actualizado: ${actualizados}/${sensores.length} cambiaron`);
    return { message: `${sensores.length} sensores procesados, ${actualizados} actualizados` };
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
  async getLecturasByRango(sensorId: number, fechaInicio: Date, fechaFin: Date) {
    return this.lecturaRepo
      .createQueryBuilder('lectura')
      .where('lectura.sensorId = :sensorId', { sensorId })
      .andWhere('lectura.timestamp >= :fechaInicio', { fechaInicio })
      .andWhere('lectura.timestamp <= :fechaFin', { fechaFin })
      .orderBy('lectura.timestamp', 'ASC')
      .getMany();
  }
}
