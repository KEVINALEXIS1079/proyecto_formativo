import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransaccionFinanciera } from '../entities/transaccion-financiera.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(TransaccionFinanciera)
    private transaccionRepo: Repository<TransaccionFinanciera>,
  ) { }

  // Registrar gasto de mano de obra en actividad
  async registrarGastoManoObra(
    data: {
      actividadId: number;
      monto: number;
      descripcion: string;
      fecha: Date;
      usuarioId: number;
    },
    manager?: any,
  ) {
    const repo = manager
      ? manager.getRepository(TransaccionFinanciera)
      : this.transaccionRepo;
    const transaccion = repo.create({
      tipo: 'GASTO_ACTIVIDAD',
      categoria: 'MANO_OBRA',
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha,
      actividadId: data.actividadId,
      usuarioId: data.usuarioId,
    });

    return repo.save(transaccion);
  }

  // Registrar gasto de insumo consumido en actividad
  async registrarGastoInsumo(
    data: {
      actividadId: number;
      insumoId: number;
      monto: number;
      descripcion: string;
      fecha: Date;
      usuarioId: number;
    },
    manager?: any,
  ) {
    const repo = manager
      ? manager.getRepository(TransaccionFinanciera)
      : this.transaccionRepo;
    const transaccion = repo.create({
      tipo: 'GASTO_ACTIVIDAD',
      categoria: 'INSUMO',
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha,
      actividadId: data.actividadId,
      insumoId: data.insumoId,
      usuarioId: data.usuarioId,
    });

    return repo.save(transaccion);
  }

  // Registrar gasto de servicio en actividad
  async registrarGastoServicio(
    data: {
      actividadId: number;
      monto: number;
      descripcion: string;
      fecha: Date;
      usuarioId: number;
    },
    manager?: any,
  ) {
    const repo = manager
      ? manager.getRepository(TransaccionFinanciera)
      : this.transaccionRepo;
    const transaccion = repo.create({
      tipo: 'GASTO_ACTIVIDAD',
      categoria: 'SERVICIO',
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha,
      actividadId: data.actividadId,
      usuarioId: data.usuarioId,
    });

    return repo.save(transaccion);
  }

  // Registrar ingreso por venta
  async registrarIngresoVenta(data: {
    ventaId: number;
    monto: number;
    descripcion: string;
    fecha: Date;
    usuarioId: number;
  }) {
    const transaccion = this.transaccionRepo.create({
      tipo: 'INGRESO_VENTA',
      categoria: 'VENTA',
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha,
      ventaId: data.ventaId,
      usuarioId: data.usuarioId,
    });

    return this.transaccionRepo.save(transaccion);
  }

  // Registrar gasto por compra de insumo
  async registrarGastoCompra(data: {
    insumoId: number;
    monto: number;
    descripcion: string;
    fecha: Date;
    usuarioId: number;
  }) {
    const transaccion = this.transaccionRepo.create({
      tipo: 'GASTO_COMPRA',
      categoria: 'COMPRA',
      monto: data.monto,
      descripcion: data.descripcion,
      fecha: data.fecha,
      insumoId: data.insumoId,
      usuarioId: data.usuarioId,
    });

    return this.transaccionRepo.save(transaccion);
  }

  // Obtener todas las transacciones con filtros
  async findAll(filters?: {
    tipo?: string;
    categoria?: string;
    actividadId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const qb = this.transaccionRepo
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.actividad', 'actividad')
      .leftJoinAndSelect('transaccion.insumo', 'insumo')
      .leftJoinAndSelect('transaccion.venta', 'venta')
      .leftJoinAndSelect('transaccion.usuario', 'usuario')
      .where('transaccion.deletedAt IS NULL');

    if (filters?.tipo) {
      qb.andWhere('transaccion.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.categoria) {
      qb.andWhere('transaccion.categoria = :categoria', {
        categoria: filters.categoria,
      });
    }

    if (filters?.actividadId) {
      qb.andWhere('transaccion.actividadId = :actividadId', {
        actividadId: filters.actividadId,
      });
    }

    if (filters?.fechaInicio && filters?.fechaFin) {
      qb.andWhere('transaccion.fecha BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }

    return qb.orderBy('transaccion.fecha', 'DESC').getMany();
  }

  // Obtener transacciones por actividad
  async findByActividad(actividadId: number) {
    return this.transaccionRepo.find({
      where: { actividadId },
      relations: ['insumo', 'usuario'],
      order: { fecha: 'DESC' },
    });
  }

  // Obtener resumen financiero
  // Obtener resumen financiero (Optimized)
  async getResumenFinanciero(filters?: {
    fechaInicio?: Date;
    fechaFin?: Date;
  }) {
    const qb = this.transaccionRepo
      .createQueryBuilder('transaccion')
      .where('transaccion.deletedAt IS NULL');

    if (filters?.fechaInicio && filters?.fechaFin) {
      qb.andWhere('transaccion.fecha BETWEEN :inicio AND :fin', {
        inicio: filters.fechaInicio,
        fin: filters.fechaFin,
      });
    }

    // 1. Calculate Ingresos and Gastos Total using SQL
    // We use conditional summation: SUM(CASE WHEN tipo = '...' THEN monto ELSE 0 END)
    const { totalIngresos, totalGastos, totalTransacciones } = await qb
      .select("SUM(CASE WHEN transaccion.tipo = 'INGRESO_VENTA' THEN transaccion.monto ELSE 0 END)", 'totalIngresos')
      .addSelect("SUM(CASE WHEN transaccion.tipo LIKE 'GASTO%' THEN transaccion.monto ELSE 0 END)", 'totalGastos')
      .addSelect("COUNT(transaccion.id)", 'totalTransacciones')
      .getRawOne();

    // 2. Calculate Gastos por Categoria using Group By
    // We need a separate query for grouping or sophisticated conditional selects. 
    // Group By is cleaner for dynamic categories.
    const gastosByCategoryRaw = await this.transaccionRepo
      .createQueryBuilder('transaccion')
      .select('transaccion.categoria', 'categoria')
      .addSelect('SUM(transaccion.monto)', 'total')
      .where("transaccion.tipo LIKE 'GASTO%'")
      .andWhere('transaccion.deletedAt IS NULL')
      .andWhere(filters?.fechaInicio && filters?.fechaFin ? 'transaccion.fecha BETWEEN :inicio AND :fin' : '1=1', {
        inicio: filters?.fechaInicio,
        fin: filters?.fechaFin
      })
      .groupBy('transaccion.categoria')
      .getRawMany();

    const gastosPorCategoria: Record<string, number> = {};
    gastosByCategoryRaw.forEach(item => {
      gastosPorCategoria[item.categoria] = parseFloat(item.total);
    });

    return {
      totalIngresos: parseFloat(totalIngresos || 0),
      totalGastos: parseFloat(totalGastos || 0),
      balance: parseFloat(totalIngresos || 0) - parseFloat(totalGastos || 0),
      gastosPorCategoria,
      totalTransacciones: parseInt(totalTransacciones || 0, 10),
    };
  }

  // Obtener una transacción por ID
  async findOne(id: number) {
    const transaccion = await this.transaccionRepo.findOne({
      where: { id },
      relations: ['actividad', 'insumo', 'venta', 'usuario'],
    });

    if (!transaccion)
      throw new NotFoundException(`Transacción ${id} no encontrada`);
    return transaccion;
  }
}
