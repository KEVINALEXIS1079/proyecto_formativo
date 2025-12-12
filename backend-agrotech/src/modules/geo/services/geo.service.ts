import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from '../entities/lote.entity';
import { SubLote } from '../entities/sublote.entity';

import { CreateLoteDto } from '../dtos/create-lote.dto';
import { UpdateLoteDto } from '../dtos/update-lote.dto';
import { CreateSubLoteDto } from '../dtos/create-sublote.dto';
import { UpdateSubLoteDto } from '../dtos/update-sublote.dto';

import { GeoGateway } from '../gateways/geo.gateway';

@Injectable()
export class GeoService {
  constructor(
    @InjectRepository(Lote) private loteRepo: Repository<Lote>,
    @InjectRepository(SubLote) private subLoteRepo: Repository<SubLote>,
    @Inject(forwardRef(() => GeoGateway))
    private geoGateway: GeoGateway,
  ) { }

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
    return this.loteRepo.find({
      relations: ['sublotes'],
    });
  }

  async findAllLotesSummary() {
    // OPTIMIZED: Use raw query to avoid ORM overhead or accidental eager loading
    const raw = await this.loteRepo.query(`
      SELECT l.id, l.nombre 
      FROM lotes l 
      WHERE l.estado = 'activo'
      ORDER BY l.nombre ASC
    `);

    // Fetch sublotes separately or in a second light query if needed, 
    // or just return lots first to verify speed. 
    // For now, let's join manually to avoid N+1 if we really need sublotes.
    // Actually, distinct query for sublotes is faster than large join if many rows.

    const sublotes = await this.subLoteRepo.query(`
      SELECT s.id, s.nombre, s.lote_id as "loteId" 
      FROM sublotes s
    `);

    // Merge in JS (much faster for 6 lots)
    return raw.map((l: any) => ({
      ...l,
      sublotes: sublotes.filter((s: any) => s.loteId === l.id)
    }));
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
    const saved = await this.loteRepo.save(lote);
    this.geoGateway.server.emit('lotes:updated', saved);
    return saved;
  }

  async removeLote(id: number) {
    const lote = await this.findLoteById(id);
    const removed = await this.loteRepo.softRemove(lote);
    this.geoGateway.server.emit('lotes:removed', { id_lote_pk: id });
    return removed;
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


    const savedSubLote = await this.subLoteRepo.save(subLote);
    this.geoGateway.server.emit('sublotes:created', savedSubLote);
    return savedSubLote;
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
    const saved = await this.subLoteRepo.save(subLote);
    this.geoGateway.server.emit('sublotes:updated', saved);
    return saved;
  }

  async removeSubLote(id: number) {
    const subLote = await this.findSubLoteById(id);
    const removed = await this.subLoteRepo.softRemove(subLote);
    this.geoGateway.server.emit('sublotes:removed', { id_sublote_pk: id });
    return removed;
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
      let query = `
        SELECT EXISTS (
          SELECT 1 
          FROM sublotes 
          WHERE lote_id = $1 
          AND ST_Overlaps(ST_GeomFromGeoJSON($2), ST_GeomFromGeoJSON(geom::json))
      `;

      const params: any[] = [loteId, JSON.stringify(geom)];

      if (excludeId) {
        query += ` AND id != $3`;
        params.push(excludeId);
      }

      query += `)`;

      const result = await this.loteRepo.query(query, params);
      return result[0]?.exists || false;
    } catch (error) {
      console.error('Error checking overlaps:', error);
      throw error;
    }
  }
}
