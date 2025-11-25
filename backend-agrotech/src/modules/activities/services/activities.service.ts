import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Actividad } from '../entities/actividad.entity';
import { ActividadResponsable } from '../entities/actividad-responsable.entity';
import { ActividadServicio } from '../entities/actividad-servicio.entity';
import { ActividadEvidencia } from '../entities/actividad-evidencia.entity';
import { ActividadInsumoUso } from '../entities/actividad-insumo-uso.entity';
import { ActividadInsumo } from '../entities/actividad-insumo.entity';
import { CreateActivityDto } from '../dtos/create-activity.dto';
import { UpdateActivityDto } from '../dtos/update-activity.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { CultivosService } from '../../cultivos/services/cultivos.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ProductionService } from '../../production/services/production.service';
import { ImageUploadService } from '../../../common/services/image-upload.service';
import { ActivitiesGateway } from '../gateways/activities.gateway';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Actividad) private actividadRepo: Repository<Actividad>,
    @InjectRepository(ActividadResponsable) private responsableRepo: Repository<ActividadResponsable>,
    @InjectRepository(ActividadServicio) private servicioRepo: Repository<ActividadServicio>,
    @InjectRepository(ActividadEvidencia) private evidenciaRepo: Repository<ActividadEvidencia>,
    @InjectRepository(ActividadInsumoUso) private insumoUsoRepo: Repository<ActividadInsumoUso>,
    @InjectRepository(ActividadInsumo) private actividadInsumoRepo: Repository<ActividadInsumo>,
    private cultivosService: CultivosService,
    private inventoryService: InventoryService,
    private productionService: ProductionService,
    private dataSource: DataSource,
    private imageUploadService: ImageUploadService,
    @Inject(forwardRef(() => ActivitiesGateway))
    private activitiesGateway: ActivitiesGateway,
  ) {}

  async createActividad(data: CreateActivityDto, usuarioId: number, files?: Express.Multer.File[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cultivo = await this.cultivosService.findCultivoById(data.cultivoId);
      if (!cultivo) throw new NotFoundException('El cultivo no existe');

      if (data.loteId && cultivo.loteId !== data.loteId)
        throw new BadRequestException('El loteId no coincide con el cultivo');

      if (data.subLoteId && cultivo.subLoteId !== data.subLoteId)
        throw new BadRequestException('El subLoteId no coincide con el cultivo');

      // Normalización correcta: solo campos existentes
      data.horasActividad = data.horasActividad ?? 0;
      data.precioHoraActividad = data.precioHoraActividad ?? 0;

      const costoManoObra = Number(data.horasActividad) * Number(data.precioHoraActividad);

      const actividad = this.actividadRepo.create({
        ...data,
        costoManoObra,
        creadoPorUsuarioId: usuarioId,
      });

      const saved = await queryRunner.manager.save(actividad);

      // RF16
      await queryRunner.manager.save(ActividadResponsable, {
        actividadId: saved.id,
        usuarioId,
        horas: data.horasActividad,
        precioHora: data.precioHoraActividad,
        costo: costoManoObra,
      });

      // RF21 Siembra
      if (data.subtipo === 'SIEMBRA') {
        await this.cultivosService.updateCultivoFechaSiembra(
          data.cultivoId,
          new Date(data.fecha),
        );
      }

      // RF22 Finalización
      if (data.subtipo === 'FINALIZACION') {
        await this.cultivosService.updateCultivoFechaFinalizacion(
          data.cultivoId,
          new Date(data.fecha),
        );
      }

      // RF18 Servicios
      if (data.servicios && data.servicios.length > 0) {
        for (const servicio of data.servicios) {
          await queryRunner.manager.save(ActividadServicio, {
            actividadId: saved.id,
            nombreServicio: servicio.nombreServicio,
            horas: servicio.horas,
            precioHora: servicio.precioHora,
            costo: servicio.horas * servicio.precioHora,
          });
        }
      }

      // RF19 Evidencias
      if (data.evidencias && data.evidencias.length > 0) {
        for (let i = 0; i < data.evidencias.length; i++) {
          const evidencia = data.evidencias[i];
          const file = files ? files[i] : null;
          let fotos: string[] = [];
          if (file) {
            const url = await this.imageUploadService.uploadImage(file, { folder: 'activities' });
            fotos = [url];
          }
          await queryRunner.manager.save(ActividadEvidencia, {
            actividadId: saved.id,
            descripcion: evidencia.descripcion,
            fotos,
          });
        }
      }

      // RF20 Consumo de insumos
      if (data.insumos && data.insumos.length > 0) {
        for (const insumo of data.insumos) {
          // Validar stock disponible
          const insumoData = await this.inventoryService.findInsumoById(insumo.insumoId);
          if (!insumoData) throw new BadRequestException(`Insumo ${insumo.insumoId} no encontrado`);

          if (insumoData.stockUso < insumo.cantidadUso) {
            throw new BadRequestException(`Stock insuficiente para insumo ${insumoData.nombre}`);
          }

          // Crear movimiento de consumo
          const movimiento = await this.inventoryService.consumirInsumo(insumo.insumoId, insumo.cantidadUso, saved.id);

          // Crear registro de uso
          await queryRunner.manager.save(ActividadInsumoUso, {
            actividadId: saved.id,
            insumoId: insumo.insumoId,
            cantidadUso: insumo.cantidadUso,
            costoUnitarioUso: insumo.precioUnitarioUso,
            costoTotal: insumo.cantidadUso * insumo.precioUnitarioUso,
            movimientoInsumoId: movimiento.id,
          });
        }
      }

      // RF23 Cosecha
      if (data.subtipo === 'COSECHA' && data.kgRecolectados) {
        await this.productionService.createLoteProduccionFromCosecha({
          cultivoId: data.cultivoId,
          actividadCosechaId: saved.id,
          cantidadKg: data.kgRecolectados,
          fecha: new Date(data.fecha),
        });
      }

      await queryRunner.commitTransaction();

      // Emitir evento WebSocket
      this.activitiesGateway.broadcast('activities:created', saved);

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: { cultivoId?: number; loteId?: number; tipo?: string }) {
    const qb = this.actividadRepo
      .createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.cultivo', 'cultivo')
      .leftJoinAndSelect('actividad.responsables', 'responsables')
      .leftJoinAndSelect('actividad.servicios', 'servicios')
      .leftJoinAndSelect('actividad.evidencias', 'evidencias')
      .leftJoinAndSelect('actividad.insumosUso', 'insumosUso')
      .where('actividad.deletedAt IS NULL');

    if (filters?.cultivoId)
      qb.andWhere('actividad.cultivoId = :c', { c: filters.cultivoId });

    if (filters?.loteId)
      qb.andWhere('actividad.loteId = :l', { l: filters.loteId });

    if (filters?.tipo)
      qb.andWhere('actividad.tipo = :t', { t: filters.tipo });

    return qb.orderBy('actividad.fecha', 'DESC').getMany();
  }

  // RF65: Búsqueda paginada
  async findAllPaginated(pagination: PaginationDto, filters?: { cultivoId?: number; loteId?: number; tipo?: string }) {
    const { page = 1, limit = 20, orderBy = 'fecha', orderDir = 'DESC', q } = pagination;

    const qb = this.actividadRepo
      .createQueryBuilder('actividad')
      .leftJoinAndSelect('actividad.cultivo', 'cultivo')
      .leftJoinAndSelect('actividad.responsables', 'responsables')
      .leftJoinAndSelect('actividad.servicios', 'servicios')
      .leftJoinAndSelect('actividad.evidencias', 'evidencias')
      .leftJoinAndSelect('actividad.insumosUso', 'insumosUso')
      .where('actividad.deletedAt IS NULL');

    // Búsqueda de texto
    if (q) {
      qb.andWhere(
        '(actividad.descripcion ILIKE :q OR actividad.tipo ILIKE :q OR cultivo.nombreCultivo ILIKE :q)',
        { q: `%${q}%` }
      );
    }

    if (filters?.cultivoId)
      qb.andWhere('actividad.cultivoId = :c', { c: filters.cultivoId });

    if (filters?.loteId)
      qb.andWhere('actividad.loteId = :l', { l: filters.loteId });

    if (filters?.tipo)
      qb.andWhere('actividad.tipo = :t', { t: filters.tipo });

    // Paginación
    qb
      .orderBy(`actividad.${orderBy}`, orderDir.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  async findActivityById(id: number) {
    const actividad = await this.actividadRepo.findOne({
      where: { id },
      relations: [
        'cultivo',
        'lote',
        'subLote',
        'responsables',
        'servicios',
        'evidencias',
        'insumosUso',
      ],
    });

    if (!actividad) throw new NotFoundException('Actividad no encontrada');
    return actividad;
  }

  async updateActividad(id: number, data: UpdateActivityDto) {
    const actividad = await this.findActivityById(id);

    if (
      data.horasActividad !== undefined ||
      data.precioHoraActividad !== undefined
    ) {
      const horas = data.horasActividad ?? actividad.horasActividad ?? 0;
      const precio =
        data.precioHoraActividad ?? actividad.precioHoraActividad ?? 0;

      data.costoManoObra = horas * precio;
    }

    Object.assign(actividad, data);

    const updated = await this.actividadRepo.save(actividad);

    // Emitir evento WebSocket
    this.activitiesGateway.broadcast('activities:updated', updated);

    return updated;
  }

  async removeActividad(id: number) {
    const actividad = await this.findActivityById(id);
    const removed = await this.actividadRepo.softRemove(actividad);

    // Emitir evento WebSocket
    this.activitiesGateway.broadcast('activities:deleted', removed);

    return removed;
  }

  // Compatibility methods for legacy code
  async create(data: CreateActivityDto, usuarioId: number, files?: Express.Multer.File[]) {
    return this.createActividad(data, usuarioId, files);
  }

  async findOne(id: number) {
    return this.findActivityById(id);
  }

  async update(id: number, data: UpdateActivityDto) {
    return this.updateActividad(id, data);
  }

  async remove(id: number) {
    return this.removeActividad(id);
  }
}
