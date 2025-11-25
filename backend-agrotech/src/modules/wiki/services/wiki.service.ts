import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EPA } from '../entities/epa.entity';
import { TipoCultivoWiki } from '../entities/tipo-cultivo-wiki.entity';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(EPA)
  private readonly epaRepo: Repository<EPA>,
    @InjectRepository(TipoCultivoWiki) private tipoCultivoWikiRepo: Repository<TipoCultivoWiki>,
  ) {}

  // ==================== EPA ====================
  
  // RF28: CRUD EPA
  async findAll(filters?: {
    q?: string;
    tipoEpa?: string;
    tipoCultivoWikiId?: number;
    mes?: number;
    temporada?: string;
    conFotos?: boolean;
  }) {
    const queryBuilder = this.epaRepo.createQueryBuilder('epa')
      .leftJoinAndSelect('epa.tiposCultivo', 'tiposCultivo')
      .where('epa.deletedAt IS NULL');

    // RF30: Búsqueda de texto
    if (filters?.q) {
      queryBuilder.andWhere(
        '(epa.nombre ILIKE :q OR epa.descripcion ILIKE :q OR epa.sintomas ILIKE :q OR epa.tags ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    // RF30: Filtro por tipo
    if (filters?.tipoEpa) {
      queryBuilder.andWhere('epa.tipoEpa = :tipoEpa', { tipoEpa: filters.tipoEpa });
    }

    // RF30: Filtro por tipo de cultivo
    if (filters?.tipoCultivoWikiId) {
      queryBuilder.andWhere('tiposCultivo.id = :tipoCultivoWikiId', { tipoCultivoWikiId: filters.tipoCultivoWikiId });
    }

    // RF30: Filtro por mes
    if (filters?.mes) {
      queryBuilder.andWhere(`epa.mesesProbables @> :mes`, { mes: JSON.stringify([filters.mes]) });
    }

    // RF30: Filtro por temporada
    if (filters?.temporada) {
      queryBuilder.andWhere(`epa.temporadas @> :temporada`, { temporada: JSON.stringify([filters.temporada]) });
    }

    // RF30: Filtro por fotos
    if (filters?.conFotos) {
      queryBuilder.andWhere(
        '(array_length(epa.fotosSintomas, 1) > 0 OR array_length(epa.fotosGenerales, 1) > 0)'
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const epa = await this.epaRepo.findOne({
      where: { id },
      relations: ['tiposCultivo'],
    });

    if (!epa) throw new NotFoundException(`EPA ${id} not found`);
    return epa;
  }

  async create(data: CreateEpaDto) {
    const epa = this.epaRepo.create(data);
    return this.epaRepo.save(epa);
  }

  async update(id: number, data: UpdateEpaDto) {
    const epa = await this.findOne(id);
    Object.assign(epa, data);
    return this.epaRepo.save(epa);
  }

  async remove(id: number) {
    const epa = await this.findOne(id);
    return this.epaRepo.softRemove(epa);
  }

  // ==================== TIPO CULTIVO WIKI ====================
  
  // RF29: CRUD TipoCultivoWiki
  async findAllTiposCultivo() {
    return this.tipoCultivoWikiRepo.find();
  }

  async createTipoCultivo(data: { nombre: string; descripcion?: string }) {
    const tipo = this.tipoCultivoWikiRepo.create(data);
    return this.tipoCultivoWikiRepo.save(tipo);
  }
}
