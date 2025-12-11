import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { MovimientoInsumo, TipoMovimiento } from '../entities/movimiento-insumo.entity';

@Injectable()
export class InsumoService {
  constructor(
    @InjectRepository(Insumo)
    private insumoRepo: Repository<Insumo>,
    @InjectRepository(MovimientoInsumo)
    private movimientoRepo: Repository<MovimientoInsumo>,
  ) { }

  async create(data: {
    nombre: string;
    descripcion?: string;
    fotoUrl?: string;
    presentacionTipo: string;
    presentacionCantidad: number;
    presentacionUnidad: string;
    unidadUso: string;
    tipoMateria: string;
    factorConversionUso?: number;
    stockPresentacion: number;
    precioUnitarioPresentacion: number;
    almacenId: number;
    proveedorId?: number;
    categoriaId: number;
    creadoPorUsuarioId?: number;
  }) {
    // Determinar unidad de uso según tipo de materia
    let unidadUso = data.unidadUso;
    if (!unidadUso) {
      unidadUso = data.tipoMateria === 'liquido' ? 'cm3' : 'g';
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

    // Calcular valorInventario
    const valorInventario = stockUso * precioUnitarioUso;

    const insumo = this.insumoRepo.create({
      ...data,
      unidadUso,
      factorConversionUso,
      stockUso,
      precioUnitarioUso,
      valorInventario,
      fechaRegistro: new Date(),
    });

    const saved = await this.insumoRepo.save(insumo);

    // Crear movimiento inicial de ingreso si hay stock
    if (stockUso > 0) {
      await this.movimientoRepo.save({
        insumoId: saved.id,
        tipo: TipoMovimiento.REGISTRO,
        cantidadUso: stockUso,
        cantidadPresentacion: stockPresentacion,
        costoUnitarioPresentacion: precioUnitarioPresentacion,
        costoUnitarioUso: precioUnitarioUso,
        costoTotal: valorInventario,
        valorInventarioResultante: valorInventario,
        descripcion: 'Stock inicial',
        usuarioId: data.creadoPorUsuarioId || 1,
      });
    }

    return saved;
  }

  async findAll(filters?: {
    categoriaId?: number;
    almacenId?: number;
    proveedorId?: number;
    q?: string;
  }) {
    const queryBuilder = this.insumoRepo
      .createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .where('insumo.deletedAt IS NULL');

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

  async findOne(id: number) {
    const insumo = await this.insumoRepo.findOne({
      where: { id },
      relations: ['categoria', 'almacen', 'proveedor', 'movimientos'],
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo ${id} no encontrado`);
    }

    return insumo;
  }

  async update(id: number, data: Partial<Insumo>) {
    const insumo = await this.findOne(id);

    // Si se actualizan campos de presentación o stock, recalcular
    if (
      data.presentacionCantidad !== undefined ||
      data.stockPresentacion !== undefined ||
      data.precioUnitarioPresentacion !== undefined
    ) {
      const presentacionCantidad =
        data.presentacionCantidad ?? insumo.presentacionCantidad ?? 1;
      const stockPresentacion =
        data.stockPresentacion ?? insumo.stockPresentacion ?? 0;
      const precioUnitarioPresentacion =
        data.precioUnitarioPresentacion ?? insumo.precioUnitarioPresentacion ?? 0;

      // Recalcular factorConversionUso si cambió presentacionCantidad
      let factorConversionUso = insumo.factorConversionUso;
      if (data.presentacionCantidad !== undefined) {
        // Recalcular factor de conversión como en create
        const presentacionUnidad = insumo.presentacionUnidad?.toLowerCase() || '';
        if (insumo.tipoMateria === 'solido') {
          if (presentacionUnidad === 'kg' || presentacionUnidad === 'kilogramo') {
            factorConversionUso = presentacionCantidad * 1000;
          } else if (presentacionUnidad === 'g' || presentacionUnidad === 'gramo') {
            factorConversionUso = presentacionCantidad;
          } else {
            factorConversionUso = presentacionCantidad;
          }
        } else if (insumo.tipoMateria === 'liquido') {
          if (presentacionUnidad === 'l' || presentacionUnidad === 'litro') {
            factorConversionUso = presentacionCantidad * 1000;
          } else if (presentacionUnidad === 'ml' || presentacionUnidad === 'mililitro') {
            factorConversionUso = presentacionCantidad;
          } else if (presentacionUnidad === 'cm3' || presentacionUnidad === 'cm³') {
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
      data.stockUso = stockPresentacion * (data.factorConversionUso ?? factorConversionUso);
      data.precioUnitarioUso = precioUnitarioPresentacion / (data.factorConversionUso ?? factorConversionUso);
      data.valorInventario = data.stockUso * data.precioUnitarioUso;
    }

    Object.assign(insumo, data);
    return this.insumoRepo.save(insumo);
  }

  async remove(id: number) {
    const insumo = await this.findOne(id);
    return this.insumoRepo.softRemove(insumo);
  }
}