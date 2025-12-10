import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Cultivo } from '../entities/cultivo.entity';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { GeoService } from '../../geo/services/geo.service';
import { CultivoHistorial } from '../entities/cultivo-historial.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    @InjectRepository(CultivoHistorial) private historialRepo: Repository<CultivoHistorial>,
    @Inject(forwardRef(() => GeoService)) private geoService: GeoService,
  ) { }

  async createCultivo(data: CreateCultivoDto) {
    // RF12: Validar XOR - exactamente uno debe estar presente
    if (!data.loteId && !data.subLoteId) {
      throw new BadRequestException('Debe especificar loteId o subLoteId');
    }

    if (data.loteId && data.subLoteId) {
      throw new BadRequestException('Solo puede especificar loteId O subLoteId, no ambos');
    }

    // Validar que la ubicación exista y que el lote no tenga sublotes si se crea a nivel lote
    let loteIdDestino: number | null = data.loteId ?? null;

    if (data.loteId) {
      const lote = await this.geoService.findLoteById(data.loteId);
      const subLotes = await this.geoService.findAllSubLotes(data.loteId);
      if (subLotes.length > 0) {
        throw new BadRequestException('El lote tiene sublotes, seleccione un sublote');
      }
      loteIdDestino = lote.id;
    }

    if (data.subLoteId) {
      const sub = await this.geoService.findSubLoteById(data.subLoteId);
      loteIdDestino = sub.loteId;
    }

    // RF12: Validar que no haya otro cultivo activo en la misma ubicación
    const where: any = { estado: 'activo', deletedAt: IsNull() };

    if (data.subLoteId) {
      where.subLoteId = data.subLoteId;
    } else {
      where.loteId = loteIdDestino;
      where.subLoteId = null;
    }

    const existingCultivo = await this.cultivoRepo.findOne({ where });

    if (existingCultivo) {
      throw new BadRequestException('Ya existe un cultivo activo en esta ubicación');
    }

    const cultivo = this.cultivoRepo.create({
      ...data,
      estado: 'activo',
      fechaCreacion: new Date(),
    });

    return this.cultivoRepo.save(cultivo);
  }

  async listHistorial(limit = 50, cultivoId?: number) {
    return this.historialRepo
      .createQueryBuilder('hist')
      .leftJoinAndSelect('hist.cultivo', 'cultivo')
      .leftJoinAndSelect('cultivo.lote', 'lote')
      .leftJoinAndSelect('cultivo.subLote', 'subLote')
      .leftJoinAndSelect('hist.usuario', 'usuario')
      .where(cultivoId ? 'hist.cultivoId = :cultivoId' : '1=1', cultivoId ? { cultivoId } : {})
      .orderBy('hist.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findAllCultivos(filters?: { loteId?: number; subLoteId?: number; estado?: string; q?: string; tipoCultivo?: string }) {
    const queryBuilder = this.cultivoRepo.createQueryBuilder('cultivo')
      .leftJoinAndSelect('cultivo.lote', 'lote')
      .leftJoinAndSelect('cultivo.subLote', 'subLote')
      .where('cultivo.deletedAt IS NULL');

    // RF14: Filtros
    if (filters?.loteId) {
      queryBuilder.andWhere('cultivo.loteId = :loteId', { loteId: filters.loteId });
    }

    if (filters?.subLoteId) {
      queryBuilder.andWhere('cultivo.subLoteId = :subLoteId', { subLoteId: filters.subLoteId });
    }

    if (filters?.estado) {
      queryBuilder.andWhere('cultivo.estado = :estado', { estado: filters.estado });
    }
    if (filters?.tipoCultivo) {
      queryBuilder.andWhere('cultivo.tipoCultivo ILIKE :tipoCultivo', { tipoCultivo: `%${filters.tipoCultivo}%` });
    }

    // RF14: Búsqueda de texto
    if (filters?.q) {
      queryBuilder.andWhere(
        '(cultivo.nombreCultivo ILIKE :q OR cultivo.tipoCultivo ILIKE :q OR cultivo.descripcion ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    return queryBuilder.getMany();
  }

  async findCultivoById(id: number) {
    const cultivo = await this.cultivoRepo.findOne({
      where: { id },
      relations: ['lote', 'subLote'],
    });
    if (!cultivo) throw new NotFoundException(`Cultivo ${id} not found`);
    return cultivo;
  }

  async updateCultivo(id: number, data: UpdateCultivoDto, usuarioId?: number) {
    const cultivo = await this.findCultivoById(id);

    const { motivo, ...payload } = data;
    if (!motivo || motivo.trim().length === 0) {
      throw new BadRequestException('El motivo del cambio es obligatorio');
    }

    if (payload.loteId && payload.subLoteId) {
      throw new BadRequestException('Solo puede especificar loteId O subLoteId, no ambos');
    }

    // Determinar destino final de ubicación (permite limpiar sublote)
    let targetLoteId =
      payload.loteId ?? cultivo.loteId ?? cultivo.lote?.id ?? cultivo.subLote?.loteId ?? null;
    let targetSubLoteId =
      payload.subLoteId !== undefined ? payload.subLoteId : cultivo.subLoteId ?? cultivo.subLote?.id ?? null;

    if (targetSubLoteId) {
      const sub = await this.geoService.findSubLoteById(targetSubLoteId);
      targetLoteId = sub.loteId;
    } else if (payload.loteId !== undefined && payload.loteId !== null) {
      const lote = await this.geoService.findLoteById(payload.loteId);
      const subLotes = await this.geoService.findAllSubLotes(lote.id);
      if (subLotes.length > 0) {
        throw new BadRequestException('El lote tiene sublotes, seleccione un sublote');
      }
      targetLoteId = lote.id;
    } else if (targetLoteId) {
      const subLotes = await this.geoService.findAllSubLotes(targetLoteId);
      if (subLotes.length > 0 && targetSubLoteId === null) {
        throw new BadRequestException('El lote tiene sublotes, seleccione un sublote');
      }
    }

    if (!targetLoteId && !targetSubLoteId) {
      throw new BadRequestException('Debe especificar loteId o subLoteId');
    }

    // Validar unicidad de cultivo activo en destino
    const whereDestino: any = { estado: 'activo' };
    if (targetSubLoteId) {
      whereDestino.subLoteId = targetSubLoteId;
    } else {
      whereDestino.loteId = targetLoteId;
      whereDestino.subLoteId = null;
    }

    const cultivoEnDestino = await this.cultivoRepo.findOne({
      where: { ...whereDestino, id: Not(id), deletedAt: IsNull() },
    });

    if (cultivoEnDestino) {
      throw new BadRequestException('Ya existe un cultivo activo en esta ubicación');
    }

    const payloadWithLocation = {
      ...payload,
      loteId: targetLoteId,
      subLoteId: targetSubLoteId ?? null,
    };

    // Build diff
    const cambios: Record<string, { previo: any; nuevo: any }> = {};
    Object.entries(payloadWithLocation).forEach(([key, value]) => {
      if (value === undefined) return;
      const previo = (cultivo as any)[key];
      const prevVal = this.toComparable(previo);
      const newVal = this.toComparable(value);
      if (prevVal !== newVal) {
        cambios[key] = { previo: prevVal, nuevo: newVal };
        (cultivo as any)[key] = value;
      }
    });

    const updated = await this.cultivoRepo.save(cultivo);

    // Save history even if no changes to keep audit of intent
    await this.historialRepo.save(
      this.historialRepo.create({
        cultivoId: updated.id,
        usuarioId: usuarioId ?? 0,
        motivo,
        cambios: Object.keys(cambios).length > 0 ? cambios : null,
      }),
    );

    return updated;
  }

  private toComparable(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    return value;
  }

  async removeCultivo(id: number) {
    // Bloquear borrado duro: forzar uso de estado
    throw new BadRequestException('No se permite eliminar cultivos; cambie el estado a inactivo/finalizado');
  }

  // RF13: Actualizar fechas clave del cultivo (llamado desde ActivitiesService)
  async updateCultivoFechaSiembra(cultivoId: number, fecha: Date) {
    const cultivo = await this.findCultivoById(cultivoId);

    if (!cultivo.fechaSiembra) {
      cultivo.fechaSiembra = fecha;
      cultivo.estado = 'activo'; // Ensure crop is marked as active
      await this.cultivoRepo.save(cultivo);
    }
  }

  async updateCultivoFechaFinalizacion(cultivoId: number, fecha: Date) {
    const cultivo = await this.findCultivoById(cultivoId);
    cultivo.fechaFinalizacion = fecha;
    cultivo.estado = 'finalizado';
    await this.cultivoRepo.save(cultivo);
  }

  // RF_INT: Acumular costos al cultivo (Transaccional)
  async addCost(cultivoId: number, amount: number, manager?: any) { // Type as any or EntityManager if imported
    // We use a query builder or direct update to increment safely
    // Or if inside a transaction manager, we lock and update.

    if (amount === 0) return;

    if (manager) {
      // Use efficient increment
      await manager
        .createQueryBuilder()
        .update(Cultivo)
        .set({ costoTotal: () => `COALESCE("costoTotal", 0) + ${amount}` })
        .where("id = :id", { id: cultivoId })
        .execute();
    } else {
      await this.cultivoRepo
        .createQueryBuilder()
        .update(Cultivo)
        .set({ costoTotal: () => `COALESCE("costoTotal", 0) + ${amount}` })
        .where("id = :id", { id: cultivoId })
        .execute();
    }
  }
}
