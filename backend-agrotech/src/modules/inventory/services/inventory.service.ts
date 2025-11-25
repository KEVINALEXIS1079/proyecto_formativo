import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { MovimientoInsumo } from '../entities/movimiento-insumo.entity';
import { Almacen } from '../entities/almacen.entity';
import { Proveedor } from '../entities/proveedor.entity';
import { Categoria } from '../entities/categoria.entity';
import { CreateInsumoDto } from '../dtos/create-insumo.dto';
import { UpdateInsumoDto } from '../dtos/update-insumo.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { InventoryGateway } from '../gateways/inventory.gateway';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Insumo) private insumoRepo: Repository<Insumo>,
    @InjectRepository(MovimientoInsumo) private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Almacen) private almacenRepo: Repository<Almacen>,
    @InjectRepository(Proveedor) private proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Categoria) private categoriaRepo: Repository<Categoria>,
    @Inject(forwardRef(() => InventoryGateway))
    private inventoryGateway: InventoryGateway,
  ) {}

  // RF24: Crear insumo con cálculos automáticos
  async createInsumo(data: CreateInsumoDto, usuarioId: number) {
    // RF26: Validar que los catálogos referenciados existen
    if (data.categoriaId) {
      const categoria = await this.categoriaRepo.findOne({ where: { id: data.categoriaId } });
      if (!categoria) throw new BadRequestException(`Categoría ${data.categoriaId} no existe`);
    }

    if (data.almacenId) {
      const almacen = await this.almacenRepo.findOne({ where: { id: data.almacenId } });
      if (!almacen) throw new BadRequestException(`Almacén ${data.almacenId} no existe`);
    }

    if (data.proveedorId) {
      const proveedor = await this.proveedorRepo.findOne({ where: { id: data.proveedorId } });
      if (!proveedor) throw new BadRequestException(`Proveedor ${data.proveedorId} no existe`);
    }

    // Asignar unidad de uso automáticamente según tipo de materia
    let unidadUso = data.unidadUso;
    if (data.tipoMateria === 'liquido') {
      unidadUso = 'cm³';
    } else if (data.tipoMateria === 'solido') {
      unidadUso = 'gramos';
    }

    // Calcular factor de conversión basado en tipo de materia
    const presentacionCantidad = data.presentacionCantidad || 1;
    const presentacionUnidad = data.presentacionUnidad || unidadUso;
    const factorConversionUso = this.calcularFactorConversion(data.tipoMateria, presentacionUnidad, presentacionCantidad, unidadUso);

    // Calcular stock y precio en unidad de uso
    const stockPresentacion = data.stockPresentacion || 0;
    const stockUso = data.stockUso || (stockPresentacion * factorConversionUso);
    const precioUnitarioUso = data.precioUnitarioUso || 0;

    // RF24: Calcular valorInventario
    const valorInventario = stockUso * precioUnitarioUso;

    const insumo = this.insumoRepo.create({
      ...data,
      unidadUso,
      presentacionCantidad,
      presentacionUnidad,
      factorConversionUso,
      stockUso,
      stockPresentacion,
      precioUnitarioUso,
      valorInventario,
      creadoPorUsuarioId: usuarioId,
    });

    const saved = await this.insumoRepo.save(insumo);

    // Crear movimiento inicial de ingreso si hay stock
    if (stockUso > 0) {
      await this.movimientoRepo.save({
        insumoId: saved.id,
        tipo: 'INGRESO',
        cantidadUso: stockUso,
        costoUnitarioUso: precioUnitarioUso,
        costoTotal: valorInventario,
        valorInventarioResultante: valorInventario,
        descripcion: 'Stock inicial',
        usuarioId: usuarioId,
      });
    }

    // Emitir evento WebSocket
    this.inventoryGateway.broadcast('inventory:insumos:created', saved);

    return saved;
  }

  async findAllInsumos(filters?: { categoriaId?: number; almacenId?: number; q?: string }) {
    const queryBuilder = this.insumoRepo.createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .where('insumo.deletedAt IS NULL');

    if (filters?.categoriaId) {
      queryBuilder.andWhere('insumo.categoriaId = :categoriaId', { categoriaId: filters.categoriaId });
    }

    if (filters?.almacenId) {
      queryBuilder.andWhere('insumo.almacenId = :almacenId', { almacenId: filters.almacenId });
    }

    if (filters?.q) {
      queryBuilder.andWhere(
        '(insumo.nombre ILIKE :q OR insumo.descripcion ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    return queryBuilder.getMany();
  }

  // RF65: Búsqueda paginada
  async findAllInsumosPaginated(pagination: PaginationDto, filters?: { categoriaId?: number; almacenId?: number; q?: string }) {
    const { page = 1, limit = 20, orderBy = 'nombre', orderDir = 'ASC', q } = pagination;

    const queryBuilder = this.insumoRepo.createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .where('insumo.deletedAt IS NULL');

    if (filters?.categoriaId) {
      queryBuilder.andWhere('insumo.categoriaId = :categoriaId', { categoriaId: filters.categoriaId });
    }

    if (filters?.almacenId) {
      queryBuilder.andWhere('insumo.almacenId = :almacenId', { almacenId: filters.almacenId });
    }

    // Búsqueda de texto (prioridad al filtro q de paginación o al filtro específico)
    const searchQuery = q || filters?.q;
    if (searchQuery) {
      queryBuilder.andWhere(
        '(insumo.nombre ILIKE :q OR insumo.descripcion ILIKE :q)',
        { q: `%${searchQuery}%` }
      );
    }

    // Paginación
    queryBuilder
      .orderBy(`insumo.${orderBy}`, orderDir.toUpperCase() as 'ASC' | 'DESC')
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

  async findInsumoById(id: number) {
    const insumo = await this.insumoRepo.findOne({
      where: { id },
      relations: ['categoria', 'almacen', 'proveedor'],
    });

    if (!insumo) throw new NotFoundException(`Insumo ${id} not found`);
    return insumo;
  }

  async updateInsumo(id: number, data: UpdateInsumoDto) {
    const insumo = await this.findInsumoById(id);

    // RF26: Validar que los catálogos referenciados existen
    if (data.categoriaId !== undefined) {
      const categoria = await this.categoriaRepo.findOne({ where: { id: data.categoriaId } });
      if (!categoria) throw new BadRequestException(`Categoría ${data.categoriaId} no existe`);
    }

    if (data.almacenId !== undefined) {
      const almacen = await this.almacenRepo.findOne({ where: { id: data.almacenId } });
      if (!almacen) throw new BadRequestException(`Almacén ${data.almacenId} no existe`);
    }

    if (data.proveedorId !== undefined) {
      const proveedor = await this.proveedorRepo.findOne({ where: { id: data.proveedorId } });
      if (!proveedor) throw new BadRequestException(`Proveedor ${data.proveedorId} no existe`);
    }

    // Si se actualizan campos de presentación o stock, recalcular
    if (
      data.presentacionCantidad !== undefined ||
      data.stockPresentacion !== undefined ||
      data.precioUnitarioUso !== undefined
    ) {
      const presentacionCantidad = data.presentacionCantidad ?? insumo.presentacionCantidad ?? 1;
      const stockPresentacion = data.stockPresentacion ?? insumo.stockPresentacion ?? 0;
      const precioUnitarioUso = data.precioUnitarioUso ?? insumo.precioUnitarioUso ?? 0;

      // Recalcular valores derivados
      data.stockUso = stockPresentacion * presentacionCantidad;
      data.valorInventario = data.stockUso * precioUnitarioUso;
      data.factorConversionUso = presentacionCantidad;
    }

    Object.assign(insumo, data);
    const updated = await this.insumoRepo.save(insumo);

    // Emitir evento WebSocket
    this.inventoryGateway.broadcast('inventory:insumos:updated', updated);

    return updated;
  }

  async removeInsumo(id: number) {
    const insumo = await this.findInsumoById(id);
    const removed = await this.insumoRepo.softRemove(insumo);

    // Emitir evento WebSocket
    this.inventoryGateway.broadcast('inventory:insumos:deleted', removed);

    return removed;
  }

  // RF25: Movimientos de insumo
  async createMovimiento(data: {
    insumoId: number;
    tipo: string;
    cantidadPresentacion?: number;
    cantidadUso: number;
    costoUnitarioUso: number;
    descripcion?: string;
    actividadId?: number;
  }) {
    // RF26: Validar que el insumo existe y no está eliminado
    const insumo = await this.insumoRepo.findOne({
      where: { id: data.insumoId, deletedAt: IsNull() },
      relations: ['categoria', 'almacen', 'proveedor'],
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo ${data.insumoId} no encontrado o eliminado`);
    }

    // RF26: Validar que no quede stock negativo (stockUso y stockPresentacion)
    if (data.tipo === 'CONSUMO' || data.tipo === 'SALIDA') {
      // Validar stockUso
      if (insumo.stockUso < data.cantidadUso) {
        throw new BadRequestException(
          `Stock insuficiente en unidad de uso. Disponible: ${insumo.stockUso} ${insumo.unidadUso}, Solicitado: ${data.cantidadUso} ${insumo.unidadUso}`
        );
      }

      // Validar stockPresentacion si se especifica
      if (data.cantidadPresentacion) {
        if (insumo.stockPresentacion < data.cantidadPresentacion) {
          throw new BadRequestException(
            `Stock insuficiente en presentación. Disponible: ${insumo.stockPresentacion} ${insumo.presentacionUnidad}, Solicitado: ${data.cantidadPresentacion} ${insumo.presentacionUnidad}`
          );
        }
      }
    }

    const movimiento = this.movimientoRepo.create({
      ...data,
      costoTotal: data.cantidadUso * data.costoUnitarioUso,
    });

    await this.movimientoRepo.save(movimiento);

    // Actualizar stock del insumo
    if (data.tipo === 'INGRESO' || data.tipo === 'INGRESO_COMPRA') {
      insumo.stockUso += data.cantidadUso;
      if (data.cantidadPresentacion) {
        insumo.stockPresentacion += data.cantidadPresentacion;
      }
    } else if (data.tipo === 'CONSUMO' || data.tipo === 'SALIDA') {
      insumo.stockUso -= data.cantidadUso;
      if (data.cantidadPresentacion) {
        insumo.stockPresentacion -= data.cantidadPresentacion;
      }
    }

    // RF26: Recalcular campos derivados
    // Si el movimiento afecta el precio, recalcular precioUnitarioUso
    if (data.tipo === 'INGRESO' || data.tipo === 'INGRESO_COMPRA') {
      // Recalcular precio promedio ponderado si hay nuevo ingreso con costo
      if (data.costoUnitarioUso && data.costoUnitarioUso > 0) {
        const valorAnterior = insumo.stockUso * insumo.precioUnitarioUso;
        const valorNuevo = data.cantidadUso * data.costoUnitarioUso;
        const stockTotal = insumo.stockUso + data.cantidadUso;
        
        if (stockTotal > 0) {
          insumo.precioUnitarioUso = (valorAnterior + valorNuevo) / stockTotal;
        }
      }
    }

    // Recalcular valorInventario basado en stock y precio actuales
    insumo.valorInventario = insumo.stockUso * insumo.precioUnitarioUso;

    await this.insumoRepo.save(insumo);

    return movimiento;
  }

  // RF20: Consumir insumo desde actividad
  async consumirInsumo(insumoId: number, cantidadUso: number, actividadId: number) {
    // RF26: Validar que la actividad existe
    const actividadRepo = this.insumoRepo.manager.getRepository('Actividad');
    const actividad = await actividadRepo.findOne({ where: { id: actividadId } });
    if (!actividad) {
      throw new BadRequestException(`Actividad ${actividadId} no existe`);
    }

    const insumo = await this.findInsumoById(insumoId);

    return this.createMovimiento({
      insumoId,
      tipo: 'CONSUMO',
      cantidadUso,
      costoUnitarioUso: insumo.precioUnitarioUso,
      descripcion: `Consumo en actividad ${actividadId}`,
      actividadId,
    });
  }

  // RF25: Historial de movimientos
  async findMovimientosByInsumo(insumoId: number) {
    return this.movimientoRepo.find({
      where: { insumoId },
      order: { createdAt: 'DESC' },
    });
  }

  // RF24: Calcular factor de conversión
  private calcularFactorConversion(
    tipoMateria: string,
    presentacionUnidad: string,
    presentacionCantidad: number,
    unidadUso: string,
  ): number {
    // Para líquidos: cm³, para sólidos: gramos
    if (tipoMateria === 'liquido') {
      // Si la presentación es en litros y uso es cm³, convertir
      if (presentacionUnidad.toLowerCase().includes('litro') && unidadUso === 'cm³') {
        return presentacionCantidad * 1000; // 1 litro = 1000 cm³
      }
      // Si la presentación es en ml y uso es cm³, convertir
      if (presentacionUnidad.toLowerCase().includes('ml') && unidadUso === 'cm³') {
        return presentacionCantidad; // 1 ml = 1 cm³
      }
    } else if (tipoMateria === 'solido') {
      // Si la presentación es en kg y uso es gramos, convertir
      if (presentacionUnidad.toLowerCase().includes('kg') && unidadUso === 'gramos') {
        return presentacionCantidad * 1000; // 1 kg = 1000 gramos
      }
      // Si la presentación es en toneladas y uso es gramos, convertir
      if (presentacionUnidad.toLowerCase().includes('tonelada') && unidadUso === 'gramos') {
        return presentacionCantidad * 1000000; // 1 tonelada = 1,000,000 gramos
      }
    }

    // Por defecto retornamos presentacionCantidad
    return presentacionCantidad;
  }

  // ==================== CATÁLOGOS ====================

  // Almacenes
  async findAllAlmacenes() {
    return this.almacenRepo.find();
  }

  async createAlmacen(data: { nombre: string; ubicacion?: string }) {
    const almacen = this.almacenRepo.create(data);
    return this.almacenRepo.save(almacen);
  }

  // Proveedores
  async findAllProveedores() {
    return this.proveedorRepo.find();
  }

  async createProveedor(data: { nombre: string; contacto?: string; telefono?: string }) {
    const proveedor = this.proveedorRepo.create(data);
    return this.proveedorRepo.save(proveedor);
  }

  // Categorías
  async findAllCategorias() {
    return this.categoriaRepo.find();
  }

  async createCategoria(data: { nombre: string; descripcion?: string }) {
    const categoria = this.categoriaRepo.create(data);
    return this.categoriaRepo.save(categoria);
  }
}
