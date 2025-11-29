import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Venta } from '../../production/entities/venta.entity';
import { VentaDetalle } from '../../production/entities/venta-detalle.entity';
import { Actividad } from '../../activities/entities/actividad.entity';
import { ActividadServicio } from '../../activities/entities/actividad-servicio.entity';
import { ActividadInsumoUso } from '../../activities/entities/actividad-insumo-uso.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { CsvExportService } from './csv-export.service';

@Injectable()
export class FinancialReportsService {
  constructor(
    @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private ventaDetalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Actividad) private actividadRepo: Repository<Actividad>,
    @InjectRepository(ActividadServicio)
    private servicioRepo: Repository<ActividadServicio>,
    @InjectRepository(ActividadInsumoUso)
    private insumoUsoRepo: Repository<ActividadInsumoUso>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    private csvService: CsvExportService,
  ) {}

  // RF41: Reporte de Ventas
  async getSalesReport(filters: {
    from?: Date;
    to?: Date;
    clienteId?: number;
    productoAgroId?: number;
    cultivoId?: number;
  }) {
    const query = this.ventaRepo
      .createQueryBuilder('venta')
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
      query.andWhere('venta.clienteId = :clienteId', {
        clienteId: filters.clienteId,
      });
    }

    // Filtros que requieren join con detalles
    if (filters.productoAgroId || filters.cultivoId) {
      // Nota: Esto puede duplicar ventas si tienen múltiples detalles que coinciden,
      // pero TypeORM suele manejarlo al mapear a objetos.
      if (filters.productoAgroId) {
        query.andWhere('loteProduccion.productoAgroId = :prodId', {
          prodId: filters.productoAgroId,
        });
      }
      if (filters.cultivoId) {
        query.andWhere('loteProduccion.cultivoId = :cultId', {
          cultId: filters.cultivoId,
        });
      }
    }

    const ventas = await query.orderBy('venta.fecha', 'DESC').getMany();

    // Calcular totales globales
    const totals = ventas.reduce(
      (acc, v) => ({
        subtotal: acc.subtotal + v.subtotal,
        impuestos: acc.impuestos + v.impuestos,
        descuento: acc.descuento + v.descuento,
        total: acc.total + v.total,
      }),
      { subtotal: 0, impuestos: 0, descuento: 0, total: 0 },
    );

    return {
      data: ventas,
      totals,
      count: ventas.length,
    };
  }

  // RF42: Precios Históricos
  async getHistoricalPrices(filters: {
    productoAgroId: number;
    from?: Date;
    to?: Date;
    cultivoId?: number;
  }) {
    const query = this.ventaDetalleRepo
      .createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .select([
        'DATE(venta.fecha) as fecha',
        'AVG(detalle.precioUnitarioKg) as precioPromedio',
        'MIN(detalle.precioUnitarioKg) as precioMin',
        'MAX(detalle.precioUnitarioKg) as precioMax',
        'SUM(detalle.cantidadKg) as volumenKg',
      ])
      .where('venta.estado != :anulada', { anulada: 'anulada' })
      .andWhere('lote.productoAgroId = :prodId', {
        prodId: filters.productoAgroId,
      })
      .groupBy('DATE(venta.fecha)')
      .orderBy('DATE(venta.fecha)', 'ASC');

    if (filters.from) {
      query.andWhere('venta.fecha >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('venta.fecha <= :to', { to: filters.to });
    }
    if (filters.cultivoId) {
      query.andWhere('lote.cultivoId = :cultId', { cultId: filters.cultivoId });
    }

    return query.getRawMany();
  }

  async getSalesReportCsv(filters: any): Promise<string> {
    const report = await this.getSalesReport(filters);
    const data = report.data.map((v) => ({
      id: v.id,
      fecha: v.fecha,
      cliente: v.cliente?.nombre || 'Mostrador',
      total: v.total,
      estado: v.estado,
    }));
    return this.csvService.generateCsv(data, [
      'id',
      'fecha',
      'cliente',
      'total',
      'estado',
    ]);
  }

  // RF43: Rentabilidad por Cultivo
  async getCropRentability(cultivoId: number) {
    const cultivo = await this.cultivoRepo.findOne({
      where: { id: cultivoId },
    });
    if (!cultivo) throw new Error('Cultivo no encontrado');

    // 1. Ingresos (Ventas asociadas a lotes de producción de este cultivo)
    const ingresosResult = await this.ventaDetalleRepo
      .createQueryBuilder('detalle')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('detalle.loteProduccion', 'lote')
      .where('lote.cultivoId = :cultivoId', { cultivoId })
      .andWhere('venta.estado != :anulada', { anulada: 'anulada' })
      .select('SUM(detalle.precioTotal)', 'totalVentas')
      .addSelect('SUM(detalle.cantidadKg)', 'totalKgVendidos')
      .getRawOne();

    const ingresos = parseFloat(ingresosResult.totalVentas || '0');
    const kgVendidos = parseFloat(ingresosResult.totalKgVendidos || '0');

    // 2. Costos (Actividades)

    // Costo Mano de Obra
    const moResult = await this.actividadRepo
      .createQueryBuilder('actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(actividad.costoManoObra)', 'totalMO')
      .getRawOne();
    const costoMO = parseFloat(moResult.totalMO || '0');

    // Costo Servicios
    const servResult = await this.servicioRepo
      .createQueryBuilder('servicio')
      .leftJoin('servicio.actividad', 'actividad')
      .where('actividad.cultivoId = :cultivoId', { cultivoId })
      .select('SUM(servicio.costo)', 'totalServicios')
      .getRawOne();
    const costoServicios = parseFloat(servResult.totalServicios || '0');

    // Costo Insumos
    const insumosResult = await this.insumoUsoRepo
      .createQueryBuilder('insumoUso')
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
        estado: cultivo.estado,
      },
      ingresos,
      kgVendidos,
      costos: {
        manoObra: costoMO,
        servicios: costoServicios,
        insumos: costoInsumos,
        total: costoTotal,
      },
      rentabilidad: {
        margen,
        margenPorcentaje: parseFloat(margenPorcentaje.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
      },
    };
  }
}
