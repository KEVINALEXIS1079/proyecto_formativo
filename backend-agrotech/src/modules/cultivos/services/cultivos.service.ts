import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../entities/cultivo.entity';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';
import { GeoService } from '../../geo/services/geo.service';

@Injectable()
export class CultivosService {
  constructor(
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
    @Inject(forwardRef(() => GeoService)) private geoService: GeoService,
  ) {}

  // RF12: Crear cultivo con validación XOR (loteId o subLoteId)
  async createCultivo(data: CreateCultivoDto) {
    // RF12: Validar XOR - exactamente uno debe estar presente
    if (!data.loteId && !data.subLoteId) {
      throw new BadRequestException('Debe especificar loteId o subLoteId');
    }
    
    if (data.loteId && data.subLoteId) {
      throw new BadRequestException('Solo puede especificar loteId O subLoteId, no ambos');
    }
    
    // Validar que la ubicación exista
    if (data.loteId) {
      await this.geoService.findLoteById(data.loteId);
    }
    
    if (data.subLoteId) {
      await this.geoService.findSubLoteById(data.subLoteId);
    }
    
    // RF12: Validar que no haya otro cultivo activo en la misma ubicación (opcional)
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
    });
    
    return this.cultivoRepo.save(cultivo);
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
    return this.cultivoRepo.save(cultivo);
  }

  async removeCultivo(id: number) {
    const cultivo = await this.findCultivoById(id);
    return this.cultivoRepo.softRemove(cultivo);
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
}
