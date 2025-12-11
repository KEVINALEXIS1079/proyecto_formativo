import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInsumo, TipoMovimiento } from '../entities/movimiento-insumo.entity';
import { Insumo } from '../entities/insumo.entity';

@Injectable()
export class MovimientoInsumoService {
  constructor(
    @InjectRepository(MovimientoInsumo)
    private movimientoRepo: Repository<MovimientoInsumo>,
    @InjectRepository(Insumo)
    private insumoRepo: Repository<Insumo>,
  ) { }

  async create(data: {
    insumoId: number;
    tipo: TipoMovimiento;
    cantidadPresentacion?: number;
    cantidadUso: number;
    costoUnitarioUso: number;
    descripcion?: string;
    actividadId?: number;
    usuarioId: number;
    almacenOrigenId?: number;
    almacenDestinoId?: number;
  }) {
    const insumo = await this.insumoRepo.findOne({ where: { id: data.insumoId } });
    if (!insumo) {
      throw new NotFoundException(`Insumo ${data.insumoId} no encontrado`);
    }

    // Validar que no quede stock negativo
    if (data.tipo === TipoMovimiento.CONSUMO || data.tipo === TipoMovimiento.SALIDA || (data.tipo === TipoMovimiento.AJUSTE && data.cantidadUso < 0)) {
      const cantidadRequerida = data.tipo === TipoMovimiento.AJUSTE ? Math.abs(data.cantidadUso) : data.cantidadUso;
      // Validar stockUso
      if (insumo.stockUso < cantidadRequerida) {
        throw new BadRequestException(
          `Stock insuficiente en unidad de uso. Disponible: ${insumo.stockUso} ${insumo.unidadUso}, Solicitado: ${cantidadRequerida} ${insumo.unidadUso}`,
        );
      }

      // Validar stockPresentacion si se especifica
      if (data.cantidadPresentacion) {
        const cantidadPresentacionRequerida = data.tipo === TipoMovimiento.AJUSTE ? Math.abs(data.cantidadPresentacion) : data.cantidadPresentacion;
        if (insumo.stockPresentacion < cantidadPresentacionRequerida) {
          throw new BadRequestException(
            `Stock insuficiente en presentación. Disponible: ${insumo.stockPresentacion} ${insumo.presentacionUnidad}, Solicitado: ${cantidadPresentacionRequerida} ${insumo.presentacionUnidad}`,
          );
        }
      }
    }

    // Validaciones específicas por tipo
    if (data.tipo === TipoMovimiento.TRASLADO) {
      if (!data.almacenOrigenId || !data.almacenDestinoId) {
        throw new BadRequestException('Para traslados se requieren almacenOrigenId y almacenDestinoId');
      }
      if (data.almacenOrigenId === data.almacenDestinoId) {
        throw new BadRequestException('El almacén origen y destino deben ser diferentes');
      }
      if (insumo.almacenId !== data.almacenOrigenId) {
        throw new BadRequestException('El insumo no pertenece al almacén origen especificado');
      }
    }

    if (data.tipo === TipoMovimiento.ELIMINACION) {
      if (insumo.deletedAt) {
        throw new BadRequestException('El insumo ya está eliminado');
      }
    }

    if (data.tipo === TipoMovimiento.RESTAURACION) {
      if (!insumo.deletedAt) {
        throw new BadRequestException('El insumo no está eliminado');
      }
    }

    // Calcular cantidadPresentacion si no se proporciona
    if (data.cantidadPresentacion === undefined) {
      data.cantidadPresentacion = data.cantidadUso / (insumo.factorConversionUso || 1);
    }

    // Calcular el stock resultante para determinar valorInventarioResultante
    let stockResultante = insumo.stockUso;
    if (data.tipo === TipoMovimiento.ENTRADA || data.tipo === TipoMovimiento.REGISTRO) {
      stockResultante += data.cantidadUso;
    } else if (data.tipo === TipoMovimiento.CONSUMO || data.tipo === TipoMovimiento.SALIDA || data.tipo === TipoMovimiento.RESERVA_USO) {
      stockResultante -= data.cantidadUso;
    } else if (data.tipo === TipoMovimiento.AJUSTE) {
      stockResultante += data.cantidadUso; // cantidadUso puede ser negativa
    }
    // Para TRASLADO, ELIMINACION, RESTAURACION: no cambia stock

    // Calcular el valor del inventario resultante
    let precioUnitarioResultante = insumo.precioUnitarioUso;
    if (data.tipo === TipoMovimiento.ENTRADA || data.tipo === TipoMovimiento.REGISTRO) {
      if (data.costoUnitarioUso && data.costoUnitarioUso > 0) {
        const valorAnterior = insumo.stockUso * insumo.precioUnitarioUso;
        const valorNuevo = data.cantidadUso * data.costoUnitarioUso;
        if (stockResultante > 0) {
          precioUnitarioResultante = (valorAnterior + valorNuevo) / stockResultante;
        }
      }
    }
    // Para AJUSTE: no recalcula precio

    const valorInventarioResultante = stockResultante * precioUnitarioResultante;

    const movimiento = this.movimientoRepo.create({
      ...data,
      cantidadPresentacion: data.cantidadPresentacion,
      costoUnitarioPresentacion: data.costoUnitarioUso * (insumo.factorConversionUso || 1),
      costoTotal: data.cantidadUso * data.costoUnitarioUso,
      valorInventarioResultante,
    });

    await this.movimientoRepo.save(movimiento);

    // Actualizar stock del insumo
    if (data.tipo === TipoMovimiento.ENTRADA || data.tipo === TipoMovimiento.REGISTRO) {
      insumo.stockUso += data.cantidadUso;
      if (data.cantidadPresentacion) {
        insumo.stockPresentacion += data.cantidadPresentacion;
      }
    } else if (data.tipo === TipoMovimiento.CONSUMO || data.tipo === TipoMovimiento.SALIDA || data.tipo === TipoMovimiento.RESERVA_USO) {
      insumo.stockUso -= data.cantidadUso;
      if (data.cantidadPresentacion) {
        insumo.stockPresentacion -= data.cantidadPresentacion;
      }
    } else if (data.tipo === TipoMovimiento.AJUSTE) {
      insumo.stockUso += data.cantidadUso; // cantidadUso puede ser negativa
      if (data.cantidadPresentacion) {
        insumo.stockPresentacion += data.cantidadPresentacion; // también puede ser negativa
      }
    }
    // Para TRASLADO, ELIMINACION, RESTAURACION: no cambia stock

    // Recalcular precioUnitarioUso si hay ingreso con costo
    if (data.tipo === TipoMovimiento.ENTRADA || data.tipo === TipoMovimiento.REGISTRO) {
      if (data.costoUnitarioUso && data.costoUnitarioUso > 0) {
        const stockAnterior = insumo.stockUso - data.cantidadUso;
        const valorAnterior = stockAnterior * insumo.precioUnitarioUso;
        const valorNuevo = data.cantidadUso * data.costoUnitarioUso;
        const stockTotal = insumo.stockUso;

        if (stockTotal > 0) {
          insumo.precioUnitarioUso = (valorAnterior + valorNuevo) / stockTotal;
        }
      }
    }

    // Recalcular valorInventario
    insumo.valorInventario = insumo.stockUso * insumo.precioUnitarioUso;

    await this.insumoRepo.save(insumo);

    // Lógica específica por tipo después de guardar el movimiento
    if (data.tipo === TipoMovimiento.TRASLADO) {
      // Cambiar el almacén del insumo
      insumo.almacenId = data.almacenDestinoId!;
      await this.insumoRepo.save(insumo);
    } else if (data.tipo === TipoMovimiento.ELIMINACION) {
      // Soft delete del insumo
      await this.insumoRepo.softRemove(insumo);
    } else if (data.tipo === TipoMovimiento.RESTAURACION) {
      // Restaurar el insumo
      await this.insumoRepo.restore(insumo);
    }

    return movimiento;
  }

  async findAll() {
    return this.movimientoRepo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.insumo', 'insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .where('insumo.deletedAt IS NULL')
      .andWhere('insumo.id IS NOT NULL')
      .orderBy('movimiento.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.insumo', 'insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .where('movimiento.id = :id', { id })
      .getOne();

    if (!movimiento) {
      throw new NotFoundException(`Movimiento ${id} no encontrado`);
    }

    return movimiento;
  }

  async findByInsumo(insumoId: number) {
    return this.movimientoRepo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.insumo', 'insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .where('movimiento.insumoId = :insumoId', { insumoId })
      .andWhere('insumo.deletedAt IS NULL')
      .andWhere('insumo.id IS NOT NULL')
      .orderBy('movimiento.createdAt', 'DESC')
      .getMany();
  }

  async findAllGeneral(filters?: {
    insumoId?: number;
    tipo?: TipoMovimiento;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }) {
    const queryBuilder = this.movimientoRepo
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.insumo', 'insumo')
      .leftJoinAndSelect('insumo.categoria', 'categoria')
      .leftJoinAndSelect('insumo.proveedor', 'proveedor')
      .leftJoinAndSelect('insumo.almacen', 'almacen')
      .leftJoinAndSelect('movimiento.usuario', 'usuario')
      .where('insumo.deletedAt IS NULL')
      .andWhere('insumo.id IS NOT NULL')
      .orderBy('movimiento.createdAt', 'DESC');

    if (filters?.insumoId) {
      queryBuilder.andWhere('movimiento.insumoId = :insumoId', {
        insumoId: filters.insumoId,
      });
    }

    if (filters?.tipo) {
      queryBuilder.andWhere('movimiento.tipo = :tipo', {
        tipo: filters.tipo,
      });
    }

    if (filters?.fechaDesde) {
      queryBuilder.andWhere('movimiento.createdAt >= :fechaDesde', {
        fechaDesde: filters.fechaDesde,
      });
    }

    if (filters?.fechaHasta) {
      queryBuilder.andWhere('movimiento.createdAt <= :fechaHasta', {
        fechaHasta: filters.fechaHasta,
      });
    }

    return queryBuilder.getMany();
  }

  async update(id: number, data: Partial<MovimientoInsumo>) {
    const movimiento = await this.findOne(id);
    Object.assign(movimiento, data);
    return this.movimientoRepo.save(movimiento);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.softRemove(movimiento);
  }
}