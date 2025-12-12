import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductoAgro } from '../entities/producto-agro.entity';
import { LoteProduccion } from '../entities/lote-produccion.entity';
import { MovimientoProduccion } from '../entities/movimiento-produccion.entity';
import { HistorialPrecioLote } from '../entities/historial-precio-lote.entity';
import { Cliente } from '../entities/cliente.entity';
import { Venta } from '../entities/venta.entity';
import { VentaDetalle } from '../entities/venta-detalle.entity';
import { Pago } from '../entities/pago.entity';
import { CreateProductoAgroDto } from '../dtos/create-producto-agro.dto';
import { UpdateProductoAgroDto } from '../dtos/update-producto-agro.dto';
import { CreateLoteProduccionDto } from '../dtos/create-lote-produccion.dto';
import { UpdateLoteProduccionDto } from '../dtos/update-lote-produccion.dto';

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
    @InjectRepository(HistorialPrecioLote) private historialPrecioRepo: Repository<HistorialPrecioLote>,
    private dataSource: DataSource,
  ) { }

  // ==================== PRODUCTO AGRO ====================

  // RF35: CRUD ProductoAgro
  async findAllProductos() {
    return this.productoRepo.find();
  }

  async findProductoById(id: number) {
    const producto = await this.productoRepo.findOne({ where: { id } });
    if (!producto) throw new NotFoundException(`ProductoAgro ${id} not found`);
    return producto;
  }

  async createProducto(data: CreateProductoAgroDto) {
    const producto = this.productoRepo.create(data);
    return this.productoRepo.save(producto);
  }

  async updateProducto(id: number, data: UpdateProductoAgroDto) {
    const producto = await this.findProductoById(id);
    Object.assign(producto, data);
    return this.productoRepo.save(producto);
  }

  async removeProducto(id: number) {
    const producto = await this.findProductoById(id);
    return this.productoRepo.softRemove(producto);
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
    const lote = this.loteProduccionRepo.create(data);
    return this.loteProduccionRepo.save(lote);
  }

  // RF23: Crear LoteProduccion desde cosecha
  async createLoteProduccionFromCosecha(data: {
    cultivoId: number;
    actividadCosechaId: number;
    cantidadKg: number;
    fecha: Date;
    costoCultivo?: number; // Costo acumulado real del cultivo
    usuarioId: number; // Required for MovimientoProduccion
    productoAgroId?: number; // Added
  }, manager?: any) {
    const repoLote = manager ? manager.getRepository(LoteProduccion) : this.loteProduccionRepo;
    const repoMov = manager ? manager.getRepository(MovimientoProduccion) : this.movimientoRepo;

    // Calcular costo unitario real
    let costoTotal = 0;
    let costoUnitario = 0;

    if (data.costoCultivo && data.cantidadKg > 0) {
      costoTotal = data.costoCultivo;
      costoUnitario = costoTotal / data.cantidadKg;
    }

    const loteProduccion = repoLote.create({
      productoAgroId: data.productoAgroId || 1, // Use provided ID, fallback to 1 temporarily
      cultivoId: data.cultivoId,
      actividadCosechaId: data.actividadCosechaId,
      cantidadKg: data.cantidadKg,
      stockDisponibleKg: data.cantidadKg,
      costoUnitarioKg: costoUnitario,
      costoTotal: costoTotal,
      precioSugeridoKg: costoUnitario * 1.35, // Margen sugerido 35%
      fechaExpiracion: new Date(data.fecha.getTime() + 1000 * 60 * 60 * 24 * 30), // +30 días default
    });

    const saved = await repoLote.save(loteProduccion);

    // RF37: Crear movimiento de ingreso
    const movimiento = repoMov.create({
      loteProduccionId: saved.id,
      tipo: 'INGRESO_COSECHA',
      cantidadKg: data.cantidadKg,
      costoUnitarioKg: costoUnitario,
      costoTotal: costoTotal,
      descripcion: `Ingreso por cosecha - Actividad ${data.actividadCosechaId}`,
      fecha: data.fecha,
      usuarioId: data.usuarioId,
    });

    await repoMov.save(movimiento);

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



  async updateLoteProduccion(id: number, data: UpdateLoteProduccionDto & { usuarioId: number }) {
    const lote = await this.findLoteProduccionById(id);
    const repoMov = this.movimientoRepo; // Use inject or manager if available, but assuming prop access

    let hasChanges = false;
    let changeDesc = "";

    if (data.calidad && data.calidad !== lote.calidad) {
      changeDesc += `Calidad: ${lote.calidad} -> ${data.calidad}. `;
      lote.calidad = data.calidad;
      hasChanges = true;
    }

    if (data.precioSugeridoKg !== undefined && data.precioSugeridoKg !== lote.precioSugeridoKg) {
      changeDesc += `Precio: ${lote.precioSugeridoKg} -> ${data.precioSugeridoKg}. `;
      
      // Save Price History
      if (data.usuarioId) {
        await this.historialPrecioRepo.save({
            loteProduccionId: lote.id,
            precioAnterior: lote.precioSugeridoKg,
            precioNuevo: data.precioSugeridoKg,
            usuarioId: data.usuarioId,
            fecha: new Date(),
            razon: 'Actualización de Inventario'
        });
      }

      lote.precioSugeridoKg = data.precioSugeridoKg;
      hasChanges = true;
    }

    if (hasChanges) {
      const savedLote = await this.loteProduccionRepo.save(lote);

      // Create Audit Entry
      const movimiento = repoMov.create({
        loteProduccionId: savedLote.id,
        tipo: 'AJUSTE_NOVEDAD', // Using generic adjustment type
        cantidadKg: 0, // No stock change
        costoUnitarioKg: lote.costoUnitarioKg,
        costoTotal: 0,
        descripcion: `Actualización: ${changeDesc.trim()}`,
        fecha: new Date(),
        usuarioId: data.usuarioId || 1, // Fallback if no user passed (fix controller next)
      });
      await repoMov.save(movimiento);

      return savedLote;
    }

    return lote;
  }

  async getHistorialPrecios(loteId: number) {
    return this.historialPrecioRepo.find({
        where: { loteProduccionId: loteId },
        relations: ['usuario'],
        order: { fecha: 'DESC' }
    });
  }

  async removeLoteProduccion(id: number) {
    const lote = await this.findLoteProduccionById(id);
    return this.loteProduccionRepo.softRemove(lote);
  }

  // ==================== CLIENTES ====================

  // RF38: CRUD Cliente
  async findAllClientes() {
    return this.clienteRepo.find();
  }

  async createCliente(data: { nombre: string; identificacion?: string; telefono?: string; correo?: string }) {
    const cliente = this.clienteRepo.create(data);
    return this.clienteRepo.save(cliente);
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
      // Round to 2 decimals to avoid floating point issues
      const total = Math.round((subtotal + iva) * 100) / 100;

      // Validar que los pagos cubran el total
      const totalPagos = data.pagos.reduce((sum, p) => sum + p.monto, 0);
      
      // Allow small epsilon for floating point errors or just compare rounded
      if (Math.round(totalPagos * 100) < Math.round(total * 100)) {
        throw new BadRequestException(`Los pagos (${totalPagos}) no cubren el total de la venta (${total})`);
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
          productoAgroId: loteProduccion.productoAgroId, // Required
          cultivoId: loteProduccion.cultivoId,           // Optional but useful for revenue
          cantidadKg: detalle.cantidadKg,
          precioUnitarioKg: detalle.precioUnitarioKg,
          subtotal: detalle.cantidadKg * detalle.precioUnitarioKg, // Note: This subtotal is distinct from Venta.subtotal (check logic if needed)
          precioTotal: detalle.cantidadKg * detalle.precioUnitarioKg, // Mapping correct field
          costoUnitarioKg: loteProduccion.costoUnitarioKg,
          costoTotal: detalle.cantidadKg * loteProduccion.costoUnitarioKg
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
          usuarioId: data.usuarioId, // Required field
          fecha: new Date(),
        });
      }

      // Crear pagos
      for (const pago of data.pagos) {
        await queryRunner.manager.save(Pago, {
          ventaId: savedVenta.id,
          metodo: pago.metodoPago, // Corrected column name
          monto: pago.monto,
          moneda: 'COP' // Required field
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
      relations: ['cliente', 'detalles', 'detalles.loteProduccion', 'detalles.loteProduccion.productoAgro', 'pagos'],
    });

    if (!venta) throw new NotFoundException(`Venta ${id} not found`);
    return venta;
  }

  async findAllVentas(filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }) {
    const queryBuilder = this.ventaRepo.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.loteProduccion', 'loteProduccion')
      .leftJoinAndSelect('loteProduccion.productoAgro', 'productoAgro')
      .leftJoinAndSelect('loteProduccion.cultivo', 'cultivo')
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

    return queryBuilder.orderBy('venta.fecha', 'DESC').getMany();
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
}
