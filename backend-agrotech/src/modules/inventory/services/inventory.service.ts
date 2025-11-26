import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { MovimientoInsumo } from '../entities/movimiento-insumo.entity';
import { Almacen } from '../entities/almacen.entity';
import { Proveedor } from '../entities/proveedor.entity';
import { Categoria } from '../entities/categoria.entity';
import { CreateInsumoDto } from '../dtos/create-insumo.dto';
import { UpdateInsumoDto } from '../dtos/update-insumo.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Insumo) private insumoRepo: Repository<Insumo>,
    @InjectRepository(MovimientoInsumo) private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Almacen) private almacenRepo: Repository<Almacen>,
    @InjectRepository(Proveedor) private proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Categoria) private categoriaRepo: Repository<Categoria>,
  ) {}

  // RF24: Crear insumo con cálculos automáticos
  async createInsumo(data: CreateInsumoDto, usuarioId: number) {
    // Determinar unidad de uso según tipo de materia
    let unidadUso = data.unidadUso;
    if (!unidadUso) {
      unidadUso = data.tipoMateria === 'solido' ? 'g' : 'cm3';
    }

    // Calcular factor de conversión automático según tipo de materia y unidad de presentación
    let factorConversionUso = data.factorConversionUso;
    if (!factorConversionUso) {
      const presentacionUnidad = (data.presentacionUnidad || '').toLowerCase();
      const presentacionCantidad = data.presentacionCantidad || 1;

      if (data.tipoMateria === 'solido') {
        // Sólidos: convertir a gramos
        if (presentacionUnidad === 'kg' || presentacionUnidad === 'kilogramo') {
          factorConversionUso = presentacionCantidad * 1000; // 1 kg = 1000 g
        } else if (presentacionUnidad === 'g' || presentacionUnidad === 'gramo') {
          factorConversionUso = presentacionCantidad; // ya está en gramos
        } else {
          // Por defecto, asumir que la presentación ya está en gramos
          factorConversionUso = presentacionCantidad;
        }
      } else if (data.tipoMateria === 'liquido') {
        // Líquidos: convertir a cm³
        if (presentacionUnidad === 'l' || presentacionUnidad === 'litro') {
          factorConversionUso = presentacionCantidad * 1000; // 1 L = 1000 cm³
        } else if (presentacionUnidad === 'ml' || presentacionUnidad === 'mililitro') {
          factorConversionUso = presentacionCantidad; // 1 ml = 1 cm³
        } else if (presentacionUnidad === 'cm3' || presentacionUnidad === 'cm³') {
          factorConversionUso = presentacionCantidad; // ya está en cm³
        } else {
          // Por defecto, asumir que la presentación ya está en cm³
          factorConversionUso = presentacionCantidad;
        }
      } else {
        // Tipo de materia no especificado o desconocido
        factorConversionUso = data.presentacionCantidad || 1;
      }
    }

    // Calcular stock y precio en unidad de uso
    const stockPresentacion = data.stockPresentacion || 0;
    const stockUso = stockPresentacion * factorConversionUso;
    const precioUnitarioPresentacion = data.precioUnitarioPresentacion || 0;
    const precioUnitarioUso = precioUnitarioPresentacion / factorConversionUso;

    // RF24: Calcular valorInventario
    const valorInventario = stockUso * precioUnitarioUso;

    const insumo = this.insumoRepo.create({
      ...data,
      unidadUso,
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
        tipoMovimiento: 'INGRESO',
        cantidadUso: stockUso,
        precioUnitario: precioUnitarioUso,
        valorTotal: valorInventario,
        fecha: new Date(),
        descripcion: 'Stock inicial',
      });
    }

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
    return this.insumoRepo.save(insumo);
  }

  async removeInsumo(id: number) {
    const insumo = await this.findInsumoById(id);
    return this.insumoRepo.softRemove(insumo);
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
    const insumo = await this.findInsumoById(data.insumoId);

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
      // Recalcular precio promedio ponderado si hay nuevo ingreso con costo
      if (data.costoUnitarioUso && data.costoUnitarioUso > 0) {
        // El stockUso ya fue actualizado arriba, así que restamos la cantidad actual para obtener el anterior
        const stockAnterior = insumo.stockUso - data.cantidadUso;
        const valorAnterior = stockAnterior * insumo.precioUnitarioUso;
        const valorNuevo = data.cantidadUso * data.costoUnitarioUso;
        const stockTotal = insumo.stockUso; // Ya actualizado
        
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
    // Por ahora retornamos presentacionCantidad
    // TODO: implementar conversiones específicas según tipo de materia
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
