import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../entities/sensor.entity';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { CreateSensorDto } from '../dtos/create-sensor.dto';
import { CreateSensorLecturaDto } from '../dtos/create-sensor-lectura.dto';
import { IotGateway } from '../gateways/iot.gateway';

@Injectable()
export class IotService {
  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura) private lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(TipoSensor) private tipoSensorRepo: Repository<TipoSensor>,
  ) {}

  // ==================== TIPO SENSOR ====================
  
  async findAllTiposSensor() {
    return this.tipoSensorRepo.find();
  }

  async createTipoSensor(data: { nombre: string; unidad: string; descripcion?: string }) {
    const tipo = this.tipoSensorRepo.create(data);
    return this.tipoSensorRepo.save(tipo);
  }

  // ==================== SENSORES ====================
  
  // RF32: CRUD de sensores
  async findAllSensors() {
    return this.sensorRepo.find({ relations: ['tipoSensor', 'cultivo'] });
  }

  async findSensorById(id: number) {
    const sensor = await this.sensorRepo.findOne({ 
      where: { id }, 
      relations: ['tipoSensor', 'cultivo'] 
    });
    if (!sensor) throw new NotFoundException(`Sensor ${id} not found`);
    return sensor;
  }

  async createSensor(data: CreateSensorDto, usuarioId: number) {
    const sensor = this.sensorRepo.create({
      ...data,
      estadoConexion: 'desconectado',
      creadoPorUsuarioId: usuarioId,
    });
    return this.sensorRepo.save(sensor);
  }

  async updateSensor(id: number, data: Partial<CreateSensorDto>) {
    const sensor = await this.findSensorById(id);
    Object.assign(sensor, data);
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
    sensor.lastSeenAt = now;
    sensor.estadoConexion = 'CONECTADO';
    
    // Validar umbrales si están configurados
    if (sensor.umbralMin !== null && valor < sensor.umbralMin) {
      sensor.estadoConexion = 'ALERTA_MIN';
    }
    
    if (sensor.umbralMax !== null && valor > sensor.umbralMax) {
      sensor.estadoConexion = 'ALERTA_MAX';
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
