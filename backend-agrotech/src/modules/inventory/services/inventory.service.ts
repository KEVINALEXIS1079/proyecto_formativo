import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { MovimientoInsumo } from '../entities/movimiento-insumo.entity';
import { Almacen } from '../entities/almacen.entity';
import { Proveedor } from '../entities/proveedor.entity';
import { Categoria } from '../entities/categoria.entity';
import { CreateInsumoDto } from '../dtos/create-insumo.dto';
import { UpdateInsumoDto } from '../dtos/update-insumo.dto';
import { MovimientoInsumoService } from './movimiento-insumo.service';
import { UsoHerramienta } from '../entities/uso-herramienta.entity';
import { DepreciationService } from './depreciation.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Insumo) private insumoRepo: Repository<Insumo>,
    @InjectRepository(MovimientoInsumo)
    private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Almacen) private almacenRepo: Repository<Almacen>,
    @InjectRepository(Proveedor) private proveedorRepo: Repository<Proveedor>,
    @InjectRepository(Categoria) private categoriaRepo: Repository<Categoria>,
    @InjectRepository(UsoHerramienta) private usoHerramientaRepo: Repository<UsoHerramienta>,
    private movimientoInsumoService: MovimientoInsumoService,
    private depreciationService: DepreciationService,
  ) { }

  // RF24: Crear insumo con cálculos automáticos
  async createInsumo(data: CreateInsumoDto, usuarioId: number) {
    // Determinar unidad de uso según tipo de materia
    let unidadUso = data.unidadUso;
    if (!unidadUso) {
      unidadUso = data.tipoMateria === 'solido' ? 'g' : 'cm3';
    }

    // Validar valores negativos
    if ((data.stockPresentacion && data.stockPresentacion < 0) ||
      (data.precioUnitarioPresentacion && data.precioUnitarioPresentacion < 0)) {
      throw new BadRequestException('El stock y precio no pueden ser negativos');
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
        } else if (
          presentacionUnidad === 'g' ||
          presentacionUnidad === 'gramo'
        ) {
          factorConversionUso = presentacionCantidad; // ya está en gramos
        } else {
          // Por defecto, asumir que la presentación ya está en gramos
          factorConversionUso = presentacionCantidad;
        }
      } else if (data.tipoMateria === 'liquido') {
        // Líquidos: convertir a cm³
        if (presentacionUnidad === 'l' || presentacionUnidad === 'litro') {
          factorConversionUso = presentacionCantidad * 1000; // 1 L = 1000 cm³
        } else if (
          presentacionUnidad === 'ml' ||
          presentacionUnidad === 'mililitro'
        ) {
          factorConversionUso = presentacionCantidad; // 1 ml = 1 cm³
        } else if (
          presentacionUnidad === 'cm3' ||
          presentacionUnidad === 'cm³'
        ) {
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
      fechaRegistro: new Date(),
      creadoPorUsuarioId: usuarioId,
    });

    const saved = await this.insumoRepo.save(insumo);

    // Crear movimiento inicial de ingreso si hay stock
    if (stockUso > 0) {
      await this.movimientoRepo.save({
        insumoId: saved.id,
        tipo: 'INICIAL',
        cantidadUso: stockUso,
        descripcion: 'Stock inicial',
        usuarioId: usuarioId,
        cantidadPresentacion: stockPresentacion,
        costoUnitarioPresentacion: precioUnitarioPresentacion,
        costoUnitarioUso: precioUnitarioUso,
        costoTotal: valorInventario,
        valorInventarioResultante: valorInventario,
      });
    }

    return saved;
  }

  async findAllInsumos(filters?: {
    categoriaId?: number;
    almacenId?: number;
    proveedorId?: number;
    tipoInsumo?: string;
    q?: string;
  }) {
    const queryBuilder = this.insumoRepo
      .createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .where('insumo.deletedAt IS NULL');

    if (filters?.tipoInsumo) {
      queryBuilder.andWhere('insumo.tipoInsumo = :tipoInsumo', {
        tipoInsumo: filters.tipoInsumo,
      });
    }

    if (filters?.categoriaId) {
      queryBuilder.andWhere('insumo.categoriaId = :categoriaId', {
        categoriaId: filters.categoriaId,
      });
    }

    if (filters?.almacenId) {
      queryBuilder.andWhere('insumo.almacenId = :almacenId', {
        almacenId: filters.almacenId,
      });
    }

    if (filters?.proveedorId) {
      queryBuilder.andWhere('insumo.proveedorId = :proveedorId', {
        proveedorId: filters.proveedorId,
      });
    }

    if (filters?.q) {
      queryBuilder.andWhere(
        '(insumo.nombre ILIKE :q OR insumo.descripcion ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findInsumoById(id: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Insumo) : this.insumoRepo;
    const insumo = await repo.findOne({
      where: { id },
      relations: ['categoria', 'almacen', 'proveedor'],
    });

    if (!insumo) throw new NotFoundException(`Insumo ${id} not found`);
    return insumo;
  }

  async updateInsumo(id: number, data: UpdateInsumoDto, usuarioId?: number) {
    const insumo = await this.findInsumoById(id);
    const almacenAnteriorId = insumo.almacenId;

    // Si se actualizan campos de presentación o stock, recalcular
    if (
      data.presentacionCantidad !== undefined ||
      data.stockPresentacion !== undefined ||
      data.precioUnitarioUso !== undefined
    ) {
      const presentacionCantidad =
        data.presentacionCantidad ?? insumo.presentacionCantidad ?? 1;
      const stockPresentacion =
        data.stockPresentacion ?? insumo.stockPresentacion ?? 0;
      const precioUnitarioUso =
        data.precioUnitarioUso ?? insumo.precioUnitarioUso ?? 0;

      if (stockPresentacion < 0 || precioUnitarioUso < 0) {
        throw new BadRequestException('El stock y precio no pueden ser negativos');
      }

      // Recalcular factorConversionUso si cambió presentacionCantidad
      let factorConversionUso = insumo.factorConversionUso;
      if (data.presentacionCantidad !== undefined) {
        // Recalcular factor de conversión como en create
        const presentacionUnidad =
          insumo.presentacionUnidad?.toLowerCase() || '';
        if (insumo.tipoMateria === 'solido') {
          if (
            presentacionUnidad === 'kg' ||
            presentacionUnidad === 'kilogramo'
          ) {
            factorConversionUso = presentacionCantidad * 1000;
          } else if (
            presentacionUnidad === 'g' ||
            presentacionUnidad === 'gramo'
          ) {
            factorConversionUso = presentacionCantidad;
          } else {
            factorConversionUso = presentacionCantidad;
          }
        } else if (insumo.tipoMateria === 'liquido') {
          if (presentacionUnidad === 'l' || presentacionUnidad === 'litro') {
            factorConversionUso = presentacionCantidad * 1000;
          } else if (
            presentacionUnidad === 'ml' ||
            presentacionUnidad === 'mililitro'
          ) {
            factorConversionUso = presentacionCantidad;
          } else if (
            presentacionUnidad === 'cm3' ||
            presentacionUnidad === 'cm³'
          ) {
            factorConversionUso = presentacionCantidad;
          } else {
            factorConversionUso = presentacionCantidad;
          }
        } else {
          factorConversionUso = presentacionCantidad;
        }
        data.factorConversionUso = factorConversionUso;
      }

      // Recalcular valores derivados usando factorConversionUso correcto
      data.stockUso =
        stockPresentacion * (data.factorConversionUso ?? factorConversionUso);
      data.valorInventario = data.stockUso * precioUnitarioUso;
    }

    Object.assign(insumo, data);
    const saved = await this.insumoRepo.save(insumo);

    // Si cambió el almacén, crear movimiento de traslado
    if (
      data.almacenId !== undefined &&
      data.almacenId !== almacenAnteriorId &&
      usuarioId
    ) {
      await this.movimientoInsumoService.create({
        insumoId: id,
        tipo: 'TRASLADO',
        cantidadUso: 0, // No cambia stock
        costoUnitarioUso: insumo.precioUnitarioUso,
        descripcion: data.descripcionOperacion || `Traslado de almacén`,
        usuarioId,
        almacenOrigenId: almacenAnteriorId,
        almacenDestinoId: data.almacenId,
      });
    }

    return saved;
  }

  async removeInsumo(id: number) {
    const insumo = await this.findInsumoById(id);

    // DEBUG: Verificar dependencias antes de eliminar
    console.log(`DEBUG: Intentando eliminar insumo ${id} - ${insumo.nombre}`);
    console.log(`DEBUG: Stock actual: ${insumo.stockUso} ${insumo.unidadUso}`);
    console.log(`DEBUG: Valor inventario: ${insumo.valorInventario}`);

    // Verificar si tiene movimientos
    const hasMovimientos = await this.hasMovimientosByInsumo(id);
    console.log(`DEBUG: Tiene movimientos: ${hasMovimientos}`);

    // Verificar si tiene stock
    const hasStock = insumo.stockUso > 0;
    console.log(`DEBUG: Tiene stock: ${hasStock}`);

    // TODO: Agregar validaciones aquí si es necesario

    return this.insumoRepo.softRemove(insumo);
  }

  async registrarMantenimiento(id: number, data: { costo?: number; descripcion?: string }) {
    const insumo = await this.findInsumoById(id);
    insumo.estado = 'MANTENIMIENTO';
    insumo.fechaUltimoMantenimiento = new Date();
    // Aquí se podría registrar el costo y descripción en un historial de mantenimiento si existiera la entidad
    return this.insumoRepo.save(insumo);
  }

  async finalizarMantenimiento(id: number) {
    const insumo = await this.findInsumoById(id);
    insumo.estado = 'DISPONIBLE';
    // Resetear fecha de mantenimiento o guardar historial
    return this.insumoRepo.save(insumo);
  }

  // RF25: Movimientos de insumo
  async createMovimiento(
    data: {
      insumoId: number;
      tipo: string;
      cantidadPresentacion?: number;
      cantidadUso: number;
      costoUnitarioUso: number;
      descripcion?: string;
      actividadId?: number;
      usuarioId?: number;
    },
    manager?: EntityManager,
  ) {
    const insumo = await this.findInsumoById(data.insumoId);

    // RF26: Validar que no quede stock negativo (stockUso y stockPresentacion)
    if (data.tipo === 'CONSUMO' || data.tipo === 'SALIDA') {
      // Validar stockUso
      if (insumo.stockUso < data.cantidadUso) {
        throw new BadRequestException(
          `Stock insuficiente en unidad de uso. Disponible: ${insumo.stockUso} ${insumo.unidadUso}, Solicitado: ${data.cantidadUso} ${insumo.unidadUso}`,
        );
      }

      // Validar stockPresentacion si se especifica
      if (data.cantidadPresentacion) {
        if (insumo.stockPresentacion < data.cantidadPresentacion) {
          throw new BadRequestException(
            `Stock insuficiente en presentación. Disponible: ${insumo.stockPresentacion} ${insumo.presentacionUnidad}, Solicitado: ${data.cantidadPresentacion} ${insumo.presentacionUnidad}`,
          );
        }
      }
    }

    // Calcular cantidadPresentacion si no se proporciona
    if (data.cantidadPresentacion === undefined) {
      // cantidadPresentacion = cantidadUso / factorConversionUso
      // Ejemplo: 500g / 1000 (1kg=1000g) = 0.5kg
      data.cantidadPresentacion =
        data.cantidadUso / (insumo.factorConversionUso || 1);
    }

    // Calcular el stock resultante para determinar valorInventarioResultante
    let stockResultante = insumo.stockUso;
    if (data.tipo === 'INGRESO' || data.tipo === 'INGRESO_COMPRA') {
      stockResultante += data.cantidadUso;
    } else if (data.tipo === 'CONSUMO' || data.tipo === 'SALIDA') {
      stockResultante -= data.cantidadUso;
    }

    // Calcular el valor del inventario resultante
    // Para ingresos, necesitamos calcular el nuevo precio promedio ponderado primero
    let precioUnitarioResultante = insumo.precioUnitarioUso;
    if (data.tipo === 'INGRESO' || data.tipo === 'INGRESO_COMPRA') {
      if (data.costoUnitarioUso && data.costoUnitarioUso > 0) {
        const valorAnterior = insumo.stockUso * insumo.precioUnitarioUso;
        const valorNuevo = data.cantidadUso * data.costoUnitarioUso;
        if (stockResultante > 0) {
          precioUnitarioResultante =
            (valorAnterior + valorNuevo) / stockResultante;
        }
      }
    }

    const valorInventarioResultante =
      stockResultante * precioUnitarioResultante;

    const movimiento = this.movimientoRepo.create({
      ...data,
      cantidadPresentacion: data.cantidadPresentacion,
      costoUnitarioPresentacion:
        data.costoUnitarioUso * (insumo.factorConversionUso || 1),
      costoTotal: data.cantidadUso * data.costoUnitarioUso,
      valorInventarioResultante,
    });

    const repoMovimiento = manager ? manager.getRepository(MovimientoInsumo) : this.movimientoRepo;
    const repoInsumo = manager ? manager.getRepository(Insumo) : this.insumoRepo;

    await repoMovimiento.save(movimiento);

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

    await repoInsumo.save(insumo);

    return movimiento;
  }

  // RF20: Consumir insumo desde actividad
  async consumirInsumo(
    insumoId: number,
    cantidadUso: number,
    actividadId: number,
    usuarioId: number,
    descripcion?: string,
    manager?: EntityManager,
  ) {
    const insumo = await this.findInsumoById(insumoId, manager);

    return this.createMovimiento({
      insumoId,
      tipo: 'CONSUMO',
      cantidadUso,
      costoUnitarioUso: insumo.precioUnitarioUso,
      descripcion: descripcion || `Consumo en actividad ${actividadId}`,
      actividadId,
      usuarioId,
    }, manager);
  }
  async registrarUsoHerramienta(
    insumoId: number,
    horasUso: number,
    actividadId: number,
    manager?: EntityManager
  ) {
    const insumo = await this.findInsumoById(insumoId, manager);

    // Calcular depreciación
    const depreciacion = this.depreciationService.calcularDepreciacionPorUso(
      insumo.costoAdquisicion || 0,
      insumo.valorResidual || 0,
      insumo.vidaUtilHoras || 1
    ) * horasUso;

    // Crear registro de uso
    const uso = this.usoHerramientaRepo.create({
      actividadId,
      insumoId,
      horasUsadas: horasUso,
      depreciacionGenerada: depreciacion,
      valorEnLibrosAntes: insumo.costoAdquisicion - (insumo.depreciacionAcumulada || 0),
      valorEnLibrosDespues: insumo.costoAdquisicion - (insumo.depreciacionAcumulada || 0) - depreciacion,
      fechaUso: new Date(),
    });

    if (manager) {
      await manager.save(uso);
    } else {
      await this.usoHerramientaRepo.save(uso);
    }

    // Actualizar insumo
    insumo.horasUsadas = (insumo.horasUsadas || 0) + horasUso;
    insumo.depreciacionAcumulada = (insumo.depreciacionAcumulada || 0) + depreciacion;

    if (manager) {
      return manager.save(insumo);
    } else {
      return this.insumoRepo.save(insumo);
    }
  }

  // RF25: Historial de movimientos
  async findMovimientosByInsumo(insumoId: number) {
    return this.movimientoRepo.find({
      where: { insumoId },
      relations: ['insumo', 'usuario', 'actividad'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllMovimientos(filters?: {
    insumoId?: number;
    tipo?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    return this.movimientoInsumoService.findAllGeneral(filters);
  }

  // Verificar si un insumo tiene movimientos
  async hasMovimientosByInsumo(insumoId: number): Promise<boolean> {
    const count = await this.movimientoRepo.count({
      where: { insumoId },
    });
    return count > 0;
  }

  // Eliminar movimiento y revertir cambios en stock
  async deleteMovimiento(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['insumo'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento ${id} not found`);
    }

    const insumo = movimiento.insumo;

    // Revertir cambios en stock
    if (movimiento.tipo === 'INGRESO' || movimiento.tipo === 'INGRESO_COMPRA') {
      insumo.stockUso -= movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion -= movimiento.cantidadPresentacion;
      }
    } else if (movimiento.tipo === 'CONSUMO' || movimiento.tipo === 'SALIDA') {
      insumo.stockUso += movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion += movimiento.cantidadPresentacion;
      }
    }

    // Recalcular valorInventario
    insumo.valorInventario = insumo.stockUso * insumo.precioUnitarioUso;

    await this.insumoRepo.save(insumo);
    await this.movimientoRepo.remove(movimiento);

    return movimiento;
  }

  // Actualizar movimiento y recalcular stock
  async updateMovimiento(
    id: number,
    data: {
      tipo?: string;
      cantidadPresentacion?: number;
      cantidadUso?: number;
      costoUnitarioUso?: number;
      descripcion?: string;
      actividadId?: number;
    },
  ) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['insumo'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento ${id} not found`);
    }

    const insumo = movimiento.insumo;

    // Revertir cambios actuales en stock
    if (movimiento.tipo === 'INGRESO' || movimiento.tipo === 'INGRESO_COMPRA') {
      insumo.stockUso -= movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion -= movimiento.cantidadPresentacion;
      }
    } else if (movimiento.tipo === 'CONSUMO' || movimiento.tipo === 'SALIDA') {
      insumo.stockUso += movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion += movimiento.cantidadPresentacion;
      }
    }

    // Actualizar el movimiento con nuevos datos
    Object.assign(movimiento, data);

    // Calcular cantidadPresentacion si no se proporciona
    if (
      data.cantidadPresentacion === undefined &&
      data.cantidadUso !== undefined
    ) {
      movimiento.cantidadPresentacion =
        data.cantidadUso / (insumo.factorConversionUso || 1);
    }

    // Aplicar nuevos cambios en stock
    if (movimiento.tipo === 'INGRESO' || movimiento.tipo === 'INGRESO_COMPRA') {
      insumo.stockUso += movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion += movimiento.cantidadPresentacion;
      }
    } else if (movimiento.tipo === 'CONSUMO' || movimiento.tipo === 'SALIDA') {
      insumo.stockUso -= movimiento.cantidadUso;
      if (movimiento.cantidadPresentacion) {
        insumo.stockPresentacion -= movimiento.cantidadPresentacion;
      }
    }

    // Recalcular valorInventario
    insumo.valorInventario = insumo.stockUso * insumo.precioUnitarioUso;

    await this.insumoRepo.save(insumo);
    await this.movimientoRepo.save(movimiento);

    return movimiento;
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

  async findOneAlmacen(id: number) {
    console.log(`DEBUG: Buscando almacén con ID: ${id}`);
    const almacen = await this.almacenRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!almacen) {
      console.error(`DEBUG: Almacén ${id} no encontrado`);
      throw new NotFoundException(`Almacén ${id} no encontrado`);
    }

    console.log(`DEBUG: Almacén encontrado:`, almacen.nombre);
    return almacen;
  }

  async createAlmacen(data: { nombre: string; descripcion?: string }) {
    console.log('DEBUG: Creando almacén con datos:', data);
    const almacen = this.almacenRepo.create(data);
    const saved = await this.almacenRepo.save(almacen);
    console.log('DEBUG: Almacén creado exitosamente:', saved);
    return saved;
  }

  async updateAlmacen(
    id: number,
    data: { nombre?: string; descripcion?: string },
  ) {
    console.log('DEBUG: Actualizando almacén', id, 'con datos:', data);
    const almacen = await this.findOneAlmacen(id);
    Object.assign(almacen, data);
    const saved = await this.almacenRepo.save(almacen);
    console.log('DEBUG: Almacén actualizado exitosamente:', saved);
    return saved;
  }

  // Proveedores
  async findAllProveedores() {
    return this.proveedorRepo.find();
  }

  async findOneProveedor(id: number) {
    console.log(`DEBUG: Buscando proveedor con ID: ${id}`);
    const proveedor = await this.proveedorRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!proveedor) {
      console.error(`DEBUG: Proveedor ${id} no encontrado`);
      throw new NotFoundException(`Proveedor ${id} no encontrado`);
    }

    console.log(`DEBUG: Proveedor encontrado:`, proveedor.nombre);
    return proveedor;
  }

  async createProveedor(data: {
    nombre: string;
    contacto?: string;
    telefono?: string;
  }) {
    console.log('DEBUG: Creando proveedor con datos:', data);
    const proveedor = this.proveedorRepo.create(data);
    const saved = await this.proveedorRepo.save(proveedor);
    console.log('DEBUG: Proveedor creado exitosamente:', saved);
    return saved;
  }

  async updateProveedor(
    id: number,
    data: { nombre?: string; contacto?: string; telefono?: string },
  ) {
    console.log('DEBUG: Actualizando proveedor', id, 'con datos:', data);
    const proveedor = await this.findOneProveedor(id);
    Object.assign(proveedor, data);
    const saved = await this.proveedorRepo.save(proveedor);
    console.log('DEBUG: Proveedor actualizado exitosamente:', saved);
    return saved;
  }

  // Categorías
  async findAllCategorias() {
    return this.categoriaRepo.find();
  }

  async findOneCategoria(id: number) {
    const categoria = await this.categoriaRepo.findOne({
      where: { id },
      relations: ['insumos'],
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }

    return categoria;
  }

  async createCategoria(data: { nombre: string; descripcion?: string }) {
    console.log('Creando categoría con datos:', data);
    const categoria = this.categoriaRepo.create(data);
    const saved = await this.categoriaRepo.save(categoria);
    console.log('Categoría creada exitosamente:', saved);
    return saved;
  }

  async updateCategoria(
    id: number,
    data: { nombre?: string; descripcion?: string },
  ) {
    console.log('DEBUG: Actualizando categoría', id, 'con datos:', data);
    const categoria = await this.findOneCategoria(id);
    Object.assign(categoria, data);
    const saved = await this.categoriaRepo.save(categoria);
    console.log('DEBUG: Categoría actualizada exitosamente:', saved);
    return saved;
  }

  async removeCategoria(id: number) {
    console.log('DEBUG: Eliminando categoría', id);
    const categoria = await this.findOneCategoria(id);

    // Verificar si tiene insumos asociados
    if (categoria.insumos && categoria.insumos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${categoria.insumos.length} insumo(s) asociado(s)`,
      );
    }

    return this.categoriaRepo.softRemove(categoria);
  }

  async removeAlmacen(id: number) {
    console.log('DEBUG: Eliminando almacén', id);
    const almacen = await this.findOneAlmacen(id);

    // Verificar si tiene insumos asociados
    if (almacen.insumos && almacen.insumos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el almacén porque tiene ${almacen.insumos.length} insumo(s) asociado(s)`,
      );
    }

    return this.almacenRepo.softRemove(almacen);
  }

  async removeProveedor(id: number) {
    console.log('DEBUG: Eliminando proveedor', id);
    const proveedor = await this.findOneProveedor(id);

    // Verificar si tiene insumos asociados
    if (proveedor.insumos && proveedor.insumos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar el proveedor porque tiene ${proveedor.insumos.length} insumo(s) asociado(s)`,
      );
    }

    return this.proveedorRepo.softRemove(proveedor);
  }
  // ==================== RESERVA DE STOCK ====================

  // Reservar stock para una actividad futura
  async reservarStock(insumoId: number, cantidad: number, actividadId: number, usuarioId: number, manager?: EntityManager) {
    const insumo = await this.findInsumoById(insumoId, manager);

    // Validar disponibilidad (Stock Disponible = StockUso - StockReservado)
    const disponible = insumo.stockUso - (insumo.stockReservado || 0);
    if (disponible < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para reservar. Disponible: ${disponible} ${insumo.unidadUso}, Solicitado: ${cantidad} ${insumo.unidadUso}`
      );
    }

    insumo.stockReservado = (insumo.stockReservado || 0) + cantidad;

    if (manager) {
      await manager.save(insumo);
    } else {
      await this.insumoRepo.save(insumo);
    }

    // Visualizar movimiento en inventario
    return this.createMovimiento({
      insumoId,
      tipo: 'RESERVA',
      cantidadUso: 0, // No afecta stockUso real todavía
      cantidadPresentacion: 0,
      costoUnitarioUso: insumo.precioUnitarioUso,
      descripcion: `Reserva para actividad ${actividadId}`,
      actividadId,
      usuarioId,
    }, manager);
  }

  // Liberar stock reservado (cancelación o corrección)
  // Liberar stock reservado (cancelación o corrección)
  async liberarStock(insumoId: number, cantidad: number, actividadId: number, usuarioId: number, manager?: EntityManager) {
    const insumo = await this.findInsumoById(insumoId, manager);

    const nuevoReservado = (insumo.stockReservado || 0) - cantidad;
    insumo.stockReservado = Math.max(0, nuevoReservado); // Evitar negativos

    if (manager) {
      await manager.save(insumo);
    } else {
      await this.insumoRepo.save(insumo);
    }

    // Visualizar movimiento en inventario (Inverso de reserva)
    return this.createMovimiento({
      insumoId,
      tipo: 'LIBERACION_RESERVA',
      cantidadUso: 0,
      cantidadPresentacion: 0,
      costoUnitarioUso: insumo.precioUnitarioUso,
      descripcion: `Liberación de reserva actividad ${actividadId}`,
      actividadId,
      usuarioId,
    }, manager);
  }

  // Confirmar consumo de una reserva (Finalización de actividad)
  // cantidadReservada: Lo que se había planeado
  // cantidadReal: Lo que realmente se usó
  async confirmarConsumoReserva(
    insumoId: number,
    cantidadReservada: number,
    cantidadReal: number,
    actividadId: number,
    usuarioId: number,
    manager?: EntityManager,
  ) {
    // 1. Liberar la reserva primero
    await this.liberarStock(insumoId, cantidadReservada, actividadId, usuarioId, manager);

    // 2. Consumir el stock real
    return this.consumirInsumo(
      insumoId,
      cantidadReal,
      actividadId,
      usuarioId,
      undefined,
      manager
    );
  }
}
