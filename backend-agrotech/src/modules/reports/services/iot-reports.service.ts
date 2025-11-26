import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from '../../iot/entities/sensor.entity';
import { SensorLectura } from '../../iot/entities/sensor-lectura.entity';
import { Cultivo } from '../../geo/entities/cultivo.entity';
import { CsvExportService } from './csv-export.service';

@Injectable()
export class IotReportsService {
  constructor(
    @InjectRepository(Sensor) private sensorRepo: Repository<Sensor>,
    @InjectRepository(SensorLectura) private lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    private csvService: CsvExportService,
  ) {}

  // RF44-RF46: Agregaciones de lecturas
  async getSensorAggregations(filters: {
    sensorId?: number;
    cultivoId?: number;
    from?: Date;
    to?: Date;
    interval?: 'hour' | 'day' | 'week';
  }) {
    const query = this.lecturaRepo.createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('AVG(lectura.valor)', 'avg')
      .addSelect('MIN(lectura.valor)', 'min')
      .addSelect('MAX(lectura.valor)', 'max')
      .addSelect('COUNT(*)', 'count');

    // Intervalo de tiempo para agrupación
    if (filters.interval === 'hour') {
      query.addSelect("DATE_TRUNC('hour', lectura.fecha)", 'timeBucket')
           .groupBy("DATE_TRUNC('hour', lectura.fecha)");
    } else if (filters.interval === 'week') {
      query.addSelect("DATE_TRUNC('week', lectura.fecha)", 'timeBucket')
           .groupBy("DATE_TRUNC('week', lectura.fecha)");
    } else {
      // Default day
      query.addSelect("DATE(lectura.fecha)", 'timeBucket')
           .groupBy("DATE(lectura.fecha)");
    }

    query.orderBy('timeBucket', 'ASC');

    if (filters.sensorId) {
      query.andWhere('lectura.sensorId = :sensorId', { sensorId: filters.sensorId });
    }

    if (filters.cultivoId) {
      query.andWhere('sensor.cultivoId = :cultivoId', { cultivoId: filters.cultivoId });
    }

    if (filters.from) {
      query.andWhere('lectura.fecha >= :from', { from: filters.from });
    }

    if (filters.to) {
      query.andWhere('lectura.fecha <= :to', { to: filters.to });
    }

    return query.getRawMany();
  }

  // RF47: Estadísticas fuera de rango
  async getOutOfRangeStats(sensorId: number) {
    const sensor = await this.sensorRepo.findOne({ where: { id: sensorId } });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');

    if (sensor.umbralMin === null && sensor.umbralMax === null) {
      return { message: 'Sensor sin umbrales configurados' };
    }

    const totalLecturas = await this.lecturaRepo.count({ where: { sensorId } });
    
    const query = this.lecturaRepo.createQueryBuilder('lectura')
      .where('lectura.sensorId = :sensorId', { sensorId });

    const conditions = [];
    if (sensor.umbralMin !== null) {
      conditions.push(`lectura.valor < ${sensor.umbralMin}`);
    }
    if (sensor.umbralMax !== null) {
      conditions.push(`lectura.valor > ${sensor.umbralMax}`);
    }

    if (conditions.length > 0) {
      query.andWhere(`(${conditions.join(' OR ')})`);
    }

    const fueraDeRango = await query.getCount();
    const porcentaje = totalLecturas > 0 ? (fueraDeRango / totalLecturas) * 100 : 0;

    return {
      sensorId,
      totalLecturas,
      fueraDeRango,
      porcentaje: parseFloat(porcentaje.toFixed(2)),
      umbrales: { min: sensor.umbralMin, max: sensor.umbralMax }
    };
  }

  // RF48: Uptime (Disponibilidad)
  // Calculado como % de tiempo que el sensor ha estado reportando vs tiempo total esperado
  // Simplificación: Basado en la última vez visto vs ahora
  async getUptimeStats(sensorId: number) {
    const sensor = await this.sensorRepo.findOne({ 
      where: { id: sensorId },
      relations: ['tipoSensor']
    });
    if (!sensor) throw new NotFoundException('Sensor no encontrado');

    // Si nunca se ha visto, uptime 0
    if (!sensor.lastSeenAt) return { uptime: 0, status: 'NEVER_SEEN' };

    const now = new Date().getTime();
    const lastSeen = new Date(sensor.lastSeenAt).getTime();
    const diffMinutes = (now - lastSeen) / (1000 * 60);
    
    // TTL esperado (default 5 min)
    const ttl = sensor.tipoSensor?.ttlMinutos || 5;

    // Estado actual
    const isOnline = diffMinutes <= ttl;

    // Para un cálculo histórico real de uptime necesitaríamos un log de estados de conexión.
    // Por ahora retornamos el estado actual y el tiempo desde la última conexión.
    return {
      sensorId,
      isOnline,
      lastSeenAt: sensor.lastSeenAt,
      minutesSinceLastSeen: Math.round(diffMinutes),
      ttlExpected: ttl
    };
  }

  // RF49: Sparklines para dashboard (últimas N lecturas)
  async getSparkline(sensorId: number, limit: number = 20) {
    return this.lecturaRepo.find({
      where: { sensorId },
      order: { fecha: 'DESC' },
      take: limit,
      select: ['fecha', 'valor']
    });
  }

  // RF50: Dashboard General
  async getDashboardStats() {
    const totalSensores = await this.sensorRepo.count();
    const sensoresActivos = await this.sensorRepo.count({ where: { activo: true } });
    
    // Sensores con alertas (estadoConexion contiene 'alerta')
    const alertas = await this.sensorRepo.createQueryBuilder('sensor')
      .where('sensor.estadoConexion LIKE :alerta', { alerta: '%alerta%' })
      .getCount();

    return {
      totalSensores,
      sensoresActivos,
      alertasActivas: alertas,
      timestamp: new Date()
    };
  }


  // RF50: Comparativa de sensores
  async getSensorComparison(filters: {
    tipoSensorId?: number;
    cultivoId?: number;
    from?: Date;
    to?: Date;
    metric: 'avg' | 'min' | 'max';
    limit?: number;
  }) {
    const metricFunc = filters.metric === 'min' ? 'MIN' : filters.metric === 'max' ? 'MAX' : 'AVG';
    
    const query = this.lecturaRepo.createQueryBuilder('lectura')
      .leftJoin('lectura.sensor', 'sensor')
      .select('sensor.id', 'sensorId')
      .addSelect('sensor.nombre', 'nombreSensor')
      .addSelect(`${metricFunc}(lectura.valor)`, 'value')
      .groupBy('sensor.id')
      .addGroupBy('sensor.nombre')
      .orderBy('value', 'DESC');

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.tipoSensorId) {
      query.andWhere('sensor.tipoSensorId = :tipoId', { tipoId: filters.tipoSensorId });
    }
    if (filters.cultivoId) {
      query.andWhere('sensor.cultivoId = :cultId', { cultId: filters.cultivoId });
    }
    if (filters.from) {
      query.andWhere('lectura.fecha >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('lectura.fecha <= :to', { to: filters.to });
    }

    return query.getRawMany();
  }

  async getIotReportCsv(type: 'aggregation' | 'comparison', filters: any): Promise<string> {
    let data = [];
    let columns = [];

    if (type === 'aggregation') {
      data = await this.getSensorAggregations(filters);
      columns = ['timeBucket', 'avg', 'min', 'max', 'count'];
    } else {
      data = await this.getSensorComparison(filters as any);
      columns = ['sensorId', 'nombreSensor', 'value'];
    }

    return this.csvService.generateCsv(data, columns);
  }
}
