import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from '../../production/entities/venta.entity';
import { VentaDetalle } from '../../production/entities/venta-detalle.entity';
import { Actividad } from '../../activities/entities/actividad.entity';
import { ActividadServicio } from '../../activities/entities/actividad-servicio.entity';
import { ActividadInsumoUso } from '../../activities/entities/actividad-insumo-uso.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { CropReportsService } from './crop-reports.service';

@Injectable()
export class FinancialReportsService {
  constructor(
    @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle) private ventaDetalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Actividad) private actividadRepo: Repository<Actividad>,
    @InjectRepository(ActividadServicio) private servicioRepo: Repository<ActividadServicio>,
    @InjectRepository(ActividadInsumoUso) private insumoUsoRepo: Repository<ActividadInsumoUso>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    private readonly cropReportsService: CropReportsService,
  ) {}

  // RF41: Reporte de Ventas
  async getSalesReport(filters: {
    from?: Date;
    to?: Date;
    clienteId?: number;
    productoAgroId?: number;
    cultivoId?: number;
    groupBy?: 'cliente' | 'producto' | 'cultivo';
  }) {
    const query = this.ventaRepo.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.loteProduccion', 'loteProduccion')
      .leftJoinAndSelect('loteProduccion.productoAgro', 'producto')
      .where('venta.estado != :anulada', { anulada: 'anulada' });

    if (filters.from) {
      query.andWhere('venta.fecha >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('venta.fecha <= :to', { to: filters.to });
    }
    if (filters.clienteId) {
      query.andWhere('venta.clienteId = :clienteId', { clienteId: filters.clienteId });
    }
    
    // Filtros que requieren join con detalles
    if (filters.productoAgroId || filters.cultivoId) {
      if (filters.productoAgroId) {
        query.andWhere('loteProduccion.productoAgroId = :prodId', { prodId: filters.productoAgroId });
      }
      if (filters.cultivoId) {
        query.andWhere('loteProduccion.cultivoId = :cultId', { cultId: filters.cultivoId });
      }
    }

    const ventas = await query.orderBy('venta.fecha', 'DESC').getMany();

    // Calcular totales globales
    const totals = ventas.reduce((acc, v) => ({
      subtotal: acc.subtotal + v.subtotal,
      impuestos: acc.impuestos + v.impuestos,
      descuento: acc.descuento + v.descuento,
      total: acc.total + v.total,
    }), { subtotal: 0, impuestos: 0, descuento: 0, total: 0 });

    // Agrupación opcional
    let groupedData = null;
    if (filters.groupBy) {
      groupedData = this.groupSalesBy(ventas, filters.groupBy);
    }

    return {
      data: ventas,
      totals,
      count: ventas.length,
      groupedData
    };
  }

  // RF42: Precios Históricos
  async getHistoricalPrices(filters: {
    productoAgroId: number;
    from?: Date;
    to?: Date;
    cultivoId?: number;
    granularity?: 'day' | 'week' | 'month';
  }) {
    const granularity = filters.granularity || 'day';

    let dateFormat: string;
    let groupBy: string;

    switch (granularity) {
      case 'week':
        dateFormat = "DATE_TRUNC('week', venta.fecha)";
        groupBy = "DATE_TRUNC('week', venta.fecha)";
        break;
      case 'month':
        dateFormat = "DATE_TRUNC('month', venta.fecha)";
        groupBy = "DATE_TRUNC('month', venta.fecha)";
        break;
      case 'day':
      default:
        dateFormat = 'DATE(venta.fecha)';
        groupBy = 'DATE(venta.fecha)';
        break;
    }

    const query = this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .select([
        `${dateFormat} as fecha`,
        'AVG(detalle.precioUnitarioKg) as precioPromedio',
        'MIN(detalle.precioUnitarioKg) as precioMin',
        'MAX(detalle.precioUnitarioKg) as precioMax',
        'SUM(detalle.cantidadKg) as volumenKg',
        'COUNT(DISTINCT venta.id) as numeroVentas'
      ])
      .where('venta.estado != :anulada', { anulada: 'anulada' })
      .andWhere('lote.productoAgroId = :prodId', { prodId: filters.productoAgroId })
      .groupBy(groupBy)
      .orderBy(groupBy, 'ASC');

    if (filters.from) {
      query.andWhere('venta.fecha >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('venta.fecha <= :to', { to: filters.to });
    }
    if (filters.cultivoId) {
      query.andWhere('lote.cultivoId = :cultId', { cultId: filters.cultivoId });
    }

    const results = await query.getRawMany();

    return {
      data: results,
      granularity,
      totalRecords: results.length
    };
  }

  // RF43: Rentabilidad por Cultivo
  async getCropRentability(cultivoId: number) {
    const cultivo = await this.cultivoRepo.findOne({ where: { id: cultivoId } });
    if (!cultivo) throw new Error('Cultivo no encontrado');

    // 1. Ingresos (Ventas asociadas a lotes de producción de este cultivo)
    const ingresosResult = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .where('lote.cultivoId = :cultivoId', { cultivoId })
      .andWhere('venta.estado != :anulada', { anulada: 'anulada' })
      .select('SUM(detalle.subtotal)', 'totalVentas')
      .addSelect('SUM(detalle.cantidadKg)', 'totalKgVendidos')
      .getRawOne();

    const ingresos = parseFloat(ingresosResult.totalVentas || '0');
    const kgVendidos = parseFloat(ingresosResult.totalKgVendidos || '0');

    // 2. Costos (Actividades)
    
    // Costo Mano de Obra
    const moResult = await this.actividadRepo.createQueryBuilder('actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(actividad.costoManoObra)', 'totalMO')
      .getRawOne();
    const costoMO = parseFloat(moResult.totalMO || '0');

    // Costo Servicios
    const servResult = await this.servicioRepo.createQueryBuilder('servicio')
      .leftJoin('servicio.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();
    const costoServicios = parseFloat(servResult.totalServicios || '0');

    // Costo Insumos
    const insumosResult = await this.insumoUsoRepo.createQueryBuilder('insumoUso')
      .leftJoin('insumoUso.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(insumoUso.costoTotal)', 'totalInsumos')
      .getRawOne();
    const costoInsumos = parseFloat(insumosResult.totalInsumos || '0');

    const costoTotal = costoMO + costoServicios + costoInsumos;
    const margen = ingresos - costoTotal;
    const margenPorcentaje = ingresos > 0 ? (margen / ingresos) * 100 : 0;
    const roi = costoTotal > 0 ? (margen / costoTotal) * 100 : 0;

    return {
      cultivo: {
        id: cultivo.id,
        nombre: cultivo.nombreCultivo,
        estado: cultivo.estado
      },
      ingresos,
      kgVendidos,
      costos: {
        manoObra: costoMO,
        servicios: costoServicios,
        insumos: costoInsumos,
        total: costoTotal
      },
      rentabilidad: {
        margen,
        margenPorcentaje: parseFloat(margenPorcentaje.toFixed(2)),
        roi: parseFloat(roi.toFixed(2))
      }
    };
  }

  // RF43: Rentabilidad por lote
  async getLoteRentability(loteId: number) {
    const lote = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.loteProduccion', 'lote')
      .leftJoin('lote.lote', 'loteGeo')
      .where('lote.loteId = :loteId', { loteId })
      .select('loteGeo.nombre as nombreLote')
      .getRawOne();

    if (!lote) throw new Error('Lote no encontrado o sin producción');

    // Ingresos por lote
    const ingresosResult = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .where('lote.loteId = :loteId', { loteId })
      .andWhere('venta.estado != :anulada', { anulada: 'anulada' })
      .select('SUM(detalle.subtotal)', 'totalVentas')
      .addSelect('SUM(detalle.cantidadKg)', 'totalKgVendidos')
      .getRawOne();

    const ingresos = parseFloat(ingresosResult.totalVentas || '0');
    const kgVendidos = parseFloat(ingresosResult.totalKgVendidos || '0');

    // Costos por actividades de cultivos en este lote
    const cultivosEnLote = await this.cultivoRepo.find({ where: { loteId } });
    const cultivoIds = cultivosEnLote.map(c => c.id);

    if (cultivoIds.length === 0) {
      return {
        lote: { id: loteId, nombre: lote.nombreLote },
        ingresos: 0,
        kgVendidos: 0,
        costos: { manoObra: 0, servicios: 0, insumos: 0, total: 0 },
        rentabilidad: { margen: 0, margenPorcentaje: 0, roi: 0 }
      };
    }

    // Costos MO
    const moResult = await this.actividadRepo.createQueryBuilder('actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(actividad.costoManoObra)', 'totalMO')
      .getRawOne();
    const costoMO = parseFloat(moResult.totalMO || '0');

    // Costos Servicios
    const servResult = await this.servicioRepo.createQueryBuilder('servicio')
      .leftJoin('servicio.actividad', 'actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();
    const costoServicios = parseFloat(servResult.totalServicios || '0');

    // Costos Insumos
    const insumosResult = await this.insumoUsoRepo.createQueryBuilder('insumoUso')
      .leftJoin('insumoUso.actividad', 'actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(insumoUso.costoTotal)', 'totalInsumos')
      .getRawOne();
    const costoInsumos = parseFloat(insumosResult.totalInsumos || '0');

    const costoTotal = costoMO + costoServicios + costoInsumos;
    const margen = ingresos - costoTotal;
    const margenPorcentaje = ingresos > 0 ? (margen / ingresos) * 100 : 0;
    const roi = costoTotal > 0 ? (margen / costoTotal) * 100 : 0;

    return {
      lote: {
        id: loteId,
        nombre: lote.nombreLote
      },
      ingresos,
      kgVendidos,
      costos: {
        manoObra: costoMO,
        servicios: costoServicios,
        insumos: costoInsumos,
        total: costoTotal
      },
      rentabilidad: {
        margen,
        margenPorcentaje: parseFloat(margenPorcentaje.toFixed(2)),
        roi: parseFloat(roi.toFixed(2))
      }
    };
  }

  // RF43: Rentabilidad por sublote
  async getSubLoteRentability(subLoteId: number) {
    const sublote = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.loteProduccion', 'lote')
      .leftJoin('lote.subLote', 'sublote')
      .where('lote.subLoteId = :subLoteId', { subLoteId })
      .select('sublote.nombre as nombreSubLote')
      .getRawOne();

    if (!sublote) throw new Error('SubLote no encontrado o sin producción');

    // Ingresos por sublote
    const ingresosResult = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .where('lote.subLoteId = :subLoteId', { subLoteId })
      .andWhere('venta.estado != :anulada', { anulada: 'anulada' })
      .select('SUM(detalle.subtotal)', 'totalVentas')
      .addSelect('SUM(detalle.cantidadKg)', 'totalKgVendidos')
      .getRawOne();

    const ingresos = parseFloat(ingresosResult.totalVentas || '0');
    const kgVendidos = parseFloat(ingresosResult.totalKgVendidos || '0');

    // Costos por actividades de cultivos en este sublote
    const cultivosEnSubLote = await this.cultivoRepo.find({ where: { subLoteId } });
    const cultivoIds = cultivosEnSubLote.map(c => c.id);

    if (cultivoIds.length === 0) {
      return {
        sublote: { id: subLoteId, nombre: sublote.nombreSubLote },
        ingresos: 0,
        kgVendidos: 0,
        costos: { manoObra: 0, servicios: 0, insumos: 0, total: 0 },
        rentabilidad: { margen: 0, margenPorcentaje: 0, roi: 0 }
      };
    }

    // Costos MO
    const moResult = await this.actividadRepo.createQueryBuilder('actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(actividad.costoManoObra)', 'totalMO')
      .getRawOne();
    const costoMO = parseFloat(moResult.totalMO || '0');

    // Costos Servicios
    const servResult = await this.servicioRepo.createQueryBuilder('servicio')
      .leftJoin('servicio.actividad', 'actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();
    const costoServicios = parseFloat(servResult.totalServicios || '0');

    // Costos Insumos
    const insumosResult = await this.insumoUsoRepo.createQueryBuilder('insumoUso')
      .leftJoin('insumoUso.actividad', 'actividad')
      .where('actividad.cultivoId IN (:...cultivoIds)', { cultivoIds })
      .select('SUM(insumoUso.costoTotal)', 'totalInsumos')
      .getRawOne();
    const costoInsumos = parseFloat(insumosResult.totalInsumos || '0');

    const costoTotal = costoMO + costoServicios + costoInsumos;
    const margen = ingresos - costoTotal;
    const margenPorcentaje = ingresos > 0 ? (margen / ingresos) * 100 : 0;
    const roi = costoTotal > 0 ? (margen / costoTotal) * 100 : 0;

    return {
      sublote: {
        id: subLoteId,
        nombre: sublote.nombreSubLote
      },
      ingresos,
      kgVendidos,
      costos: {
        manoObra: costoMO,
        servicios: costoServicios,
        insumos: costoInsumos,
        total: costoTotal
      },
      rentabilidad: {
        margen,
        margenPorcentaje: parseFloat(margenPorcentaje.toFixed(2)),
        roi: parseFloat(roi.toFixed(2))
      }
    };
  }

  // Método auxiliar para agrupar ventas
  private groupSalesBy(ventas: any[], groupBy: 'cliente' | 'producto' | 'cultivo') {
    const groups: { [key: string]: any } = {};

    for (const venta of ventas) {
      let key: string;
      let groupName: string;

      switch (groupBy) {
        case 'cliente':
          key = venta.cliente?.id?.toString() || 'sin-cliente';
          groupName = venta.cliente?.nombre || 'Sin cliente';
          break;
        case 'producto':
          // Agrupar por productos en los detalles
          for (const detalle of venta.detalles || []) {
            const prodKey = detalle.loteProduccion?.productoAgro?.id?.toString() || 'sin-producto';
            const prodName = detalle.loteProduccion?.productoAgro?.nombre || 'Sin producto';

            if (!groups[prodKey]) {
              groups[prodKey] = {
                id: prodKey,
                nombre: prodName,
                subtotal: 0,
                impuestos: 0,
                descuento: 0,
                total: 0,
                cantidadVentas: 0
              };
            }

            groups[prodKey].subtotal += detalle.subtotal || 0;
            groups[prodKey].impuestos += (detalle.subtotal || 0) * 0.19; // IVA
            groups[prodKey].total += detalle.subtotal || 0 + (detalle.subtotal || 0) * 0.19;
            groups[prodKey].cantidadVentas += 1;
          }
          continue;
        case 'cultivo':
          // Agrupar por cultivos en los detalles
          for (const detalle of venta.detalles || []) {
            const cultKey = detalle.loteProduccion?.cultivo?.id?.toString() || 'sin-cultivo';
            const cultName = detalle.loteProduccion?.cultivo?.nombreCultivo || 'Sin cultivo';

            if (!groups[cultKey]) {
              groups[cultKey] = {
                id: cultKey,
                nombre: cultName,
                subtotal: 0,
                impuestos: 0,
                descuento: 0,
                total: 0,
                cantidadVentas: 0
              };
            }

            groups[cultKey].subtotal += detalle.subtotal || 0;
            groups[cultKey].impuestos += (detalle.subtotal || 0) * 0.19;
            groups[cultKey].total += detalle.subtotal || 0 + (detalle.subtotal || 0) * 0.19;
            groups[cultKey].cantidadVentas += 1;
          }
          continue;
      }

      if (!groups[key]) {
        groups[key] = {
          id: key,
          nombre: groupName,
          subtotal: 0,
          impuestos: 0,
          descuento: 0,
          total: 0,
          cantidadVentas: 0
        };
      }

      groups[key].subtotal += venta.subtotal || 0;
      groups[key].impuestos += venta.impuestos || 0;
      groups[key].descuento += venta.descuento || 0;
      groups[key].total += venta.total || 0;
      groups[key].cantidadVentas += 1;
    }

    return Object.values(groups);
  }

  // RF43: Resumen completo del cultivo (costos + ingresos)
  async getCropSummary(cultivoId: number) {
    // Obtener resumen de costos del CropReportsService
    const cropSummary = await this.cropReportsService.getCropSummary(cultivoId);

    // Obtener ingresos del cultivo
    const ingresosResult = await this.ventaDetalleRepo.createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .where('lote.cultivoId = :cultivoId', { cultivoId })
      .andWhere('venta.estado != :anulada', { anulada: 'anulada' })
      .select('SUM(detalle.subtotal)', 'totalVentas')
      .addSelect('SUM(detalle.cantidadKg)', 'totalKgVendidos')
      .getRawOne();

    const ingresos = parseFloat(ingresosResult.totalVentas || '0');
    const kgVendidos = parseFloat(ingresosResult.totalKgVendidos || '0');

    const costosTotales = cropSummary.resumen.costos.total;
    const margen = ingresos - costosTotales;
    const margenPorcentaje = ingresos > 0 ? (margen / ingresos) * 100 : 0;
    const roi = costosTotales > 0 ? (margen / costosTotales) * 100 : 0;

    return {
      cultivo: cropSummary.cultivo,
      resumen: {
        ...cropSummary.resumen,
        ingresos,
        kgVendidos,
        rentabilidad: {
          margen,
          margenPorcentaje: parseFloat(margenPorcentaje.toFixed(2)),
          roi: parseFloat(roi.toFixed(2))
        }
      }
    };
  }
}
