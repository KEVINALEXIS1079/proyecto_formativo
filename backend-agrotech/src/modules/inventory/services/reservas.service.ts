import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reserva } from '../entities/reserva.entity';
import { Insumo, InsumoEstado, TipoInsumo } from '../entities/insumo.entity';
import {
  MovimientoInsumo,
  TipoMovimiento,
} from '../entities/movimiento-insumo.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    @InjectRepository(Insumo)
    private insumoRepository: Repository<Insumo>,

    private dataSource: DataSource,
  ) {}

  async findAll() {
    return this.reservaRepository.find({
      order: { fechaReserva: 'DESC' },
      relations: ['insumo'],
    });
  }

  async crearReserva(data: Partial<Reserva>, manager?: any) {
    const execute = async (entityManager: any) => {
      const insumo = await entityManager.findOne(Insumo, {
        where: { id: data.insumoId },
      });

      if (!insumo) {
        throw new NotFoundException('Insumo o Activo Fijo no encontrado');
      }

      // Validar Cantidad
      if (!data.cantidad || data.cantidad <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      // Lógica según tipo
      if (insumo.tipoInsumo === TipoInsumo.CONSUMIBLE) {
        const stockDisponible = insumo.stockUso - insumo.stockReservado;
        if (stockDisponible < data.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${stockDisponible}`,
          );
        }
        insumo.stockReservado += data.cantidad;

        // Actualizar estado si es necesario
        if (insumo.stockUso - insumo.stockReservado <= insumo.stockMinimo) {
          insumo.estado = InsumoEstado.BAJO_STOCK;
        }
      } else {
        // ACTIVO FIJO (NO_CONSUMIBLE)
        if (insumo.estado !== InsumoEstado.DISPONIBLE) {
          throw new BadRequestException(
            `El activo fijo no está disponible (Estado: ${insumo.estado})`,
          );
        }

        insumo.estado = InsumoEstado.RESERVADO;

        if (insumo.stockUso === 1) {
          insumo.stockReservado = 1;
        } else {
          const stockDisponible = insumo.stockUso - insumo.stockReservado;
          if (stockDisponible < data.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente. Disponible: ${stockDisponible}`,
            );
          }
          insumo.stockReservado += data.cantidad;
        }
      }

      await entityManager.save(insumo);

      const nuevaReserva = entityManager.create(Reserva, {
        ...data,
        fechaReserva: data.fechaReserva || new Date(),
        estado: 'ACTIVA',
      });
      await entityManager.save(nuevaReserva);

      return nuevaReserva;
    };

    if (manager) {
      return execute(manager);
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const result = await execute(queryRunner.manager);
        await queryRunner.commitTransaction();
        return result;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async liberarReserva(id: number, manager?: any) {
    const execute = async (entityManager: any) => {
      const reserva = await entityManager.findOne(Reserva, {
        where: { id },
        relations: ['insumo'],
      });

      if (!reserva) throw new NotFoundException('Reserva no encontrada');
      if (reserva.estado !== 'ACTIVA') {
        throw new BadRequestException('La reserva no está activa');
      }

      const insumo = reserva.insumo;

      // Revertir stock reservado
      insumo.stockReservado -= reserva.cantidad;
      if (insumo.stockReservado < 0) insumo.stockReservado = 0;

      // Si es Activo Fijo y estaba RESERVADO y ahora stockReservado es 0, volver a DISPONIBLE
      if (
        insumo.tipoInsumo === TipoInsumo.NO_CONSUMIBLE &&
        insumo.estado === InsumoEstado.RESERVADO &&
        insumo.stockReservado === 0
      ) {
        insumo.estado = InsumoEstado.DISPONIBLE;
      }

      await entityManager.save(insumo);

      reserva.estado = 'LIBERADA';
      await entityManager.save(reserva);

      return { message: 'Reserva liberada exitosamente' };
    };

    if (manager) {
      return execute(manager);
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const result = await execute(queryRunner.manager);
        await queryRunner.commitTransaction();
        return result;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async utilizarReserva(id: number, manager?: any) {
    const execute = async (entityManager: any) => {
      const reserva = await entityManager.findOne(Reserva, {
        where: { id },
        relations: ['insumo'],
      });

      if (!reserva) throw new NotFoundException('Reserva no encontrada');
      if (reserva.estado !== 'ACTIVA') {
        throw new BadRequestException('La reserva no está activa');
      }

      const insumo = reserva.insumo;

      // Descontar Stock Físico y Reservado
      insumo.stockUso -= reserva.cantidad;
      insumo.stockReservado -= reserva.cantidad;

      if (insumo.stockReservado < 0) insumo.stockReservado = 0;
      if (insumo.stockUso < 0 && insumo.tipoInsumo !== TipoInsumo.NO_CONSUMIBLE)
        throw new BadRequestException('Stock insuficiente para confirmar uso');

      // Allow negative temporary for Assets logic fix below, but generally we want to check before.
      // Original code had check:
      // if (insumo.stockUso < 0) throw new BadRequestException('Stock insuficiente para confirmar uso');
      // But logic below handles "Asset Undo Only to Re-Consume", so let's stick to original logic carefully.

      // Original logic reproduced:
      if (insumo.stockUso < 0)
        throw new BadRequestException('Stock insuficiente para confirmar uso');

      // Actualizar Estado
      if (insumo.tipoInsumo === TipoInsumo.CONSUMIBLE) {
        if (insumo.stockUso <= 0) insumo.estado = InsumoEstado.AGOTADO;
        else if (insumo.stockUso <= insumo.stockMinimo)
          insumo.estado = InsumoEstado.BAJO_STOCK;
        else insumo.estado = InsumoEstado.DISPONIBLE;
      } else {
        // ACTIVO FIJO
        insumo.stockUso += reserva.cantidad; // Deshacer resta anterior para AF (lógica de activo físico permanente)

        // Si es Activo Fijo, cambiar estado a EN_USO
        if (insumo.stockUso === 1) {
          // Item único
          insumo.estado = InsumoEstado.EN_USO;
        }

        insumo.stockUso -= reserva.cantidad; // Re-aplicar resta para reflejar salida de almacén

        if (
          insumo.stockUso <= 0 &&
          insumo.tipoInsumo === TipoInsumo.NO_CONSUMIBLE
        ) {
          insumo.estado = InsumoEstado.EN_USO; // Ya no está en almacén
        }
      }

      await entityManager.save(insumo);

      // Crear Movimiento
      const movimiento = entityManager.create(MovimientoInsumo, {
        insumoId: insumo.id,
        tipo: TipoMovimiento.RESERVA_USO,
        cantidadPresentacion: 0,
        cantidadUso: reserva.cantidad,
        usuarioId: reserva.usuarioId,
        actividadId: reserva.actividadId,
        fecha: new Date(),
        descripcion: `Uso de reserva #${reserva.id}. Motivo: ${reserva.motivo}`,
        costoUnitarioPresentacion: insumo.precioUnitarioPresentacion,
        costoUnitarioUso: insumo.precioUnitarioUso,
        costoTotal: insumo.precioUnitarioUso * reserva.cantidad,
        valorInventarioResultante:
          insumo.valorInventario - insumo.precioUnitarioUso * reserva.cantidad, // Aprox
      });
      await entityManager.save(movimiento);

      reserva.estado = 'UTILIZADA';
      await entityManager.save(reserva);

      return { message: 'Reserva utilizada y movimiento generado', movimiento };
    };

    if (manager) {
      return execute(manager);
    } else {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const result = await execute(queryRunner.manager);
        await queryRunner.commitTransaction();
        return result;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }
  }

  async findByActividad(actividadId: number, manager?: any) {
    const repo = manager
      ? manager.getRepository(Reserva)
      : this.reservaRepository;
    return repo.find({
      where: { actividadId },
      relations: ['insumo'],
    });
  }
}
