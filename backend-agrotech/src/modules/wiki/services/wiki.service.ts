import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { EPA } from '../entities/epa.entity';
import { TipoCultivoWiki } from '../entities/tipo-cultivo-wiki.entity';
import { TipoEpa } from '../entities/tipo-epa.entity';
import { CreateEpaDto } from '../dtos/create-epa.dto';
import { UpdateEpaDto } from '../dtos/update-epa.dto';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(EPA)
    private readonly epaRepo: Repository<EPA>,
    @InjectRepository(TipoCultivoWiki)
    private tipoCultivoWikiRepo: Repository<TipoCultivoWiki>,
    @InjectRepository(TipoEpa)
    private tipoEpaRepo: Repository<TipoEpa>,
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
    const queryBuilder = this.epaRepo
      .createQueryBuilder('epa')
      .leftJoinAndSelect('epa.epaTipoCultivos', 'epaTipo')
      .leftJoinAndSelect('epaTipo.tipoCultivoWiki', 'tipoCultivo')
      .where('epa.deletedAt IS NULL');

    // RF30: Búsqueda de texto
    if (filters?.q) {
      queryBuilder.andWhere(
        '(epa.nombre ILIKE :q OR epa.descripcion ILIKE :q OR epa.sintomas ILIKE :q OR array_to_string(epa.tags, \' \') ILIKE :q)',
        { q: `%${filters.q}%` },
      );
    }

    // RF30: Filtro por tipo
    if (filters?.tipoEpa) {
      queryBuilder.andWhere('epa.tipoEpa = :tipoEpa', {
        tipoEpa: filters.tipoEpa,
      });
    }

    // RF30: Filtro por tipo de cultivo
    if (filters?.tipoCultivoWikiId) {
      queryBuilder.andWhere('epaTipo.tipoCultivoWikiId = :tipoCultivoWikiId', {
        tipoCultivoWikiId: filters.tipoCultivoWikiId,
      });
    }

    // RF30: Filtro por mes
    if (filters?.mes) {
      queryBuilder.andWhere(`epa.mesesProbables @> :mes`, {
        mes: JSON.stringify([filters.mes]),
      });
    }

    // RF30: Filtro por temporada
    if (filters?.temporada) {
      queryBuilder.andWhere(`epa.temporadas @> :temporada`, {
        temporada: JSON.stringify([filters.temporada]),
      });
    }

    // RF30: Filtro por fotos
    if (filters?.conFotos) {
      queryBuilder.andWhere(
        '(array_length(epa.fotosSintomas, 1) > 0 OR array_length(epa.fotosGenerales, 1) > 0)',
      );
    }

    const epas = await queryBuilder.getMany();

    // Para cada EPA, obtener el objeto TipoEpa completo
    for (const epa of epas) {
      if (epa.tipoEpa) {
        const tipoEpaEntity = await this.tipoEpaRepo.findOne({
          where: { tipoEpaEnum: epa.tipoEpa }
        });
        if (tipoEpaEntity) {
          (epa as any).tipoEpa = tipoEpaEntity;
        }
      }
    }

    return epas;
  }

  async findOne(id: number) {
    const epa = await this.epaRepo.findOne({
      where: { id },
      relations: ['epaTipoCultivos'],
    });

    if (!epa) throw new NotFoundException(`EPA ${id} not found`);

    // Obtener el objeto TipoEpa completo
    if (epa.tipoEpa) {
      const tipoEpaEntity = await this.tipoEpaRepo.findOne({
        where: { tipoEpaEnum: epa.tipoEpa }
      });
      if (tipoEpaEntity) {
        (epa as any).tipoEpa = tipoEpaEntity;
      }
    }

    return epa;
  }

  async create(data: CreateEpaDto, userId?: number) {
    console.log('=== WIKI SERVICE CREATE DEBUG ===');
    console.log('Data received:', JSON.stringify(data, null, 2));
    console.log('UserId:', userId);

    const { tiposCultivoIds, tipoEpa, ...epaData } = data;
    console.log('tiposCultivoIds:', tiposCultivoIds);
    console.log('tipoEpa:', tipoEpa);
    console.log('epaData:', JSON.stringify(epaData, null, 2));

    // Validar que tipoEpa sea válido
    const validTipoEpa = ['enfermedad', 'plaga', 'arvense'];
    if (!tipoEpa || !validTipoEpa.includes(tipoEpa.toLowerCase())) {
      throw new BadRequestException(`Tipo EPA inválido: ${tipoEpa}`);
    }

    // Crear la EPA primero
    const epa = this.epaRepo.create({
      ...epaData,
      tipoEpa,
      manejoYControl: data.manejo, // Mapear manejo a manejoYControl
      creadoPorUsuarioId: userId || 1, // Default al admin si no se proporciona
    });

    console.log('EPA to create:', JSON.stringify(epa, null, 2));

    const savedEpa = await this.epaRepo.save(epa);
    console.log('EPA saved:', JSON.stringify(savedEpa, null, 2));

    // Crear las relaciones con tipos de cultivo si se proporcionaron
    if (tiposCultivoIds && tiposCultivoIds.length > 0) {
      for (const tipoCultivoId of tiposCultivoIds) {
        // Verificar que el tipo de cultivo existe
        const tipoCultivo = await this.tipoCultivoWikiRepo.findOne({
          where: { id: tipoCultivoId }
        });

        if (tipoCultivo) {
          // Crear la relación EPA_TipoCultivoWiki
          await this.epaRepo.query(`
            INSERT INTO epa_tipos_cultivos_wiki ("epaId", "tipoCultivoWikiId")
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `, [savedEpa.id, tipoCultivoId]);
        }
      }
    }

    return savedEpa;
  }

  async update(id: number, data: UpdateEpaDto) {
    console.log('=== WIKI SERVICE UPDATE DEBUG ===');
    console.log('ID:', id);
    console.log('Data received:', JSON.stringify(data, null, 2));

    try {
      const epa = await this.findOne(id);
      console.log('EPA found:', !!epa);

      // Mapear campos como en create
      const updateData: any = { ...data };

      // Usar tipoEpa directamente si se proporciona
      if (data.tipoEpa !== undefined) {
        const validTipoEpa = ['enfermedad', 'plaga', 'arvense'];
        if (!validTipoEpa.includes(data.tipoEpa.toLowerCase())) {
          throw new BadRequestException(`Tipo EPA inválido: ${data.tipoEpa}`);
        }
        updateData.tipoEpa = data.tipoEpa.toLowerCase();
      }
  
        // Mapear manejo a manejoYControl si existe
      if ((data as any).manejo !== undefined) {
        updateData.manejoYControl = (data as any).manejo;
        delete updateData.manejo;
        console.log('Mapped manejo to manejoYControl');
      }

      console.log('Update data after mapping:', JSON.stringify(updateData, null, 2));

      Object.assign(epa, updateData);
      console.log('EPA after Object.assign');

      const savedEpa = await this.epaRepo.save(epa);
      console.log('EPA saved successfully');

      return savedEpa;
    } catch (error) {
      console.error('=== UPDATE ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
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

  async updateTipoCultivo(id: number, data: { nombre?: string; descripcion?: string }) {
    const tipo = await this.tipoCultivoWikiRepo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoCultivoWiki ${id} not found`);
    Object.assign(tipo, data);
    return this.tipoCultivoWikiRepo.save(tipo);
  }

  async removeTipoCultivo(id: number) {
    const tipo = await this.tipoCultivoWikiRepo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoCultivoWiki ${id} not found`);
    return this.tipoCultivoWikiRepo.remove(tipo);
  }

  // ==================== TIPO EPA ====================

  async findAllTipoEpa() {
    return this.tipoEpaRepo.find();
  }

  async createTipoEpa(data: { nombre: string; descripcion?: string; tipoEpaEnum?: string }) {
    const tipo = this.tipoEpaRepo.create(data);
    return this.tipoEpaRepo.save(tipo);
  }

  async updateTipoEpa(id: number, data: any) {
    const tipo = await this.tipoEpaRepo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoEpa ${id} not found`);
    Object.assign(tipo, data);
    return this.tipoEpaRepo.save(tipo);
  }

  async removeTipoEpa(id: number) {
    const tipo = await this.tipoEpaRepo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoEpa ${id} not found`);
    return this.tipoEpaRepo.remove(tipo);
  }
}
