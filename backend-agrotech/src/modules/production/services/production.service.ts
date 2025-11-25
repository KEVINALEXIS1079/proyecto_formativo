import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductoAgro } from '../entities/producto-agro.entity';
import { LoteProduccion } from '../entities/lote-produccion.entity';
import { MovimientoProduccion } from '../entities/movimiento-produccion.entity';
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
    private dataSource: DataSource,
  ) {}

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
  }) {
    // Por ahora asumimos productoAgroId = 1 (debe venir de config o del cultivo)
    const loteProduccion = this.loteProduccionRepo.create({
      productoAgroId: 1, // TODO: Obtener del cultivo
      cultivoId: data.cultivoId,
      actividadCosechaId: data.actividadCosechaId,
      cantidadKg: data.cantidadKg,
      stockDisponibleKg: data.cantidadKg, // El stock inicial es igual a la cantidad cosechada
      costoUnitarioKg: 0, // TODO: Calcular desde costos del cultivo
      costoTotal: 0,
      precioSugeridoKg: 0, // TODO: Calcular
    });

    const saved = await this.loteProduccionRepo.save(loteProduccion);

    // RF37: Crear movimiento de ingreso
    await this.movimientoRepo.save({
      loteProduccionId: saved.id,
      tipo: 'INGRESO_COSECHA',
      cantidadKg: data.cantidadKg,
      costoUnitarioKg: 0,
      costoTotal: 0,
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
          cantidadKg: detalle.cantidadKg,
          precioUnitarioKg: detalle.precioUnitarioKg,
          subtotal: detalle.cantidadKg * detalle.precioUnitarioKg,
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
      relations: ['cliente', 'detalles', 'detalles.loteProduccion', 'pagos'],
    });

    if (!venta) throw new NotFoundException(`Venta ${id} not found`);
    return venta;
  }

  async findAllVentas(filters?: { clienteId?: number; fechaInicio?: Date; fechaFin?: Date }) {
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
