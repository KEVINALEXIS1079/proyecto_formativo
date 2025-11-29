import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../../activities/entities/actividad.entity';
import { ActividadResponsable } from '../../activities/entities/actividad-responsable.entity';
import { ActividadInsumoUso } from '../../activities/entities/actividad-insumo-uso.entity';
import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { CsvExportService } from './csv-export.service';

@Injectable()
export class CropReportsService {
  constructor(
    @InjectRepository(Actividad) private actividadRepo: Repository<Actividad>,
    @InjectRepository(ActividadResponsable)
    private responsableRepo: Repository<ActividadResponsable>,
    @InjectRepository(ActividadInsumoUso)
    private insumoUsoRepo: Repository<ActividadInsumoUso>,
    @InjectRepository(MovimientoInsumo)
    private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    private csvService: CsvExportService,
  ) {}

  // RF52: Resumen Histórico del Cultivo
  async getCropSummary(cultivoId: number) {
    const cultivo = await this.cultivoRepo.findOne({
      where: { id: cultivoId },
    });
    if (!cultivo) throw new NotFoundException('Cultivo no encontrado');

    const actividades = await this.actividadRepo.find({ where: { cultivoId } });

    const totalActividades = actividades.length;
    const totalHoras = actividades.reduce(
      (sum, a) => sum + (a.horasActividad || 0),
      0,
    );

    const costos = actividades.reduce(
      (acc, a) => ({
        manoObra: acc.manoObra + (a.costoManoObra || 0),
        // Nota: Para servicios e insumos deberíamos sumar de las relaciones,
        // pero si no están cargadas, esto podría ser 0.
        // Asumiremos que se calculan en otro lado o se agregan aquí si se cargan las relaciones.
        // Para simplificar, haremos queries agregadas separadas.
      }),
      { manoObra: 0 },
    );

    // Costos agregados
    const { totalServicios } = await this.actividadRepo
      .createQueryBuilder('actividad')
      .leftJoin('actividad.servicios', 'servicio')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();

    const { totalInsumos } = await this.insumoUsoRepo
      .createQueryBuilder('insumoUso')
      .leftJoin('insumoUso.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(insumoUso.costoTotal)', 'totalInsumos')
      .getRawOne();

    return {
      cultivo: { id: cultivo.id, nombre: cultivo.nombreCultivo },
      resumen: {
        totalActividades,
        totalHoras,
        costos: {
          manoObra: costos.manoObra,
          servicios: parseFloat(totalServicios || '0'),
          insumos: parseFloat(totalInsumos || '0'),
          total:
            costos.manoObra +
            parseFloat(totalServicios || '0') +
            parseFloat(totalInsumos || '0'),
        },
      },
    };
  }

  // RF53: Conteo de actividades por tipo/subtipo
  async getActivityStats(cultivoId: number) {
    return this.actividadRepo
      .createQueryBuilder('actividad')
      .select('actividad.tipo', 'tipo')
      .addSelect('actividad.subtipo', 'subtipo')
      .addSelect('COUNT(*)', 'count')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .groupBy('actividad.tipo')
      .addGroupBy('actividad.subtipo')
      .getRawMany();
  }

  // RF55: Horas por responsable
  async getLaborStats(cultivoId: number) {
    return this.responsableRepo
      .createQueryBuilder('resp')
      .leftJoin('resp.actividad', 'actividad')
      .leftJoin('resp.usuario', 'usuario')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'usuario.nombre as nombre',
        'usuario.apellido as apellido',
        'SUM(resp.horas) as totalHoras',
        'SUM(resp.costo) as totalCosto',
      ])
      .groupBy('usuario.id')
      .orderBy('totalHoras', 'DESC')
      .getRawMany();
  }

  // RF56-RF59: Análisis de Insumos
  async getInputStats(cultivoId: number) {
    return this.insumoUsoRepo
      .createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .leftJoin('uso.insumo', 'insumo')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'insumo.nombre as nombreInsumo',
        'insumo.unidadUso as unidad',
        'SUM(uso.cantidadUso) as cantidadTotal',
        'SUM(uso.costoTotal) as costoTotal',
        'COUNT(DISTINCT actividad.id) as numActividades',
      ])
      .groupBy('insumo.id')
      .orderBy('costoTotal', 'DESC')
      .getRawMany();
  }

  // RF61: Validación de Coherencia
  async validateConsistency(cultivoId: number) {
    // 1. Consumidos en actividades por insumo (suma + actividades involucradas + costo si aplica)
    const consumosActividad = await this.insumoUsoRepo
      .createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'uso.insumoId as "insumoId"',
        'COALESCE(SUM(uso.cantidadUso), 0) as "totalActividad"',
        'COALESCE(SUM(uso.costoTotal), 0) as "totalCostoActividad"',
        'string_agg(DISTINCT uso."actividadId"::text, \',\') as "actividadIds"',
      ])
      .groupBy('uso.insumoId')
      .getRawMany();

    // 2. Movimientos de inventario tipo CONSUMO vinculados a actividades de este cultivo
    const movimientosConsumo = await this.movimientoRepo
      .createQueryBuilder('mov')
      .leftJoin('mov.insumo', 'insumo')
      .where('mov.tipo = :tipo', { tipo: 'CONSUMO' })
      .andWhere((subQuery) => {
        return (
          'mov.actividadId IN ' +
          subQuery
            .subQuery()
            .select('a.id')
            .from('actividades', 'a')
            .where('"cultivoId" = :cultivoId', { cultivoId })
            .getQuery()
        );
      })
      .select([
        'mov.insumoId as "insumoId"',
        'insumo.nombre as "nombreInsumo"',
        'COALESCE(SUM(mov.cantidadUso), 0) as "totalMovimientos"',
        'COALESCE(SUM(mov.costoTotal), 0) as "totalCostoMovimientos"',
        'string_agg(DISTINCT mov.id::text, \',\') as "movimientoIds"',
      ])
      .groupBy('mov.insumoId')
      .addGroupBy('insumo.nombre')
      .getRawMany();

    // 3. Comparar
    const diferencias: any[] = [];

    // Mapear movimientos por insumo
    const movMap = new Map<
      string,
      {
        total: number;
        totalCosto: number;
        nombre?: string;
        movimientoIds?: string;
      }
    >();
    movimientosConsumo.forEach((m: any) =>
      movMap.set(String(m.insumoId), {
        total: Number(m.totalMovimientos ?? 0),
        totalCosto: Number(m.totalCostoMovimientos ?? 0),
        nombre: m.nombreInsumo,
        movimientoIds: m.movimientoIds, // comma-separated string or null
      }),
    );

    for (const uso of consumosActividad) {
      const insumoId = String(uso.insumoId);
      // Normalizar valores: si vienen null/undefined -> 0
      const totalAct = Number(uso.totalActividad ?? 0);
      const totalCostoAct = Number(uso.totalCostoActividad ?? 0);
      const actividadIds = uso.actividadIds
        ? uso.actividadIds.split(',').filter(Boolean).map(Number)
        : [];

      const movData = movMap.get(insumoId);

      if (!movData) {
        diferencias.push({
          insumoId,
          mensaje: 'Registrado en actividad pero sin movimiento de inventario',
          cantidadActividad: totalAct,
          cantidadInventario: 0,
          costoActividad: totalCostoAct,
          costoInventario: 0,
          actividadesImplicadas: actividadIds,
          movimientosImplicados: [],
        });
      } else {
        const diffCantidad = totalAct - movData.total;
        const diffCosto = totalCostoAct - movData.totalCosto;
        if (Math.abs(diffCantidad) > 0.001 || Math.abs(diffCosto) > 0.01) {
          diferencias.push({
            insumoId,
            nombre: movData.nombre,
            mensaje: 'Diferencia en cantidad y/o costo',
            cantidadActividad: totalAct,
            cantidadInventario: movData.total,
            diferenciaCantidad: diffCantidad,
            costoActividad: totalCostoAct,
            costoInventario: movData.totalCosto,
            diferenciaCosto: diffCosto,
            actividadesImplicadas: actividadIds,
            movimientosImplicados: movData.movimientoIds
              ? movData.movimientoIds.split(',').filter(Boolean).map(Number)
              : [],
          });
        }
        movMap.delete(insumoId);
      }
    }

    // Movimientos restantes sin uso registrado
    movMap.forEach((val, key) => {
      diferencias.push({
        insumoId: key,
        nombre: val.nombre,
        mensaje:
          'Movimiento de inventario sin registro en detalle de actividad',
        cantidadActividad: 0,
        cantidadInventario: val.total,
        costoActividad: 0,
        costoInventario: val.totalCosto,
        actividadesImplicadas: [],
        movimientosImplicados: val.movimientoIds
          ? val.movimientoIds.split(',').filter(Boolean).map(Number)
          : [],
      });
    });

    return {
      esCoherente: diferencias.length === 0,
      diferencias,
    };
  }

  // RF54: Horas invertidas por periodo
  async getHoursByPeriod(
    cultivoId: number,
    granularity: 'day' | 'week' | 'month' = 'week',
  ) {
    const query = this.actividadRepo
      .createQueryBuilder('actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(actividad.horasActividad)', 'totalHoras')
      .addSelect('COUNT(*)', 'count');

    if (granularity === 'day') {
      query
        .addSelect('DATE(actividad.fecha)', 'period')
        .groupBy('DATE(actividad.fecha)');
    } else if (granularity === 'month') {
      query
        .addSelect("TO_CHAR(actividad.fecha, 'YYYY-MM')", 'period')
        .groupBy("TO_CHAR(actividad.fecha, 'YYYY-MM')");
    } else {
      query
        .addSelect("DATE_TRUNC('week', actividad.fecha)", 'period')
        .groupBy("DATE_TRUNC('week', actividad.fecha)");
    }

    return query.orderBy('period', 'ASC').getRawMany();
  }

  // RF57: Consumo de insumos por periodo
  async getInsumosByPeriod(
    cultivoId: number,
    granularity: 'day' | 'week' | 'month' = 'week',
  ) {
    const query = this.insumoUsoRepo
      .createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(uso.costoTotal)', 'costoTotal')
      .addSelect('SUM(uso.cantidadUso)', 'cantidadTotal');

    if (granularity === 'day') {
      query
        .addSelect('DATE(actividad.fecha)', 'period')
        .groupBy('DATE(actividad.fecha)');
    } else if (granularity === 'month') {
      query
        .addSelect("TO_CHAR(actividad.fecha, 'YYYY-MM')", 'period')
        .groupBy("TO_CHAR(actividad.fecha, 'YYYY-MM')");
    } else {
      query
        .addSelect("DATE_TRUNC('week', actividad.fecha)", 'period')
        .groupBy("DATE_TRUNC('week', actividad.fecha)");
    }

    return query.orderBy('period', 'ASC').getRawMany();
  }

  // RF58: Detalle de actividades con costos
  async getActivityDetails(cultivoId: number) {
    return this.actividadRepo
      .createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.servicios', 'servicios')
      .leftJoinAndSelect('actividad.insumosUso', 'insumos')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .orderBy('actividad.fecha', 'DESC')
      .getMany()
      .then((actividades) =>
        actividades.map((a) => {
          const costoServicios =
            a.servicios?.reduce((sum, s) => sum + Number(s.costo), 0) || 0;
          const costoInsumos =
            a.insumosUso?.reduce((sum, i) => sum + Number(i.costoTotal), 0) ||
            0;
          const costoMO = Number(a.costoManoObra) || 0;
          return {
            id: a.id,
            fecha: a.fecha,
            tipo: a.tipo,
            subtipo: a.subtipo,
            nombre: a.nombre, // Added name
            horas: a.horasActividad,
            costoMO,
            costoServicios,
            costoInsumos,
            costoTotal: costoMO + costoServicios + costoInsumos,
          };
        }),
      );
  }

  // RF60: Exportación CSV
  async getCropHistoryCsv(
    cultivoId: number,
    type: 'summary' | 'activities' | 'insumos',
  ): Promise<string> {
    let data = [];
    let columns = [];

    if (type === 'activities') {
      data = await this.getActivityDetails(cultivoId);
      columns = [
        'id',
        'fecha',
        'tipo',
        'subtipo',
        'horas',
        'costoMO',
        'costoServicios',
        'costoInsumos',
        'costoTotal',
      ];
    } else if (type === 'insumos') {
      data = await this.getInputStats(cultivoId);
      columns = [
        'nombreInsumo',
        'unidad',
        'cantidadTotal',
        'costoTotal',
        'numActividades',
      ];
    } else {
      // Summary
      const summary = await this.getCropSummary(cultivoId);
      data = [
        {
          cultivo: summary.cultivo.nombre,
          actividades: summary.resumen.totalActividades,
          horas: summary.resumen.totalHoras,
          costoMO: summary.resumen.costos.manoObra,
          costoServicios: summary.resumen.costos.servicios,
          costoInsumos: summary.resumen.costos.insumos,
          total: summary.resumen.costos.total,
        },
      ];
      columns = [
        'cultivo',
        'actividades',
        'horas',
        'costoMO',
        'costoServicios',
        'costoInsumos',
        'total',
      ];
    }

    return this.csvService.generateCsv(data, columns);
  }
}
