import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ProductoAgro } from '../entities/producto-agro.entity';
import { LoteProduccion } from '../entities/lote-produccion.entity';
import { MovimientoProduccion } from '../entities/movimiento-produccion.entity';
import { Cliente } from '../entities/cliente.entity';
import { Venta } from '../entities/venta.entity';
import { VentaDetalle } from '../entities/venta-detalle.entity';
import { Pago } from '../entities/pago.entity';
import { Factura } from '../entities/factura.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { CreateProductoAgroDto } from '../dtos/create-producto-agro.dto';
import { UpdateProductoAgroDto } from '../dtos/update-producto-agro.dto';
import { CreateLoteProduccionDto } from '../dtos/create-lote-produccion.dto';
import { UpdateLoteProduccionDto } from '../dtos/update-lote-produccion.dto';
import { VentasReportDto } from '../dtos/ventas-report.dto';
import { PreciosHistoricosDto, PrecioHistoricoItem } from '../dtos/precios-historicos.dto';
import { RentabilidadReportDto } from '../dtos/rentabilidad-report.dto';

import { CropReportsService } from '../../reports/services/crop-reports.service';
import { FinancialReportsService } from '../../reports/services/financial-reports.service';
import { ProductionGateway } from '../gateways/production.gateway';
import { ExportService } from '../../../common/services/export.service';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductoAgro) private productoRepo: Repository<ProductoAgro>,
    @InjectRepository(LoteProduccion) private loteProduccionRepo: Repository<LoteProduccion>,
    @InjectRepository(MovimientoProduccion) private movimientoRepo: Repository<MovimientoProduccion>,
    @InjectRepository(Cliente) private clienteRepo: Repository<Cliente>,
    @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    @InjectRepository(VentaDetalle) private ventaDetalleRepo: Repository<VentaDetalle>,
    @InjectRepository(Pago) private pagoRepo: Repository<Pago>,
    @InjectRepository(Factura) private facturaRepo: Repository<Factura>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(SubLote) private subLoteRepo: Repository<SubLote>,
    private dataSource: DataSource,
    private readonly cropReportsService: CropReportsService,
    private readonly financialReportsService: FinancialReportsService,
    @Inject(forwardRef(() => ProductionGateway))
    private productionGateway: ProductionGateway,
    private readonly exportService: ExportService,
  ) {}

  // ==================== PRODUCTO AGRO ====================
  
  // RF35: CRUD ProductoAgro
  async findAllProductos(filters?: { q?: string }, pagination?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = pagination || {};
    const { q } = filters || {};

    const queryBuilder = this.productoRepo.createQueryBuilder('producto')
      .where('producto.deletedAt IS NULL');

    // Búsqueda de texto
    if (q) {
      queryBuilder.andWhere(
        '(producto.nombre ILIKE :q OR producto.descripcion ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    // Paginación
    queryBuilder
      .orderBy('producto.nombre', 'ASC')
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

  async findProductoById(id: number) {
    const producto = await this.productoRepo.findOne({ where: { id } });
    if (!producto) throw new NotFoundException(`ProductoAgro ${id} not found`);
    return producto;
  }

  async createProducto(data: CreateProductoAgroDto) {
    const producto = this.productoRepo.create(data);
    const saved = await this.productoRepo.save(producto);

    // Emitir evento WebSocket
    this.productionGateway.broadcast('production:productos:created', saved);

    return saved;
  }

  async updateProducto(id: number, data: UpdateProductoAgroDto) {
    const producto = await this.findProductoById(id);
    Object.assign(producto, data);
    const updated = await this.productoRepo.save(producto);

    // Emitir evento WebSocket
    this.productionGateway.broadcast('production:productos:updated', updated);

    return updated;
  }

  async removeProducto(id: number) {
    const producto = await this.findProductoById(id);
    const removed = await this.productoRepo.softRemove(producto);

    // Emitir evento WebSocket
    this.productionGateway.broadcast('production:productos:deleted', removed);

    return removed;
  }

  // ==================== LOTE PRODUCCION ====================
  
  // RF36: CRUD LoteProduccion
  async findAllLotesProduccion(filters?: { productoAgroId?: number; cultivoId?: number }) {
    const queryBuilder = this.loteProduccionRepo.createQueryBuilder('lote')
      .leftJoinAndSelect('lote.productoAgro', 'producto')
      .leftJoinAndSelect('lote.cultivo', 'cultivo');

    if (filters?.productoAgroId) {
      queryBuilder.andWhere('lote.productoAgroId = :productoAgroId', { productoAgroId: filters.productoAgroId });
    }

    if (filters?.cultivoId) {
      queryBuilder.andWhere('lote.cultivoId = :cultivoId', { cultivoId: filters.cultivoId });
    }

    return queryBuilder.getMany();
  }

  async createLoteProduccion(data: CreateLoteProduccionDto) {
    // Validaciones de coherencia entre entidades relacionadas
    if (data.productoAgroId) {
      const productoAgro = await this.productoRepo.findOne({ where: { id: data.productoAgroId } });
      if (!productoAgro) throw new BadRequestException(`ProductoAgro ${data.productoAgroId} no existe`);
    }

    if (data.cultivoId) {
      const cultivo = await this.cultivoRepo.findOne({ where: { id: data.cultivoId } });
      if (!cultivo) throw new BadRequestException(`Cultivo ${data.cultivoId} no existe`);
    }

    const lote = this.loteProduccionRepo.create(data);
    return this.loteProduccionRepo.save(lote);
  }

    // RF23: Crear LoteProduccion desde cosecha
    async createLoteProduccionFromCosecha(data: {
      cultivoId: number;
      actividadCosechaId: number;
      cantidadKg: number;
      fecha: Date;
    }) {
      // Validación de coherencia: verificar que el cultivo existe
      const cultivo = await this.cultivoRepo.findOne({ where: { id: data.cultivoId } });
      if (!cultivo) throw new BadRequestException(`Cultivo ${data.cultivoId} no existe`);

      // Obtener resumen de costos del cultivo hasta la fecha
      const cropSummary = await this.cropReportsService.getCropSummary(data.cultivoId);
      const costoTotalAcumulado = cropSummary.resumen.costos.total;
      
      // Calcular costo unitario (Simplificación: Asignamos el costo acumulado a esta cosecha)
      // Nota: En un escenario real con múltiples cosechas, se debería amortizar el costo.
      const costoUnitario = data.cantidadKg > 0 ? (costoTotalAcumulado / data.cantidadKg) : 0;
      const costoTotalLote = costoTotalAcumulado;

      // Por ahora asumimos productoAgroId = 1 (TODO: Vincular Cultivo -> Variedad -> Producto)
      const loteProduccion = this.loteProduccionRepo.create({
        productoAgroId: 1, 
        cultivoId: data.cultivoId,
        actividadCosechaId: data.actividadCosechaId,
        cantidadKg: data.cantidadKg,
        stockDisponibleKg: data.cantidadKg,
        costoUnitarioKg: costoUnitario,
        costoTotal: costoTotalLote,
        precioSugeridoKg: costoUnitario * 1.3, // Margen sugerido del 30%
      });
  
      const saved = await this.loteProduccionRepo.save(loteProduccion);
  
      // RF37: Crear movimiento de ingreso
      await this.movimientoRepo.save({
        loteProduccionId: saved.id,
        tipo: 'INGRESO_COSECHA',
        cantidadKg: data.cantidadKg,
        costoUnitarioKg: costoUnitario,
        costoTotal: costoTotalLote,
        descripcion: `Ingreso por cosecha - Actividad ${data.actividadCosechaId}`,
    });

    return saved;
  }

  async findLoteProduccionById(id: number) {
    const lote = await this.loteProduccionRepo.findOne({
      where: { id },
      relations: ['productoAgro', 'cultivo'],
    });
    if (!lote) throw new NotFoundException(`LoteProduccion ${id} not found`);
    return lote;
  }

  async updateLoteProduccion(id: number, data: UpdateLoteProduccionDto) {
    const lote = await this.findLoteProduccionById(id);
    Object.assign(lote, data);
    return this.loteProduccionRepo.save(lote);
  }

  async removeLoteProduccion(id: number) {
    const lote = await this.findLoteProduccionById(id);
    return this.loteProduccionRepo.softRemove(lote);
  }

  // ==================== CLIENTES ====================
  
  // RF38: CRUD Cliente
  async findAllClientes(filters?: { q?: string }, pagination?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = pagination || {};
    const { q } = filters || {};

    const queryBuilder = this.clienteRepo.createQueryBuilder('cliente')
      .where('cliente.deletedAt IS NULL');

    // Búsqueda de texto
    if (q) {
      queryBuilder.andWhere(
        '(cliente.nombre ILIKE :q OR cliente.identificacion ILIKE :q OR cliente.correo ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    // Paginación
    queryBuilder
      .orderBy('cliente.nombre', 'ASC')
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

  async findClienteById(id: number) {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} not found`);
    return cliente;
  }

  async createCliente(data: { nombre: string; identificacion?: string; telefono?: string; correo?: string; direccion?: string; notas?: string }) {
    const cliente = this.clienteRepo.create(data);
    return this.clienteRepo.save(cliente);
  }

  async updateCliente(id: number, data: Partial<{ nombre: string; identificacion?: string; telefono?: string; correo?: string; direccion?: string; notas?: string }>) {
    const cliente = await this.findClienteById(id);
    Object.assign(cliente, data);
    return this.clienteRepo.save(cliente);
  }

  async removeCliente(id: number) {
    const cliente = await this.findClienteById(id);
    return this.clienteRepo.softRemove(cliente);
  }

  // ==================== MOVIMIENTOS PRODUCCION ====================
  
  // RF37: Crear movimiento de ajuste (positivo o negativo)
  async createMovimientoAjuste(data: {
    loteProduccionId: number;
    tipo: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
    cantidadKg: number;
    descripcion: string;
    usuarioId: number;
  }) {
    const loteProduccion = await this.findLoteProduccionById(data.loteProduccionId);
    
    // Validar que no deje stock negativo en caso de ajuste negativo
    if (data.tipo === 'AJUSTE_NEGATIVO' && loteProduccion.stockDisponibleKg < data.cantidadKg) {
      throw new BadRequestException(
        `Ajuste negativo de ${data.cantidadKg} kg excede stock disponible (${loteProduccion.stockDisponibleKg} kg)`
      );
    }

    const cantidadConSigno = data.tipo === 'AJUSTE_POSITIVO' ? data.cantidadKg : -data.cantidadKg;

    // Crear movimiento
    const movimiento = await this.movimientoRepo.save({
      loteProduccionId: data.loteProduccionId,
      tipo: data.tipo,
      cantidadKg: cantidadConSigno,
      costoUnitarioKg: loteProduccion.costoUnitarioKg,
      costoTotal: cantidadConSigno * loteProduccion.costoUnitarioKg,
      descripcion: data.descripcion,
      usuarioId: data.usuarioId,
    });

    // Actualizar stock
    loteProduccion.stockDisponibleKg += cantidadConSigno;
    await this.loteProduccionRepo.save(loteProduccion);

    return movimiento;
  }

  // RF37: Traslado entre lotes
  async createMovimientoTraslado(data: {
    loteOrigenId: number;
    loteDestinoId: number;
    cantidadKg: number;
    descripcion?: string;
    usuarioId: number;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loteOrigen = await queryRunner.manager.findOne(LoteProduccion, {
        where: { id: data.loteOrigenId },
      });
      const loteDestino = await queryRunner.manager.findOne(LoteProduccion, {
        where: { id: data.loteDestinoId },
      });

      if (!loteOrigen || !loteDestino) {
        throw new NotFoundException('Lote de origen o destino no encontrado');
      }

      if (loteOrigen.stockDisponibleKg < data.cantidadKg) {
        throw new BadRequestException(
          `Stock insuficiente en lote origen. Disponible: ${loteOrigen.stockDisponibleKg} kg`
        );
      }

      // 1. Salida del origen
      loteOrigen.stockDisponibleKg -= data.cantidadKg;
      await queryRunner.manager.save(loteOrigen);

      await queryRunner.manager.save(MovimientoProduccion, {
        loteProduccionId: loteOrigen.id,
        tipo: 'SALIDA_TRASLADO',
        cantidadKg: -data.cantidadKg,
        costoUnitarioKg: loteOrigen.costoUnitarioKg,
        costoTotal: -data.cantidadKg * loteOrigen.costoUnitarioKg,
        descripcion: data.descripcion || `Traslado a lote ${loteDestino.id}`,
        usuarioId: data.usuarioId,
      });

      // 2. Ingreso al destino
      loteDestino.stockDisponibleKg += data.cantidadKg;
      // Recalcular costo promedio ponderado del destino si es necesario, 
      // por ahora mantenemos el costo del destino o promediamos con el del origen?
      // Simplificación: El costo unitario del destino se actualiza ponderado
      const valorActualDestino = (loteDestino.stockDisponibleKg - data.cantidadKg) * loteDestino.costoUnitarioKg;
      const valorTraslado = data.cantidadKg * loteOrigen.costoUnitarioKg;
      
      if (loteDestino.stockDisponibleKg > 0) {
        loteDestino.costoUnitarioKg = (valorActualDestino + valorTraslado) / loteDestino.stockDisponibleKg;
      }

      await queryRunner.manager.save(loteDestino);

      await queryRunner.manager.save(MovimientoProduccion, {
        loteProduccionId: loteDestino.id,
        tipo: 'INGRESO_TRASLADO',
        cantidadKg: data.cantidadKg,
        costoUnitarioKg: loteOrigen.costoUnitarioKg, // Entra con el costo del origen
        costoTotal: data.cantidadKg * loteOrigen.costoUnitarioKg,
        descripcion: data.descripcion || `Traslado desde lote ${loteOrigen.id}`,
        usuarioId: data.usuarioId,
      });

      await queryRunner.commitTransaction();

      return { message: 'Traslado realizado exitosamente' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // RF37: Obtener historial de movimientos de un lote
  async getMovimientosHistorial(loteProduccionId: number) {
    return this.movimientoRepo.find({
      where: { loteProduccionId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== VENTAS POS ====================
  
  // RF39: Crear venta POS
  async createVenta(data: {
    clienteId?: number;
    detalles: Array<{
      loteProduccionId: number;
      cantidadKg: number;
      precioUnitarioKg: number;
    }>;
    pagos: Array<{
      metodoPago: string;
      monto: number;
    }>;
    usuarioId: number;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calcular totales
      let subtotal = 0;
      for (const detalle of data.detalles) {
        subtotal += detalle.cantidadKg * detalle.precioUnitarioKg;
      }

      const iva = subtotal * 0.19; // 19% IVA
      const total = subtotal + iva;

      // Validar que los pagos cubran el total
      const totalPagos = data.pagos.reduce((sum, p) => sum + p.monto, 0);
      if (totalPagos < total) {
        throw new BadRequestException('Los pagos no cubren el total de la venta');
      }

      // Crear venta
      const venta = queryRunner.manager.create(Venta, {
        clienteId: data.clienteId,
        usuarioId: data.usuarioId,
        subtotal,
        impuestos: iva,
        descuento: 0,
        total,
        estado: 'completada',
        fecha: new Date(),
      });

      const savedVenta = await queryRunner.manager.save(venta);

      // Crear detalles y descontar stock
      for (const detalle of data.detalles) {
        const loteProduccion = await queryRunner.manager.findOne(LoteProduccion, {
          where: { id: detalle.loteProduccionId },
        });

        if (!loteProduccion) {
          throw new NotFoundException(`LoteProduccion ${detalle.loteProduccionId} not found`);
        }

        // Validar stock disponible
        if (loteProduccion.stockDisponibleKg < detalle.cantidadKg) {
          throw new BadRequestException(
            `Stock insuficiente para lote ${detalle.loteProduccionId}. Disponible: ${loteProduccion.stockDisponibleKg} kg`
          );
        }

        // Crear detalle
         await queryRunner.manager.save(VentaDetalle, {
           ventaId: savedVenta.id,
           loteProduccionId: detalle.loteProduccionId,
           productoAgroId: loteProduccion.productoAgroId,
           cultivoId: loteProduccion.cultivoId,
           cantidadKg: detalle.cantidadKg,
           precioUnitarioKg: detalle.precioUnitarioKg,
           precioTotal: detalle.cantidadKg * detalle.precioUnitarioKg,
           costoUnitarioKg: loteProduccion.costoUnitarioKg,
           costoTotal: detalle.cantidadKg * loteProduccion.costoUnitarioKg,
         });

        // Descontar stock
        loteProduccion.stockDisponibleKg -= detalle.cantidadKg;
        await queryRunner.manager.save(loteProduccion);

        // Crear movimiento de salida
        await queryRunner.manager.save(MovimientoProduccion, {
          loteProduccionId: detalle.loteProduccionId,
          tipo: 'SALIDA_VENTA',
          cantidadKg: -detalle.cantidadKg,
          costoUnitarioKg: loteProduccion.costoUnitarioKg,
          costoTotal: -detalle.cantidadKg * loteProduccion.costoUnitarioKg,
          descripcion: `Venta ${savedVenta.id}`,
          ventaId: savedVenta.id,
        });
      }

      // Crear pagos
      for (const pago of data.pagos) {
        await queryRunner.manager.save(Pago, {
          ventaId: savedVenta.id,
          metodoPago: pago.metodoPago,
          monto: pago.monto,
        });
      }

      await queryRunner.commitTransaction();

      return this.findVentaById(savedVenta.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findVentaById(id: number) {
    const venta = await this.ventaRepo.findOne({
      where: { id },
      relations: ['cliente', 'detalles', 'detalles.loteProduccion', 'detalles.productoAgro', 'detalles.cultivo', 'pagos'],
    });

    if (!venta) throw new NotFoundException(`Venta ${id} not found`);
    return venta;
  }

  async findAllVentas(filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date; estado?: string }, pagination?: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = pagination || {};

    const queryBuilder = this.ventaRepo.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.detalles', 'detalles')
      .leftJoinAndSelect('venta.pagos', 'pagos');

    if (filters?.clienteId) {
      queryBuilder.andWhere('venta.clienteId = :clienteId', { clienteId: filters.clienteId });
    }

    if (filters?.fechaInicio) {
      queryBuilder.andWhere('venta.fecha >= :fechaInicio', { fechaInicio: filters.fechaInicio });
    }

    if (filters?.fechaFin) {
      queryBuilder.andWhere('venta.fecha <= :fechaFin', { fechaFin: filters.fechaFin });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('venta.estado = :estado', { estado: filters.estado });
    }

    // Paginación
    queryBuilder
      .orderBy('venta.fecha', 'DESC')
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

  // RF39: Generar factura para venta
  async generarFactura(ventaId: number) {
    const venta = await this.findVentaById(ventaId);

    if (!venta) {
      throw new NotFoundException(`Venta ${ventaId} not found`);
    }

    // Verificar si ya existe una factura
    let factura = await this.facturaRepo.findOne({ where: { ventaId } });

    if (!factura) {
      // Crear nueva factura
      const numero = `F${venta.id.toString().padStart(6, '0')}`;
      const prefijo = 'F';
      const fechaEmision = new Date();
      const vencimiento = new Date(fechaEmision);
      vencimiento.setDate(vencimiento.getDate() + 30); // 30 días de vencimiento

      factura = this.facturaRepo.create({
        ventaId,
        numero,
        prefijo,
        fechaEmision,
        vencimiento,
      });

      await this.facturaRepo.save(factura);
    }

    // Generar QR Code con datos de la factura
    const qrData = `Factura:${factura.numero}|Total:${venta.total}|Fecha:${factura.fechaEmision.toISOString().split('T')[0]}`;
    const qrBuffer = await this.exportService.generateQRCode(qrData);

    // Guardar QR como archivo
    const uploadsDir = path.join(process.cwd(), 'uploads', 'facturas');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const qrFilename = `qr_${factura.numero}.png`;
    const qrPath = path.join(uploadsDir, qrFilename);
    fs.writeFileSync(qrPath, qrBuffer);
    const qrUrl = `/uploads/facturas/${qrFilename}`;

    // Preparar datos para el PDF
    const invoiceData = {
      numero: factura.numero,
      fechaEmision: factura.fechaEmision,
      vencimiento: factura.vencimiento,
      cliente: {
        nombre: venta.cliente?.nombre || 'Cliente Final',
        identificacion: venta.cliente?.identificacion,
        direccion: venta.cliente?.direccion,
      },
      detalles: venta.detalles.map(detalle => ({
        descripcion: detalle.productoAgro?.nombre || `Producto ${detalle.productoAgroId}`,
        cantidad: detalle.cantidadKg,
        precioUnitario: detalle.precioUnitarioKg,
        precioTotal: detalle.precioTotal,
      })),
      subtotal: venta.subtotal,
      impuestos: venta.impuestos,
      descuento: venta.descuento,
      total: venta.total,
      qrData,
    };

    // Generar PDF
    const pdfBuffer = await this.exportService.generateInvoicePDF(invoiceData);

    // Guardar PDF como archivo
    const pdfFilename = `factura_${factura.numero}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);
    fs.writeFileSync(pdfPath, pdfBuffer);
    const pdfUrl = `/uploads/facturas/${pdfFilename}`;

    // Actualizar factura con URLs
    factura.qrUrl = qrUrl;
    factura.pdfUrl = pdfUrl;
    await this.facturaRepo.save(factura);

    return factura;
  }

  // RF40: Anular venta
  async anularVenta(ventaId: number, usuarioId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id: ventaId },
        relations: ['detalles'],
      });

      if (!venta) {
        throw new NotFoundException(`Venta ${ventaId} not found`);
      }

      if (venta.estado === 'anulada') {
        throw new BadRequestException('La venta ya está anulada');
      }

      // Revertir stock
      for (const detalle of venta.detalles) {
        const loteProduccion = await queryRunner.manager.findOne(LoteProduccion, {
          where: { id: detalle.loteProduccionId },
        });

        if (loteProduccion) {
          loteProduccion.stockDisponibleKg += detalle.cantidadKg;
          await queryRunner.manager.save(loteProduccion);

          // Crear movimiento de reversión
          await queryRunner.manager.save(MovimientoProduccion, {
            loteProduccionId: detalle.loteProduccionId,
            tipo: 'INGRESO_ANULACION',
            cantidadKg: detalle.cantidadKg,
            costoUnitarioKg: loteProduccion.costoUnitarioKg,
            costoTotal: detalle.cantidadKg * loteProduccion.costoUnitarioKg,
            descripcion: `Anulación venta ${ventaId}`,
            ventaId,
          });
        }
      }

      // Marcar venta como anulada
      venta.estado = 'anulada';
      venta.anuladaPorUsuarioId = usuarioId;
      venta.fechaAnulacion = new Date();
      await queryRunner.manager.save(venta);

      await queryRunner.commitTransaction();

      return this.findVentaById(ventaId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== REPORTES ====================

  async getVentasReport(filters: VentasReportDto) {
    const { from, to, productoAgroId, clienteId, cultivoId, groupBy, export: exportType } = filters;

    // Base query con joins
    let queryBuilder = this.ventaRepo.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.productoAgro', 'productoAgro')
      .leftJoinAndSelect('detalles.cultivo', 'cultivo')
      .where('venta.estado != :estado', { estado: 'anulada' });

    // Aplicar filtros de fecha
    if (from) {
      queryBuilder.andWhere('venta.fecha >= :from', { from });
    }
    if (to) {
      queryBuilder.andWhere('venta.fecha <= :to', { to });
    }

    // Filtros adicionales
    if (clienteId) {
      queryBuilder.andWhere('venta.clienteId = :clienteId', { clienteId });
    }
    if (productoAgroId) {
      queryBuilder.andWhere('detalles.productoAgroId = :productoAgroId', { productoAgroId });
    }
    if (cultivoId) {
      queryBuilder.andWhere('detalles.cultivoId = :cultivoId', { cultivoId });
    }

    let data;
    let totalesGlobales;

    if (groupBy) {
      // Agrupación
      let groupField: string;
      let selectFields: string[];

      switch (groupBy) {
        case 'cliente':
          groupField = 'cliente.nombre';
          selectFields = ['cliente.nombre as grupo', 'COUNT(DISTINCT venta.id) as cantidadVentas', 'SUM(detalles.precioTotal) as totalVentas'];
          break;
        case 'producto':
          groupField = 'productoAgro.nombre';
          selectFields = ['productoAgro.nombre as grupo', 'SUM(detalles.cantidadKg) as cantidadKg', 'SUM(detalles.precioTotal) as totalVentas'];
          break;
        case 'cultivo':
          groupField = 'cultivo.nombre';
          selectFields = ['cultivo.nombre as grupo', 'SUM(detalles.cantidadKg) as cantidadKg', 'SUM(detalles.precioTotal) as totalVentas'];
          break;
      }

      const groupedQuery = this.ventaRepo.createQueryBuilder('venta')
        .leftJoin('venta.detalles', 'detalles')
        .leftJoin('detalles.productoAgro', 'productoAgro')
        .leftJoin('detalles.cultivo', 'cultivo')
        .leftJoin('venta.cliente', 'cliente')
        .select(selectFields)
        .where('venta.estado != :estado', { estado: 'anulada' })
        .groupBy(groupField);

      // Aplicar mismos filtros
      if (from) groupedQuery.andWhere('venta.fecha >= :from', { from });
      if (to) groupedQuery.andWhere('venta.fecha <= :to', { to });
      if (clienteId) groupedQuery.andWhere('venta.clienteId = :clienteId', { clienteId });
      if (productoAgroId) groupedQuery.andWhere('detalles.productoAgroId = :productoAgroId', { productoAgroId });
      if (cultivoId) groupedQuery.andWhere('detalles.cultivoId = :cultivoId', { cultivoId });

      data = await groupedQuery.getRawMany();

      // Calcular totales globales
      const totalQuery = this.ventaRepo.createQueryBuilder('venta')
        .leftJoin('venta.detalles', 'detalles')
        .select('SUM(detalles.precioTotal) as totalVentas', 'SUM(detalles.cantidadKg) as totalCantidad')
        .where('venta.estado != :estado', { estado: 'anulada' });

      if (from) totalQuery.andWhere('venta.fecha >= :from', { from });
      if (to) totalQuery.andWhere('venta.fecha <= :to', { to });
      if (clienteId) totalQuery.andWhere('venta.clienteId = :clienteId', { clienteId });
      if (productoAgroId) totalQuery.andWhere('detalles.productoAgroId = :productoAgroId', { productoAgroId });
      if (cultivoId) totalQuery.andWhere('detalles.cultivoId = :cultivoId', { cultivoId });

      totalesGlobales = await totalQuery.getRawOne();
    } else {
      // Sin agrupación: retornar listado de ventas
      data = await queryBuilder.getMany();

      // Calcular totales globales
      const totalQuery = this.ventaRepo.createQueryBuilder('venta')
        .leftJoin('venta.detalles', 'detalles')
        .select('SUM(venta.total) as totalVentas', 'COUNT(DISTINCT venta.id) as cantidadVentas')
        .where('venta.estado != :estado', { estado: 'anulada' });

      if (from) totalQuery.andWhere('venta.fecha >= :from', { from });
      if (to) totalQuery.andWhere('venta.fecha <= :to', { to });
      if (clienteId) totalQuery.andWhere('venta.clienteId = :clienteId', { clienteId });
      if (productoAgroId) totalQuery.andWhere('detalles.productoAgroId = :productoAgroId', { productoAgroId });
      if (cultivoId) totalQuery.andWhere('detalles.cultivoId = :cultivoId', { cultivoId });

      totalesGlobales = await totalQuery.getRawOne();
    }

    const result = {
      data,
      totalesGlobales,
      filtrosAplicados: {
        from,
        to,
        productoAgroId,
        clienteId,
        cultivoId,
        groupBy
      }
    };

    // Si se solicita exportación
    if (exportType) {
      let exportData;
      if (groupBy) {
        exportData = data.map(item => ({
          Grupo: item.grupo,
          ...(groupBy === 'cliente' ? { 'Cantidad Ventas': item.cantidadVentas } : { 'Cantidad KG': item.cantidadKg }),
          'Total Ventas': item.totalVentas
        }));
      } else {
        exportData = data.map(venta => ({
          ID: venta.id,
          Fecha: venta.fecha.toISOString().split('T')[0],
          Cliente: venta.cliente?.nombre || 'Cliente Final',
          Subtotal: venta.subtotal,
          Impuestos: venta.impuestos,
          Descuento: venta.descuento,
          Total: venta.total,
          Estado: venta.estado
        }));
      }

      if (exportType === 'csv') {
        const csv = await this.exportService.exportToCSV(exportData);
        return { ...result, export: { type: 'csv', data: csv } };
      } else if (exportType === 'xls') {
        const buffer = await this.exportService.exportToExcel(exportData, 'Reporte_Ventas');
        return { ...result, export: { type: 'xls', data: buffer } };
      }
    }

    return result;
  }

  // ==================== REPORTES PRECIOS HISTORICOS ====================

  async getPreciosHistoricos(filters: PreciosHistoricosDto) {
    const { from, to, productoAgroId, cultivoId, agregacion = 'dia', export: exportType } = filters;

    // Determinar la función de truncado según agregación
    let dateTruncFunction: string;
    switch (agregacion) {
      case 'semana':
        dateTruncFunction = "DATE_TRUNC('week', venta.fecha)";
        break;
      case 'mes':
        dateTruncFunction = "DATE_TRUNC('month', venta.fecha)";
        break;
      case 'dia':
      default:
        dateTruncFunction = "DATE(venta.fecha)";
        break;
    }

    // Construir consulta
    const queryBuilder = this.ventaRepo.createQueryBuilder('venta')
      .leftJoin('venta.detalles', 'detalles')
      .select(`${dateTruncFunction} as fecha`)
      .addSelect('AVG(detalles.precioUnitarioKg)', 'precioPromedioKg')
      .where('venta.estado != :estado', { estado: 'anulada' })
      .groupBy(dateTruncFunction)
      .orderBy(dateTruncFunction, 'ASC');

    // Aplicar filtros de fecha
    if (from) {
      queryBuilder.andWhere('venta.fecha >= :from', { from });
    }
    if (to) {
      queryBuilder.andWhere('venta.fecha <= :to', { to });
    }

    // Filtros adicionales
    if (productoAgroId) {
      queryBuilder.andWhere('detalles.productoAgroId = :productoAgroId', { productoAgroId });
    }
    if (cultivoId) {
      queryBuilder.andWhere('detalles.cultivoId = :cultivoId', { cultivoId });
    }

    const rawData = await queryBuilder.getRawMany();

    // Formatear datos
    const data: PrecioHistoricoItem[] = rawData.map(item => ({
      fecha: item.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
      precioPromedioKg: parseFloat(item.precioPromedioKg)
    }));

    const result = {
      data,
      filtrosAplicados: {
        from,
        to,
        productoAgroId,
        cultivoId,
        agregacion
      }
    };

    // Si se solicita exportación
    if (exportType) {
      const exportData = data.map(item => ({
        Fecha: item.fecha,
        'Precio Promedio KG': item.precioPromedioKg
      }));

      if (exportType === 'csv') {
        const csv = await this.exportService.exportToCSV(exportData);
        return { ...result, export: { type: 'csv', data: csv } };
      } else if (exportType === 'xls') {
        const buffer = await this.exportService.exportToExcel(exportData, 'Precios_Historicos');
        return { ...result, export: { type: 'xls', data: buffer } };
      }
    }

    return result;
  }

  // ==================== REPORTES RENTABILIDAD ====================

  async getRentabilidadReport(filters: RentabilidadReportDto) {
    const { from, to, entidad, export: exportType } = filters;

    let entidades: any[] = [];
    let data: any[] = [];

    // Obtener entidades según el tipo
    switch (entidad) {
      case 'cultivo':
        entidades = await this.cultivoRepo.find({
          where: { deletedAt: IsNull() },
          relations: ['lote', 'subLote']
        });
        break;
      case 'lote':
        entidades = await this.loteRepo.find({
          where: { deletedAt: IsNull() }
        });
        break;
      case 'sublote':
        entidades = await this.subLoteRepo.find({
          where: { deletedAt: IsNull() },
          relations: ['lote']
        });
        break;
    }

    // Calcular rentabilidad para cada entidad
    for (const entity of entidades) {
      let rentabilidadData;

      switch (entidad) {
        case 'cultivo':
          rentabilidadData = await this.financialReportsService.getCropRentability(entity.id);
          break;
        case 'lote':
          rentabilidadData = await this.financialReportsService.getLoteRentability(entity.id);
          break;
        case 'sublote':
          rentabilidadData = await this.financialReportsService.getSubLoteRentability(entity.id);
          break;
      }

      // Filtrar por fechas si se especifican (simplificación: asumir que las fechas afectan solo si hay ventas en ese período)
      // Nota: Los métodos actuales no filtran por fechas, calculan rentabilidad total
      // Para una implementación completa, necesitaríamos modificar los métodos de financial-reports para aceptar fechas

      data.push({
        entidad: {
          id: entity.id,
          nombre: entidad === 'cultivo' ? entity.nombreCultivo : entity.nombre,
          tipo: entidad
        },
        ...rentabilidadData
      });
    }

    const result = {
      data,
      filtrosAplicados: {
        from,
        to,
        entidad
      }
    };

    // Si se solicita exportación
    if (exportType) {
      const exportData = data.map(item => ({
        'Tipo Entidad': item.entidad.tipo,
        'ID Entidad': item.entidad.id,
        'Nombre Entidad': item.entidad.nombre,
        'Ingresos': item.ingresos || 0,
        'COGS': item.cogs || 0,
        'Costos Actividad': item.costosActividad || 0,
        'Rentabilidad': item.rentabilidad || 0
      }));

      if (exportType === 'csv') {
        const csv = await this.exportService.exportToCSV(exportData);
        return { ...result, export: { type: 'csv', data: csv } };
      } else if (exportType === 'xls') {
        const buffer = await this.exportService.exportToExcel(exportData, `Rentabilidad_${entidad}`);
        return { ...result, export: { type: 'xls', data: buffer } };
      }
    }

    return result;
  }
}
