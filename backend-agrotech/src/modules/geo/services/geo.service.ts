import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from '../entities/lote.entity';
import { SubLote } from '../entities/sublote.entity';
import { Cultivo } from '../entities/cultivo.entity';
import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { CreateSubLoteDto } from '../dtos/create-sublote.dto';
import { UpdateSubLoteDto } from '../dtos/update-sublote.dto';
import { CreateCultivoDto } from '../dtos/create-cultivo.dto';
import { UpdateCultivoDto } from '../dtos/update-cultivo.dto';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(SubLote) private subLoteRepo: Repository<SubLote>,
    @InjectRepository(Cultivo) private cultivoRepo: Repository<Cultivo>,
  ) {}

  // ==================== LOTES ====================
  
  // RF09: Registro de lotes con cálculos automáticos
  async createLote(data: CreateLoteDto) {
    // Calcular área y centroide usando PostGIS
    const areaM2 = await this.calculateArea(data.geom);
    const areaHa = areaM2 / 10000;
    const centroide = await this.calculateCentroid(data.geom);
    
    const lote = this.loteRepo.create({
      ...data,
      areaM2,
      areaHa,
      centroide,
      estado: 'activo',
    });
    
    return this.loteRepo.save(lote);
  }

  async findAllLotes() {
    return this.loteRepo.find();
  }

  async findLoteById(id: number) {
    const lote = await this.loteRepo.findOne({ where: { id } });
    if (!lote) throw new NotFoundException(`Lote ${id} not found`);
    return lote;
  }

  async updateLote(id: number, data: UpdateLoteDto) {
    const lote = await this.findLoteById(id);
    
    // Si se actualiza la geometría, recalcular áreas y centroide
    if (data.geom) {
      lote.areaM2 = await this.calculateArea(data.geom);
      lote.areaHa = lote.areaM2 / 10000;
      lote.centroide = await this.calculateCentroid(data.geom);
    }
    
    Object.assign(lote, data);
    return this.loteRepo.save(lote);
  }

  async removeLote(id: number) {
    const lote = await this.findLoteById(id);
    return this.loteRepo.softRemove(lote);
  }

  // ==================== SUBLOTES ====================
  
  // RF10: Registro de sublotes con validaciones espaciales
  async createSubLote(data: CreateSubLoteDto) {
    const lote = await this.findLoteById(data.loteId);
    
    // RF10: Validar que el sublote esté contenido en el lote
    const isContained = await this.validateContainment(lote.geom, data.geom);
    if (!isContained) {
      throw new BadRequestException('El sublote debe estar completamente dentro del lote');
    }
    
    // RF10: Validar que no haya solape con otros sublotes del mismo lote
    const hasOverlap = await this.checkOverlaps(data.loteId, data.geom);
    if (hasOverlap) {
      throw new BadRequestException('El sublote se solapa con otro sublote existente');
    }
    
    // RF10: Validar nombre único por lote
    const existingSubLote = await this.subLoteRepo.findOne({
      where: { loteId: data.loteId, nombre: data.nombre },
    });
    
    if (existingSubLote) {
      throw new BadRequestException(`Ya existe un sublote con nombre "${data.nombre}" en este lote`);
    }
    
    // Calcular área y centroide
    const areaM2 = await this.calculateArea(data.geom);
    const areaHa = areaM2 / 10000;
    const centroide = await this.calculateCentroid(data.geom);
    
    const subLote = this.subLoteRepo.create({
      ...data,
      areaM2,
      areaHa,
      centroide,
      lote,
    });
    
    return this.subLoteRepo.save(subLote);
  }

  async findAllSubLotes(loteId?: number) {
    const where: any = {};
    if (loteId) where.loteId = loteId;
    
    return this.subLoteRepo.find({ 
      where,
      relations: ['lote'],
    });
  }

  async findSubLoteById(id: number) {
    const subLote = await this.subLoteRepo.findOne({ 
      where: { id },
      relations: ['lote'],
    });
    if (!subLote) throw new NotFoundException(`SubLote ${id} not found`);
    return subLote;
  }

  async updateSubLote(id: number, data: UpdateSubLoteDto) {
    const subLote = await this.findSubLoteById(id);
    
    // Si se actualiza la geometría, validar contención y no-solape
    if (data.geom) {
      const lote = await this.findLoteById(subLote.loteId);
      
      // Validar contención
      const isContained = await this.validateContainment(lote.geom, data.geom);
      if (!isContained) {
        throw new BadRequestException('El sublote debe estar completamente dentro del lote');
      }
      
      // Validar no solapamiento (excluyendo el sublote actual)
      const hasOverlap = await this.checkOverlaps(subLote.loteId, data.geom, id);
      if (hasOverlap) {
        throw new BadRequestException('El sublote se solapa con otro sublote existente');
      }
      
      // Recalcular áreas y centroide
      subLote.areaM2 = await this.calculateArea(data.geom);
      subLote.areaHa = subLote.areaM2 / 10000;
      subLote.centroide = await this.calculateCentroid(data.geom);
    }
    
    Object.assign(subLote, data);
    return this.subLoteRepo.save(subLote);
  }

  async removeSubLote(id: number) {
    const subLote = await this.findSubLoteById(id);
    return this.subLoteRepo.softRemove(subLote);
  }

  // ==================== CULTIVOS ====================
  
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
      await this.findLoteById(data.loteId);
    }
    
    if (data.subLoteId) {
      await this.findSubLoteById(data.subLoteId);
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

  // ==================== POSTGIS HELPER METHODS ====================

  // RF09+RF11: Calcular área en metros cuadrados usando PostGIS
  private async calculateArea(geom: any): Promise<number> {
    try {
      const result = await this.loteRepo.query(
        `SELECT ST_Area(ST_GeomFromGeoJSON($1)::geography) as area`,
        [JSON.stringify(geom)]
      );
      return parseFloat(result[0]?.area || 0);
    } catch (error) {
      console.error('Error calculating area:', error);
      return 0;
    }
  }

  // RF09+RF11: Calcular centroide usando PostGIS
  private async calculateCentroid(geom: any): Promise<any> {
    try {
      const result = await this.loteRepo.query(
        `SELECT ST_AsGeoJSON(ST_Centroid(ST_GeomFromGeoJSON($1))) as centroid`,
        [JSON.stringify(geom)]
      );
      return result[0]?.centroid ? JSON.parse(result[0].centroid) : null;
    } catch (error) {
      console.error('Error calculating centroid:', error);
      return null;
    }
  }

  // RF11: Validar que un polígono esté contenido en otro (ST_Contains)
  private async validateContainment(containerGeom: any, containedGeom: any): Promise<boolean> {
    try {
      const result = await this.loteRepo.query(
        `SELECT ST_Contains(
          ST_GeomFromGeoJSON($1),
          ST_GeomFromGeoJSON($2)
        ) as contains`,
        [JSON.stringify(containerGeom), JSON.stringify(containedGeom)]
      );
      return result[0]?.contains === true;
    } catch (error) {
      console.error('Error validating containment:', error);
      return false;
    }
  }

  // RF11: Verificar si hay solapamiento con otros sublotes
  private async checkOverlaps(loteId: number, geom: any, excludeId?: number): Promise<boolean> {
    try {
      const sublotes = await this.subLoteRepo.find({ where: { loteId } });
      
      for (const sublote of sublotes) {
        // Excluir el sublote actual si se está actualizando
        if (excludeId && sublote.id === excludeId) continue;
        
        const result = await this.loteRepo.query(
          `SELECT ST_Overlaps(
            ST_GeomFromGeoJSON($1),
            ST_GeomFromGeoJSON($2)
          ) as overlaps`,
          [JSON.stringify(geom), JSON.stringify(sublote.geom)]
        );
        
        if (result[0]?.overlaps === true) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking overlaps:', error);
      return false;
    }
  }
}
