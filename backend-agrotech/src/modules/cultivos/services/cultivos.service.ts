import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Cultivo } from '../entities/cultivo.entity';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { CultivosGateway } from '../gateways/cultivos.gateway';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(SubLote) private subLoteRepo: Repository<SubLote>,
    @Inject(forwardRef(() => CultivosGateway))
    private cultivosGateway: CultivosGateway,
  ) {}

  // RF12: Crear cultivo con validación XOR (loteId o subLoteId)
  async createCultivo(data: CreateCultivoDto, usuarioId?: number) {
    // RF12: Validar XOR - exactamente uno debe estar presente
    if (!data.loteId && !data.subLoteId) {
      throw new BadRequestException('Debe especificar loteId o subLoteId');
    }
    
    if (data.loteId && data.subLoteId) {
      throw new BadRequestException('Solo puede especificar loteId O subLoteId, no ambos');
    }
    
    // Validar que la ubicación exista
    if (data.loteId) {
      const lote = await this.loteRepo.findOne({ where: { id: data.loteId } });
      if (!lote) throw new NotFoundException(`Lote ${data.loteId} not found`);
    }
    
    if (data.subLoteId) {
      const sublote = await this.subLoteRepo.findOne({ where: { id: data.subLoteId } });
      if (!sublote) throw new NotFoundException(`SubLote ${data.subLoteId} not found`);
    }
    
    // RF12: Validar que no haya otro cultivo activo en la misma ubicación
    const where: any = { estado: 'activo' };

    if (data.loteId) {
      where.loteId = data.loteId;
    }

    if (data.subLoteId) {
      where.subLoteId = data.subLoteId;
    }

    const existingCultivo = await this.cultivoRepo.findOne({ where });
    
    if (existingCultivo) {
      throw new BadRequestException('Ya existe un cultivo activo en esta ubicación');
    }
    
    const cultivo = this.cultivoRepo.create({
      ...data,
      estado: 'activo',
      fechaCreacion: new Date(),
      creadoPorUsuarioId: usuarioId,
    });

    const saved = await this.cultivoRepo.save(cultivo);

    // Calcular y setear fechas automáticamente basadas en actividades
    const fechas = await this.calcularFechasCultivo(saved.id);
    if (fechas.fechaSiembra || fechas.fechaFinalizacion) {
      if (fechas.fechaSiembra) saved.fechaSiembra = fechas.fechaSiembra;
      if (fechas.fechaFinalizacion) saved.fechaFinalizacion = fechas.fechaFinalizacion;
      await this.cultivoRepo.save(saved);
    }

    // Emitir evento WebSocket
    this.cultivosGateway.broadcast('cultivos:created', saved);

    // Emitir evento WebSocket
    this.cultivosGateway.broadcast('cultivos:updated', saved);

    return saved;
  }

  async findAllCultivos(filters?: { loteId?: number; subLoteId?: number; estado?: string; q?: string }) {
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

  async updateCultivo(id: number, data: UpdateCultivoDto) {
    const cultivo = await this.findCultivoById(id);
    Object.assign(cultivo, data);

    const saved = await this.cultivoRepo.save(cultivo);

    // Recalcular fechas automáticamente basadas en actividades
    const fechas = await this.calcularFechasCultivo(saved.id);
    if (fechas.fechaSiembra || fechas.fechaFinalizacion) {
      if (fechas.fechaSiembra) saved.fechaSiembra = fechas.fechaSiembra;
      if (fechas.fechaFinalizacion) saved.fechaFinalizacion = fechas.fechaFinalizacion;
      await this.cultivoRepo.save(saved);
    }

    return saved;
  }

  async removeCultivo(id: number) {
    const cultivo = await this.findCultivoById(id);
    const removed = await this.cultivoRepo.softRemove(cultivo);

    // Emitir evento WebSocket
    this.cultivosGateway.broadcast('cultivos:deleted', removed);

    return removed;
  }

  // RF13: Actualizar fechas clave del cultivo (llamado desde ActivitiesService)
  async updateCultivoFechaSiembra(cultivoId: number, fecha: Date) {
    const cultivo = await this.findCultivoById(cultivoId);
    
    if (!cultivo.fechaSiembra) {
      cultivo.fechaSiembra = fecha;
      await this.cultivoRepo.save(cultivo);
    }
  }

  async updateCultivoFechaFinalizacion(cultivoId: number, fecha: Date) {
    const cultivo = await this.findCultivoById(cultivoId);
    cultivo.fechaFinalizacion = fecha;
    cultivo.estado = 'finalizado';
    await this.cultivoRepo.save(cultivo);
  }

  // Calcular fechas automáticamente basadas en actividades relacionadas
  private async calcularFechasCultivo(cultivoId: number) {
    const actividadRepo = this.cultivoRepo.manager.getRepository('Actividad');

    // Buscar actividad de siembra más antigua
    const actividadSiembra = await actividadRepo.findOne({
      where: { cultivoId, subtipo: 'SIEMBRA', deletedAt: IsNull() },
      order: { fecha: 'ASC' },
    });

    // Buscar actividad de cosecha/finalización más reciente
    const actividadFinal = await actividadRepo.findOne({
      where: [
        { cultivoId, subtipo: 'COSECHA', deletedAt: IsNull() },
        { cultivoId, subtipo: 'FINALIZACION', deletedAt: IsNull() },
      ],
      order: { fecha: 'DESC' },
    });

    return {
      fechaSiembra: actividadSiembra ? new Date(actividadSiembra.fecha) : null,
      fechaFinalizacion: actividadFinal ? new Date(actividadFinal.fecha) : null,
    };
  }
}
