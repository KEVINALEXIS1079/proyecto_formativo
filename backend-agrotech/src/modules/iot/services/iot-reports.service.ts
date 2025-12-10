import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { SensorLectura } from '../entities/sensor-lectura.entity';
import { Sensor } from '../entities/sensor.entity';
import { TipoSensor } from '../entities/tipo-sensor.entity';
import { Lote } from '../../geo/entities/lote.entity';

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class IotReportsService {
  constructor(
    @InjectRepository(SensorLectura)
    private readonly lecturaRepo: Repository<SensorLectura>,
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(TipoSensor)
    private readonly tipoSensorRepo: Repository<TipoSensor>,
    @InjectRepository(Lote)
    private readonly loteRepo: Repository<Lote>,
  ) {}

  private resolveRange({ startDate, endDate }: DateRangeParams) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return { start, end };
  }

  async getGeneralReport(params: {
    loteId?: number;
    startDate?: string;
    endDate?: string;
    sensorId?: number;
  }) {
    const { start, end } = this.resolveRange(params);
    const qb = this.lecturaRepo
      .createQueryBuilder('lectura')
      .innerJoin('lectura.sensor', 'sensor')
      .leftJoin('sensor.tipoSensor', 'tipoSensor')
      .leftJoin('sensor.lote', 'lote')
      .andWhere('tipoSensor.nombre != :pumpStatus', { pumpStatus: 'ESTADO_BOMBA' })
      .andWhere("NOT (lectura.valor LIKE '{%}')")
      .andWhere("NOT (lectura.valor ~ '^[a-zA-Z]+$')");

    if (params.loteId) qb.andWhere('sensor.loteId = :loteId', { loteId: params.loteId });
    if (params.sensorId) qb.andWhere('sensor.id = :sensorId', { sensorId: params.sensorId });
    if (start) qb.andWhere('lectura.fechaLectura >= :start', { start });
    if (end) qb.andWhere('lectura.fechaLectura <= :end', { end });

    const rows = await qb
      .select([
        'sensor.id AS "sensorId"',
        'sensor.nombre AS "sensorNombre"',
        'tipoSensor.nombre AS "tipoSensor"',
        'tipoSensor.unidad AS unidad',
        'sensor.loteId AS "loteId"',
        'lote.nombre AS "loteNombre"',
        'AVG(CAST(lectura.valor AS FLOAT)) AS "promedioValor"',
        'MIN(CAST(lectura.valor AS FLOAT)) AS "valorMinimo"',
        'MAX(CAST(lectura.valor AS FLOAT)) AS "valorMaximo"',
        'COUNT(*) AS "totalLecturas"',
      ])
      .groupBy('sensor.id')
      .addGroupBy('tipoSensor.id')
      .addGroupBy('lote.id')
      .getRawMany();

    const firstRow = rows[0];
    return {
      loteId: params.loteId ?? firstRow?.loteId ?? null,
      loteNombre: firstRow?.loteNombre ?? null,
      startDate: start ? start.toISOString().split('T')[0] : params.startDate ?? null,
      endDate: end ? end.toISOString().split('T')[0] : params.endDate ?? null,
      sensores: rows.map((r) => ({
        sensorId: Number(r.sensorId),
        sensorNombre: r.sensorNombre,
        tipoSensor: r.tipoSensor,
        unidad: r.unidad,
        promedioValor: r.promedioValor ? parseFloat(r.promedioValor) : null,
        valorMinimo: r.valorMinimo ? parseFloat(r.valorMinimo) : null,
        valorMaximo: r.valorMaximo ? parseFloat(r.valorMaximo) : null,
        totalLecturas: Number(r.totalLecturas),
      })),
    };
  }

  async getComparison(params: {
    loteIds: number[];
    tipoSensorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { start, end } = this.resolveRange(params);
    const qb = this.lecturaRepo
      .createQueryBuilder('lectura')
      .innerJoin('lectura.sensor', 'sensor')
      .leftJoin('sensor.tipoSensor', 'tipoSensor')
      .leftJoin('sensor.lote', 'lote')
      .where('sensor.loteId IN (:...loteIds)', { loteIds: params.loteIds })
      .andWhere('tipoSensor.nombre != :pumpStatus', { pumpStatus: 'ESTADO_BOMBA' });

    if (params.tipoSensorId) qb.andWhere('sensor.tipoSensorId = :tipoSensorId', { tipoSensorId: params.tipoSensorId });
    if (start) qb.andWhere('lectura.fechaLectura >= :start', { start });
    if (end) qb.andWhere('lectura.fechaLectura <= :end', { end });

    const rows = await qb
      .select([
        'sensor.loteId AS "loteId"',
        'lote.nombre AS "loteNombre"',
        'tipoSensor.nombre AS "tipoSensor"',
        'tipoSensor.unidad AS unidad',
        'AVG(CAST(lectura.valor AS FLOAT)) AS promedio',
        'MIN(CAST(lectura.valor AS FLOAT)) AS minimo',
        'MAX(CAST(lectura.valor AS FLOAT)) AS maximo',
        'COUNT(*) AS "totalLecturas"',
      ])
      .groupBy('sensor.loteId')
      .addGroupBy('lote.id')
      .addGroupBy('tipoSensor.id')
      .getRawMany();

    const first = rows[0];
    return {
      tipoSensor: first?.tipoSensor ?? null,
      unidad: first?.unidad ?? null,
      lotes: rows.map((r) => ({
        loteId: Number(r.loteId),
        loteNombre: r.loteNombre,
        promedio: r.promedio ? parseFloat(r.promedio) : null,
        minimo: r.minimo ? parseFloat(r.minimo) : null,
        maximo: r.maximo ? parseFloat(r.maximo) : null,
        totalLecturas: Number(r.totalLecturas),
      })),
    };
  }

  async getSensorLecturas(
    sensorId: number,
    params: { limit?: number; startDate?: string; endDate?: string },
  ) {
    const { start, end } = this.resolveRange(params);
    const limit = params.limit && params.limit > 0 ? params.limit : 100;

    const qb = this.lecturaRepo
      .createQueryBuilder('lectura')
      .where('lectura.sensorId = :sensorId', { sensorId });

    if (start) qb.andWhere('lectura.fechaLectura >= :start', { start });
    if (end) qb.andWhere('lectura.fechaLectura <= :end', { end });

    const rows = await qb
      .orderBy('lectura.fechaLectura', 'DESC')
      .take(limit)
      .getMany();

    return rows.map((r) => ({
      id: r.id,
      sensorId: r.sensorId,
      valor: r.valor,
      fechaLectura: r.fechaLectura,
    }));
  }

  async getLotAnalytics(params: {
    loteId: number;
    subLoteId?: number;
    sensorId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { start, end } = this.resolveRange(params);
    const sensors = await this.sensorRepo.find({
      where: {
        loteId: params.loteId,
        ...(params.subLoteId ? { subLoteId: params.subLoteId } : {}),
        ...(params.sensorId ? { id: params.sensorId } : {}),
        tipoSensor: {
          nombre: Not('ESTADO_BOMBA'),
        },
      },
      relations: ['tipoSensor'],
    });

    const sensores = [];

    for (const sensor of sensors) {
      const qb = this.lecturaRepo
        .createQueryBuilder('lectura')
        .where('lectura.sensorId = :sensorId', { sensorId: sensor.id });

      if (start) qb.andWhere('lectura.fechaLectura >= :start', { start });
      if (end) qb.andWhere('lectura.fechaLectura <= :end', { end });

      const stats = await qb
        .select([
          'AVG(CAST(lectura.valor AS FLOAT)) AS promedio',
          'MIN(CAST(lectura.valor AS FLOAT)) AS minimo',
          'MAX(CAST(lectura.valor AS FLOAT)) AS maximo',
          'COUNT(*) AS totalLecturas',
        ])
        .getRawOne();

      const minRow = await qb
        .clone()
        .orderBy('CAST(lectura.valor AS FLOAT)', 'ASC')
        .addOrderBy('lectura.fechaLectura', 'ASC')
        .getOne();
      const maxRow = await qb
        .clone()
        .orderBy('CAST(lectura.valor AS FLOAT)', 'DESC')
        .addOrderBy('lectura.fechaLectura', 'ASC')
        .getOne();

      const seriesRows = await qb
        .clone()
        .select(['lectura.fechaLectura', 'lectura.valor'])
        .orderBy('lectura.fechaLectura', 'ASC')
        .getMany();

      // Desviacion estandar manual
      const values = seriesRows.map((r) => Number(r.valor)).filter((v) => !isNaN(v));
      const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const variance =
        values.length > 1
          ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length
          : 0;
      const desviacionEstandar = Math.sqrt(variance);

      sensores.push({
        sensorId: sensor.id,
        nombre: sensor.nombre,
        tipo: sensor.tipoSensor?.nombre || '',
        estadisticas: {
          promedio: stats?.promedio ? parseFloat(stats.promedio) : null,
          minimo: stats?.minimo ? parseFloat(stats.minimo) : null,
          minimoFecha: minRow?.fechaLectura ?? null,
          maximo: stats?.maximo ? parseFloat(stats.maximo) : null,
          maximoFecha: maxRow?.fechaLectura ?? null,
          desviacionEstandar: Number.isFinite(desviacionEstandar) ? +desviacionEstandar.toFixed(2) : null,
          totalLecturas: stats?.totalLecturas ? Number(stats.totalLecturas) : 0,
        },
        series: seriesRows.map((r) => ({
          fecha: r.fechaLectura,
          valor: Number(r.valor),
        })),
      });
    }

    return {
      loteId: params.loteId,
      subLoteId: params.subLoteId ?? null,
      sensores,
    };
  }
}
