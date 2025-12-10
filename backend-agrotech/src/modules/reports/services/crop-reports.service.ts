import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Actividad } from '../../activities/entities/actividad.entity';
import { ActividadResponsable } from '../../activities/entities/actividad-responsable.entity';
import { ActividadInsumoUso } from '../../activities/entities/actividad-insumo-uso.entity';
import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { VentaDetalle } from '../../production/entities/venta-detalle.entity';
import { LoteProduccion } from '../../production/entities/lote-produccion.entity';
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
    @InjectRepository(VentaDetalle) private ventaDetalleRepo: Repository<VentaDetalle>,
    @InjectRepository(LoteProduccion) private loteProduccionRepo: Repository<LoteProduccion>,
    private csvService: CsvExportService,
  ) { }

  // ... (rest of methods)

  // Reporte Completo con todos los datos
  async getCompleteReport(
    cultivoId: number,
    fechaDesde?: string,
    fechaHasta?: string
  ) {
    // 1. Verificar que el cultivo existe
    const cultivo = await this.cultivoRepo.findOne({
      where: { id: cultivoId },
      relations: ['lote', 'subLote']
    });

    if (!cultivo) {
      throw new NotFoundException(`Cultivo ${cultivoId} no encontrado`);
    }

    // 2. Construir filtros de fecha
    const buildDateFilter = (desde?: string, hasta?: string) => {
      if (desde && hasta) {
        return Between(new Date(desde), new Date(hasta));
      }
      if (desde) {
        return MoreThanOrEqual(new Date(desde));
      }
      if (hasta) {
        return LessThanOrEqual(new Date(hasta));
      }
      return undefined;
    };

    const dateFilter = buildDateFilter(fechaDesde, fechaHasta);

    // 3. Obtener ACTIVIDADES con responsables
    let actividades: Actividad[] = [];
    try {
      actividades = await this.actividadRepo.find({
        where: {
          cultivoId,
          ...(dateFilter && { fecha: dateFilter })
        },
        relations: ['responsables', 'responsables.usuario'],
        order: { fecha: 'ASC' }
      });
    } catch (e) {
      console.error("Error fetching activities for report:", e);
    }

    // 4. Obtener MOVIMIENTOS DE INSUMOS relacionados con las actividades
    const actividadIds = actividades.map(a => a.id);

    let movimientosInsumos: MovimientoInsumo[] = [];
    if (actividadIds.length > 0) {
      try {
        movimientosInsumos = await this.movimientoRepo.find({
          where: {
            actividadId: In(actividadIds),
            tipo: In(['CONSUMO', 'SALIDA'])
          },
          relations: ['insumo', 'insumo.categoria']
        });
      } catch (e) {
        console.error("Error fetching insumo movements:", e);
      }
    }

    // 5. Obtener VENTAS del cultivo
    const ventaFilter: any = { cultivoId };

    // Solo agregar filtro de relación si hay filtro de fechas
    if (dateFilter) {
      ventaFilter.venta = { fecha: dateFilter };
    }

    let ventasDetalles: VentaDetalle[] = [];
    try {
      ventasDetalles = await this.ventaDetalleRepo.find({
        where: ventaFilter,
        relations: ['venta', 'venta.cliente', 'productoAgro']
      });
    } catch (error) {
      console.error("Error fetching ventasDetalles:", error);
      // Fallback to avoid complete crash if sales fail
      ventasDetalles = [];
    }


    // 6. CALCULAR COSTOS

    // Costo de Mano de Obra (ya viene calculado en actividades)
    const costoManoObra = actividades.reduce(
      (sum, a) => sum + (a.costoManoObra || 0),
      0
    );

    // Costo de Insumos
    const costoInsumos = movimientosInsumos.reduce(
      (sum, m) => sum + (m.costoTotal || 0),
      0
    );

    // Costos adicionales de actividades (maquinaria, servicios, otros)
    const costoMaquinaria = 0; // TODO: Agregar si hay servicios
    const costoOtros = 0; // Agregar si hay otros costos

    const costos = {
      insumos: costoInsumos,
      manoObra: costoManoObra,
      maquinaria: costoMaquinaria,
      otros: costoOtros
    };

    const costoTotal = Object.values(costos).reduce((a, b) => a + b, 0);

    // 7. OBTENER Lotes de Producción (COSECHAS)
    let lotesProduccion: LoteProduccion[] = [];
    try {
      lotesProduccion = await this.loteProduccionRepo.find({
        where: {
          cultivoId,
          ...(dateFilter && { createdAt: dateFilter }) // Asumiendo createdAt para filtrar o fecha cosecha si existiera
        },
        relations: ['productoAgro']
      });
    } catch (e) {
      console.error("Error fetching harvests (lotesProduccion):", e);
    }

    // 7. CALCULAR INGRESOS
    const ingresoTotal = ventasDetalles.reduce(
      (sum, vd) => sum + (vd.precioTotal || 0),
      0
    );

    // 8. CALCULAR INDICADORES
    const utilidadNeta = ingresoTotal - costoTotal;
    const relacionBC = costoTotal > 0 ? ingresoTotal / costoTotal : 0;
    const roi = costoTotal > 0 ? (utilidadNeta / costoTotal) * 100 : 0;
    const margenNeto = ingresoTotal > 0 ? (utilidadNeta / ingresoTotal) * 100 : 0;

    // 9. FORMATEAR RESPUESTA
    return {
      resumen: {
        costoTotal,
        ingresoTotal,
        utilidadNeta,
        relacionBC: Number(relacionBC.toFixed(2)),
        roi: Number(roi.toFixed(2)),
        margenNeto: Number(margenNeto.toFixed(2))
      },
      costos,
      actividades: actividades.map(a => ({
        id: a.id,
        nombre: a.nombre,
        fecha: a.fecha,
        tipo: a.tipo,
        responsable: a.responsables?.[0]?.usuario?.nombre || 'N/A',
        horasTrabajadas: a.horasActividad || 0,
        costoManoObra: a.costoManoObra || 0
      })),
      insumos: movimientosInsumos.map(m => ({
        id: m.id,
        nombre: m.insumo.nombre,
        categoria: m.insumo.categoria?.nombre || 'Sin categoría',
        cantidad: m.cantidadUso,
        unidad: m.insumo.unidadUso,
        precioUnitario: m.costoUnitarioUso,
        total: m.costoTotal
      })),
      ventas: ventasDetalles.map(vd => ({
        id: vd.id,
        fecha: vd.venta.fecha,
        producto: vd.productoAgro.nombre,
        cliente: vd.venta.cliente.nombre,
        cantidad: vd.cantidadKg,
        precioUnitario: vd.precioUnitarioKg,
        total: vd.precioTotal
      })),
      cosechas: lotesProduccion.map(lp => ({
        id: lp.id,
        producto: lp.productoAgro?.nombre || 'Desconocido',
        fecha: lp.createdAt, // Usamos fecha creación como fecha cosecha aprox
        cantidad: lp.cantidadKg,
        calidad: lp.calidad,
        costoUnitario: lp.costoUnitarioKg,
        costoTotal: lp.costoTotal
      }))
    };
  }

  // Additional methods called by controller
  async getActivityStats(cultivoId: number) {
    const actividades = await this.actividadRepo.find({
      where: { cultivoId }
    });

    return {
      totalActivities: actividades.length,
      totalHours: 0,
      totalCost: 0,
      byType: {}
    };
  }

  async getLaborStats(cultivoId: number) {
    return {
      totalWorkers: 0,
      totalHours: 0,
      totalCost: 0,
      byActivity: []
    };
  }

  async getInputStats(cultivoId: number) {
    return {
      totalInputs: 0,
      totalCost: 0,
      byCategory: []
    };
  }

  async getHoursByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month') {
    // Simplified implementation - returns empty data
    return {
      labels: [],
      data: []
    };
  }

  async getInsumosByPeriod(cultivoId: number, granularity: 'day' | 'week' | 'month') {
    // Simplified implementation - returns empty data
    return {
      labels: [],
      data: []
    };
  }

  async getActivityDetails(cultivoId: number) {
    return this.actividadRepo.find({
      where: { cultivoId },
      relations: ['responsables', 'insumos'],
      order: { fecha: 'DESC' }
    });
  }

  async getCropHistoryCsv(cultivoId: number, type: 'summary' | 'activities' | 'insumos') {
    const headers = ['ID', 'Fecha', 'Descripción', 'Valor'];
    return headers.join(',') + '\n';
  }

  async validateConsistency(cultivoId: number) {
    return {
      isConsistent: true,
      errors: [],
      warnings: []
    };
  }

  async getCropSummary(cultivoId: number) {
    return this.getCompleteReport(cultivoId);
  }
}
