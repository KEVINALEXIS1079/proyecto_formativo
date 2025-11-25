import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EPA } from '../entities/epa.entity';
import { TipoCultivoWiki } from '../entities/tipo-cultivo-wiki.entity';
import { EPA_TipoCultivoWiki } from '../entities/epa-tipo-cultivo-wiki.entity';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';
import { ImageUploadService } from '../../../common/services/image-upload.service';
import { WikiGateway } from '../gateways/wiki.gateway';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(EPA)
    private readonly epaRepo: Repository<EPA>,
    @InjectRepository(TipoCultivoWiki) private tipoCultivoWikiRepo: Repository<TipoCultivoWiki>,
    @InjectRepository(EPA_TipoCultivoWiki) private epaTipoCultivoRepo: Repository<EPA_TipoCultivoWiki>,
    private imageUploadService: ImageUploadService,
    @Inject(forwardRef(() => WikiGateway))
    private wikiGateway: WikiGateway,
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

  async create(data: CreateEpaDto, files?: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    // Procesar fotosSintomas
    const fotosSintomas: string[] = [];
    if (files?.fotosSintomas) {
      for (const file of files.fotosSintomas) {
        const url = await this.imageUploadService.uploadImage(file, { folder: 'wiki' });
        fotosSintomas.push(url);
      }
    }

    // Procesar fotosGenerales
    const fotosGenerales: string[] = [];
    if (files?.fotosGenerales) {
      for (const file of files.fotosGenerales) {
        const url = await this.imageUploadService.uploadImage(file, { folder: 'wiki' });
        fotosGenerales.push(url);
      }
    }

    // RF28: Validar que los tipos de cultivo asociados existen
    if (data.tiposCultivoIds && data.tiposCultivoIds.length > 0) {
      const tiposCultivo = await this.tipoCultivoWikiRepo.findBy({ id: data.tiposCultivoIds as any });
      if (tiposCultivo.length !== data.tiposCultivoIds.length) {
        throw new BadRequestException('Algunos tipos de cultivo especificados no existen');
      }
    }

    const epa = this.epaRepo.create({ ...data, fotosSintomas, fotosGenerales });
    const saved = await this.epaRepo.save(epa);

    // Emitir evento WebSocket
    this.wikiGateway.broadcast('wiki:epas:created', saved);

    return saved;
  }

  async update(id: number, data: UpdateEpaDto, files?: { fotosSintomas?: Express.Multer.File[], fotosGenerales?: Express.Multer.File[] }) {
    const epa = await this.findOne(id);

    // Procesar fotosSintomas si se envían
    if (files?.fotosSintomas) {
      const fotosSintomas: string[] = [];
      for (const file of files.fotosSintomas) {
        const url = await this.imageUploadService.uploadImage(file, { folder: 'wiki' });
        fotosSintomas.push(url);
      }
      epa.fotosSintomas = fotosSintomas;
    }

    // Procesar fotosGenerales si se envían
    if (files?.fotosGenerales) {
      const fotosGenerales: string[] = [];
      for (const file of files.fotosGenerales) {
        const url = await this.imageUploadService.uploadImage(file, { folder: 'wiki' });
        fotosGenerales.push(url);
      }
      epa.fotosGenerales = fotosGenerales;
    }

    // RF28: Validar que los tipos de cultivo asociados existen si se actualizan
    if (data.tiposCultivoIds && data.tiposCultivoIds.length > 0) {
      const tiposCultivo = await this.tipoCultivoWikiRepo.findBy({ id: data.tiposCultivoIds as any });
      if (tiposCultivo.length !== data.tiposCultivoIds.length) {
        throw new BadRequestException('Algunos tipos de cultivo especificados no existen');
      }
    }

    Object.assign(epa, data);
    const updated = await this.epaRepo.save(epa);

    // Emitir evento WebSocket
    this.wikiGateway.broadcast('wiki:epas:updated', updated);

    return updated;
  }

  async remove(id: number) {
    const epa = await this.findOne(id);
    const removed = await this.epaRepo.softRemove(epa);

    // Emitir evento WebSocket
    this.wikiGateway.broadcast('wiki:epas:deleted', removed);

    return removed;
  }

  // ==================== TIPO CULTIVO WIKI ====================

  // RF29: CRUD TipoCultivoWiki
  async findAllTiposCultivo() {
    return this.tipoCultivoWikiRepo.find({ where: { deletedAt: IsNull() } });
  }

  async findTipoCultivoById(id: number) {
    const tipo = await this.tipoCultivoWikiRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['epaTipoCultivos'],
    });

    if (!tipo) throw new NotFoundException(`Tipo de cultivo wiki ${id} not found`);
    return tipo;
  }

  async createTipoCultivo(data: { nombre: string; descripcion?: string }) {
    const tipo = this.tipoCultivoWikiRepo.create(data);
    return this.tipoCultivoWikiRepo.save(tipo);
  }

  async updateTipoCultivo(id: number, data: { nombre?: string; descripcion?: string }) {
    const tipo = await this.findTipoCultivoById(id);
    Object.assign(tipo, data);
    return this.tipoCultivoWikiRepo.save(tipo);
  }

  async removeTipoCultivo(id: number) {
    const tipo = await this.findTipoCultivoById(id);
    return this.tipoCultivoWikiRepo.softRemove(tipo);
  }

  // ==================== RELACIONES EPA ↔ TIPO CULTIVO ====================

  // RF29: Asociar EPA a tipos de cultivo
  async associateEpaToTiposCultivo(epaId: number, tiposCultivoIds: number[]) {
    // Validar que la EPA existe
    await this.findOne(epaId);

    // Validar que todos los tipos existen
    const tiposCultivo = await this.tipoCultivoWikiRepo.findBy({ id: tiposCultivoIds as any });
    if (tiposCultivo.length !== tiposCultivoIds.length) {
      throw new BadRequestException('Algunos tipos de cultivo especificados no existen');
    }

    // Crear las asociaciones en la tabla intermedia
    const asociaciones = tiposCultivoIds.map(tipoId => ({
      epaId,
      tipoCultivoWikiId: tipoId,
    }));

    // Primero eliminar asociaciones existentes para evitar duplicados
    await this.epaTipoCultivoRepo.delete({ epaId });

    // Insertar nuevas asociaciones
    await this.epaTipoCultivoRepo.save(asociaciones);

    return this.findOne(epaId);
  }

  // RF29: Desasociar EPA de tipos de cultivo
  async disassociateEpaFromTiposCultivo(epaId: number, tiposCultivoIds: number[]) {
    // Validar que la EPA existe
    await this.findOne(epaId);

    // Eliminar las asociaciones específicas
    await this.epaTipoCultivoRepo.delete({
      epaId,
      tipoCultivoWikiId: tiposCultivoIds as any,
    });

    return this.findOne(epaId);
  }

  // ==================== RELACIONES ====================

  // Obtener tipos de cultivo asociados a una EPA
  async findTiposCultivoByEpa(epaId: number) {
    const epa = await this.epaRepo.findOne({
      where: { id: epaId },
      relations: ['epaTipoCultivos', 'epaTipoCultivos.tipoCultivoWiki'],
    });

    if (!epa) throw new NotFoundException(`EPA ${epaId} not found`);

    return epa.epaTipoCultivos.map(relation => relation.tipoCultivoWiki);
  }

  // ==================== PAGINACIÓN ====================

  // RF30: Listado paginado de EPA
  async findAllPaginated(filters?: {
    q?: string;
    tipoEpa?: string;
    tipoCultivoWikiId?: number;
    mes?: number;
    temporada?: string;
    conFotos?: boolean;
  }, pagination?: { page?: number; limit?: number; orderBy?: string; orderDir?: string }) {
    const { page = 1, limit = 20, orderBy = 'nombre', orderDir = 'ASC' } = pagination || {};

    const queryBuilder = this.epaRepo.createQueryBuilder('epa')
      .leftJoinAndSelect('epa.tiposCultivo', 'tiposCultivo')
      .where('epa.deletedAt IS NULL');

    // Aplicar filtros (igual que en findAll)
    if (filters?.q) {
      queryBuilder.andWhere(
        '(epa.nombre ILIKE :q OR epa.descripcion ILIKE :q OR epa.sintomas ILIKE :q OR epa.tags ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    if (filters?.tipoEpa) {
      queryBuilder.andWhere('epa.tipoEpa = :tipoEpa', { tipoEpa: filters.tipoEpa });
    }

    if (filters?.tipoCultivoWikiId) {
      queryBuilder.andWhere('tiposCultivo.id = :tipoCultivoWikiId', { tipoCultivoWikiId: filters.tipoCultivoWikiId });
    }

    if (filters?.mes) {
      queryBuilder.andWhere(`epa.mesesProbables @> :mes`, { mes: JSON.stringify([filters.mes]) });
    }

    if (filters?.temporada) {
      queryBuilder.andWhere(`epa.temporadas @> :temporada`, { temporada: JSON.stringify([filters.temporada]) });
    }

    if (filters?.conFotos) {
      queryBuilder.andWhere(
        '(array_length(epa.fotosSintomas, 1) > 0 OR array_length(epa.fotosGenerales, 1) > 0)'
      );
    }

    // Paginación
    queryBuilder
      .orderBy(`epa.${orderBy}`, orderDir.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
