import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from '../../activities/entities/actividad.entity';
import { ActividadResponsable } from '../../activities/entities/actividad-responsable.entity';
import { ActividadInsumoUso } from '../../activities/entities/actividad-insumo-uso.entity';
import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';
import { Insumo } from '../../inventory/entities/insumo.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';

@Injectable()
export class CropReportsService {
  constructor(
    @InjectRepository(Actividad) private actividadRepo: Repository<Actividad>,
    @InjectRepository(ActividadResponsable) private responsableRepo: Repository<ActividadResponsable>,
    @InjectRepository(ActividadInsumoUso) private insumoUsoRepo: Repository<ActividadInsumoUso>,
    @InjectRepository(MovimientoInsumo) private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Insumo) private insumoRepo: Repository<Insumo>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
  ) {}

  // RF52: Resumen Histórico del Cultivo
  async getCropSummary(cultivoId: number) {
    const cultivo = await this.cultivoRepo.findOne({ where: { id: cultivoId } });
    if (!cultivo) throw new NotFoundException('Cultivo no encontrado');

    const actividades = await this.actividadRepo.find({ where: { cultivoId } });
    
    const totalActividades = actividades.length;
    const totalHoras = actividades.reduce((sum, a) => sum + (a.horasActividad || 0), 0);
    
    const costos = actividades.reduce((acc, a) => ({
      manoObra: acc.manoObra + (a.costoManoObra || 0),
      // Nota: Para servicios e insumos deberíamos sumar de las relaciones, 
      // pero si no están cargadas, esto podría ser 0. 
      // Asumiremos que se calculan en otro lado o se agregan aquí si se cargan las relaciones.
      // Para simplificar, haremos queries agregadas separadas.
    }), { manoObra: 0 });

    // Costos agregados
    const { totalServicios } = await this.actividadRepo.createQueryBuilder('actividad')
      .leftJoin('actividad.servicios', 'servicio')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();

    const { totalInsumos } = await this.insumoUsoRepo.createQueryBuilder('insumoUso')
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
          total: costos.manoObra + parseFloat(totalServicios || '0') + parseFloat(totalInsumos || '0')
        }
      }
    };
  }

  // RF53: Conteo de actividades por tipo/subtipo
  async getActivityStats(cultivoId: number) {
    return this.actividadRepo.createQueryBuilder('actividad')
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
    return this.responsableRepo.createQueryBuilder('resp')
      .leftJoin('resp.actividad', 'actividad')
      .leftJoin('resp.usuario', 'usuario')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'usuario.nombre as nombre',
        'usuario.apellido as apellido',
        'SUM(resp.horas) as totalHoras',
        'SUM(resp.costo) as totalCosto'
      ])
      .groupBy('usuario.id')
      .orderBy('totalHoras', 'DESC')
      .getRawMany();
  }

  // RF56-RF59: Análisis de Insumos
  async getInputStats(cultivoId: number) {
    return this.insumoUsoRepo.createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .leftJoin('uso.insumo', 'insumo')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'insumo.nombre as nombreInsumo',
        'insumo.unidadUso as unidad',
        'SUM(uso.cantidadUso) as cantidadTotal',
        'SUM(uso.costoTotal) as costoTotal',
        'COUNT(DISTINCT actividad.id) as numActividades'
      ])
      .groupBy('insumo.id')
      .orderBy('costoTotal', 'DESC')
      .getRawMany();
  }

  // RF54: Horas invertidas por periodo
  async getLaborByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month' = 'day') {
    let dateFormat: string;
    switch (granularity) {
      case 'week':
        dateFormat = "DATE_TRUNC('week', actividad.fecha)";
        break;
      case 'month':
        dateFormat = "DATE_TRUNC('month', actividad.fecha)";
        break;
      default:
        dateFormat = "DATE(actividad.fecha)";
    }

    return this.actividadRepo.createQueryBuilder('actividad')
      .select(`${dateFormat}`, 'periodo')
      .addSelect('SUM(actividad.horasActividad)', 'totalHoras')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .groupBy(dateFormat)
      .orderBy('periodo', 'ASC')
      .getRawMany();
  }

  // RF57: Consumo de insumos por periodo
  async getInputConsumptionByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month' = 'day') {
    let dateFormat: string;
    switch (granularity) {
      case 'week':
        dateFormat = "DATE_TRUNC('week', actividad.fecha)";
        break;
      case 'month':
        dateFormat = "DATE_TRUNC('month', actividad.fecha)";
        break;
      default:
        dateFormat = "DATE(actividad.fecha)";
    }

    return this.insumoUsoRepo.createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .leftJoin('uso.insumo', 'insumo')
      .select(`${dateFormat}`, 'periodo')
      .addSelect('insumo.nombre', 'nombreInsumo')
      .addSelect('SUM(uso.cantidadUso)', 'cantidadTotal')
      .addSelect('SUM(uso.costoTotal)', 'costoTotal')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .groupBy(dateFormat)
      .addGroupBy('insumo.nombre')
      .orderBy('periodo', 'ASC')
      .getRawMany();
  }

  // RF58: Detalle de actividades con costos
  async getDetailedActivities(cultivoId: number, filters?: { from?: Date; to?: Date }) {
    const query = this.actividadRepo.createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.responsables', 'responsables')
      .leftJoinAndSelect('actividad.servicios', 'servicios')
      .leftJoinAndSelect('actividad.insumosUso', 'insumosUso')
      .where('actividad.cultivoId = :cultivoId', { cultivoId });

    if (filters?.from) {
      query.andWhere('actividad.fecha >= :from', { from: filters.from });
    }
    if (filters?.to) {
      query.andWhere('actividad.fecha <= :to', { to: filters.to });
    }

    const actividades = await query.orderBy('actividad.fecha', 'DESC').getMany();

    // Obtener información de insumos por separado para evitar dependencia circular
    const insumoIds = actividades.flatMap(a => a.insumosUso?.map(i => i.insumoId) || []);
    const insumosMap = new Map();

    if (insumoIds.length > 0) {
      const insumos = await this.insumoRepo.findByIds(insumoIds);
      insumos.forEach(i => insumosMap.set(i.id, i));
    }

    return actividades.map(actividad => ({
      id: actividad.id,
      fecha: actividad.fecha,
      tipo: actividad.tipo,
      subtipo: actividad.subtipo,
      descripcion: actividad.descripcion,
      horas: actividad.horasActividad,
      costoManoObra: actividad.costoManoObra,
      costoServicios: actividad.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0,
      costoInsumos: actividad.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0,
      costoTotal: actividad.costoManoObra +
                 (actividad.servicios?.reduce((sum, s) => sum + s.costo, 0) || 0) +
                 (actividad.insumosUso?.reduce((sum, i) => sum + i.costoTotal, 0) || 0),
      responsables: actividad.responsables?.map(r => ({
        nombre: `${r.usuario?.nombre} ${r.usuario?.apellido}`,
        horas: r.horas,
        costo: r.costo
      })),
      insumos: actividad.insumosUso?.map(i => {
        const insumo = insumosMap.get(i.insumoId);
        return {
          nombre: insumo?.nombre || `Insumo ${i.insumoId}`,
          cantidad: i.cantidadUso,
          unidad: insumo?.unidadUso || 'unidades',
          costo: i.costoTotal
        };
      })
    }));
  }

  // RF59: Top insumos por costo/cantidad
  async getTopInputs(cultivoId: number, limit: number = 10, sortBy: 'costo' | 'cantidad' = 'costo') {
    const query = this.insumoUsoRepo.createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .leftJoin('uso.insumo', 'insumo')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select([
        'insumo.nombre as nombreInsumo',
        'insumo.unidadUso as unidad',
        'SUM(uso.cantidadUso) as cantidadTotal',
        'SUM(uso.costoTotal) as costoTotal',
        'COUNT(DISTINCT actividad.id) as numActividades'
      ])
      .groupBy('insumo.id')
      .addGroupBy('insumo.nombre')
      .addGroupBy('insumo.unidadUso');

    if (sortBy === 'costo') {
      query.orderBy('SUM(uso.costoTotal)', 'DESC');
    } else {
      query.orderBy('SUM(uso.cantidadUso)', 'DESC');
    }

    query.limit(limit);

    return query.getRawMany();
  }

  // Obtener cultivos filtrados
  async getCultivosFiltered(filters: { id?: number; fechaInicio?: Date; fechaFin?: Date }) {
    const query = this.cultivoRepo.createQueryBuilder('cultivo');

    if (filters.id) {
      query.andWhere('cultivo.id = :id', { id: filters.id });
    }

    // Si hay fechas, filtrar cultivos que tengan actividades en ese rango
    if (filters.fechaInicio || filters.fechaFin) {
      query.leftJoin('cultivo.actividades', 'actividad');
      if (filters.fechaInicio) {
        query.andWhere('actividad.fecha >= :fechaInicio', { fechaInicio: filters.fechaInicio });
      }
      if (filters.fechaFin) {
        query.andWhere('actividad.fecha <= :fechaFin', { fechaFin: filters.fechaFin });
      }
    }

    return query.getMany();
  }

  // RF61: Validación de Coherencia
  async validateConsistency(cultivoId: number) {
    // 1. Obtener suma de consumos reportados en actividades
    const consumosActividad = await this.insumoUsoRepo.createQueryBuilder('uso')
      .leftJoin('uso.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select(['uso.insumoId as insumoId', 'SUM(uso.cantidadUso) as totalActividad'])
      .groupBy('uso.insumoId')
      .getRawMany();

    // 2. Obtener movimientos de inventario tipo CONSUMO vinculados a actividades de este cultivo
    // Esto asume que al crear el movimiento se guardó el actividadId
    const movimientosConsumo = await this.movimientoRepo.createQueryBuilder('mov')
      .leftJoin('mov.insumo', 'insumo')
      .where('mov.tipo = :tipo', { tipo: 'CONSUMO' })
      .andWhere('mov.actividadId IN (SELECT id FROM actividades WHERE cultivoId = :cultivoId)', { cultivoId })
      .select(['mov.insumoId as insumoId', 'insumo.nombre as nombreInsumo', 'SUM(mov.cantidadUso) as totalMovimientos'])
      .groupBy('mov.insumoId')
      .addGroupBy('insumo.nombre')
      .getRawMany();

    // Comparar
    const diferencias = [];

    // Crear mapa de movimientos
    const movMap = new Map();
    movimientosConsumo.forEach(m => movMap.set(m.insumoId, {
      total: parseFloat(m.totalMovimientos),
      nombre: m.nombreInsumo
    }));

    for (const uso of consumosActividad) {
      const insumoId = uso.insumoId;
      const totalAct = parseFloat(uso.totalActividad);
      const movData = movMap.get(insumoId);

      if (!movData) {
        diferencias.push({
          insumoId,
          mensaje: 'Registrado en actividad pero sin movimiento de inventario',
          cantidadActividad: totalAct,
          cantidadInventario: 0
        });
      } else {
        const diff = Math.abs(totalAct - movData.total);
        if (diff > 0.001) { // Tolerancia por flotantes
          diferencias.push({
            insumoId,
            nombre: movData.nombre,
            mensaje: 'Diferencia de cantidad',
            cantidadActividad: totalAct,
            cantidadInventario: movData.total,
            diferencia: diff
          });
        }
        movMap.delete(insumoId);
      }
    }

    // Chequear los que sobran en movimientos (movimientos sin actividad registrada en insumoUso - raro pero posible)
    movMap.forEach((val, key) => {
      diferencias.push({
        insumoId: key,
        nombre: val.nombre,
        mensaje: 'Movimiento de inventario sin registro en detalle de actividad',
        cantidadActividad: 0,
        cantidadInventario: val.total
      });
    });

    return {
      esCoherente: diferencias.length === 0,
      diferencias
    };
  }
}
