import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Actividad } from '../entities/actividad.entity';
import { ActividadResponsable } from '../entities/actividad-responsable.entity';
import { ActividadServicio } from '../entities/actividad-servicio.entity';
import { ActividadEvidencia } from '../entities/actividad-evidencia.entity';
import { ActividadInsumoUso } from '../entities/actividad-insumo-uso.entity';

import { CreateActivityDto } from '../dtos/create-activity.dto';
import { UpdateActivityDto } from '../dtos/update-activity.dto';

import { GeoService } from '../../geo/services/geo.service';
import { CultivosService } from '../../cultivos/services/cultivos.service';
import { InventoryService } from '../../inventory/services/inventory.service';

import { ProductionService } from '../../production/services/production.service';
import { FinanceService } from '../../finance/services/finance.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Actividad)
    private actividadRepo: Repository<Actividad>,

    @InjectRepository(ActividadResponsable)
    private responsableRepo: Repository<ActividadResponsable>,

    @InjectRepository(ActividadServicio)
    private servicioRepo: Repository<ActividadServicio>,

    @InjectRepository(ActividadEvidencia)
    private evidenciaRepo: Repository<ActividadEvidencia>,

    @InjectRepository(ActividadInsumoUso)
    private insumoRepo: Repository<ActividadInsumoUso>,

    private geoService: GeoService,
    private cultivosService: CultivosService,
    private inventoryService: InventoryService,
    private productionService: ProductionService,
    private financeService: FinanceService,
  ) {}

  async create(data: CreateActivityDto, usuarioId: number) {
    const cultivo = await this.cultivosService.findCultivoById(data.cultivoId);
    if (!cultivo) throw new NotFoundException('El cultivo no existe');

    if (data.loteId && cultivo.loteId !== data.loteId)
      throw new BadRequestException('El loteId no coincide con el cultivo');

    if (data.subLoteId && cultivo.subLoteId !== data.subLoteId)
      throw new BadRequestException('El subLoteId no coincide con el cultivo');

    // Normalización correcta: solo campos existentes
    data.horasActividad = data.horasActividad ?? 0;
    data.precioHoraActividad = data.precioHoraActividad ?? 0;

    const costoManoObra =
      Number(data.horasActividad) * Number(data.precioHoraActividad);

    const actividad = this.actividadRepo.create({
      ...data,
      costoManoObra,
      creadoPorUsuarioId: usuarioId,
    });

    const saved = await this.actividadRepo.save(actividad);

    // RF16
    await this.responsableRepo.save({
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

    // RF23 Cosecha
    if (data.subtipo === 'COSECHA' && data.kgRecolectados) {
      await this.productionService.createLoteProduccionFromCosecha({
        cultivoId: data.cultivoId,
        actividadCosechaId: saved.id,
        cantidadKg: data.kgRecolectados,
        fecha: new Date(data.fecha),
      });
    }

    // Registrar gasto de mano de obra en finanzas
    if (costoManoObra > 0) {
      await this.financeService.registrarGastoManoObra({
        actividadId: saved.id,
        monto: costoManoObra,
        descripcion: `Mano de obra para actividad: ${saved.nombre}`,
        fecha: new Date(data.fecha),
        usuarioId,
      });
    }

    return saved;
  }

  async findAll(filters?: {
    cultivoId?: number;
    loteId?: number;
    tipo?: string;
  }) {
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

    if (filters?.tipo) qb.andWhere('actividad.tipo = :t', { t: filters.tipo });

    return qb.orderBy('actividad.fecha', 'DESC').getMany();
  }

  async findOne(id: number) {
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

  async update(id: number, data: UpdateActivityDto) {
    const actividad = await this.findOne(id);

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

    return this.actividadRepo.save(actividad);
  }

  async remove(id: number) {
    const actividad = await this.findOne(id);
    return this.actividadRepo.softRemove(actividad);
  }

  async addServicio(
    actividadId: number,
    data: { nombreServicio: string; horas: number; precioHora: number },
  ) {
    await this.findOne(actividadId);

    const servicio = this.servicioRepo.create({
      actividadId,
      ...data,
      costo: data.horas * data.precioHora,
    });

    const savedServicio = await this.servicioRepo.save(servicio);

    // Registrar gasto de servicio en finanzas
    if (savedServicio.costo > 0) {
      await this.financeService.registrarGastoServicio({
        actividadId,
        monto: savedServicio.costo,
        descripcion: `Servicio: ${data.nombreServicio}`,
        fecha: new Date(), // Asumimos fecha actual para el servicio
        usuarioId: (await this.findOne(actividadId)).creadoPorUsuarioId, // Usamos el creador de la actividad
      });
    }

    return savedServicio;
  }

  async addEvidencia(
    actividadId: number,
    data: { descripcion: string; imagenes: string[] },
  ) {
    await this.findOne(actividadId);

    const evidencia = this.evidenciaRepo.create({
      actividadId,
      ...data,
    });

    return this.evidenciaRepo.save(evidencia);
  }

  async consumirInsumo(
    actividadId: number,
    data: { insumoId: number; cantidadUso: number; costoUnitarioUso: number },
  ) {
    await this.findOne(actividadId);

    await this.inventoryService.consumirInsumo(
      data.insumoId,
      data.cantidadUso,
      actividadId,
    );

    const registro = this.insumoRepo.create({
      actividadId,
      insumoId: data.insumoId,
      cantidadUso: data.cantidadUso,
      costoUnitarioUso: data.costoUnitarioUso,
      costoTotal: data.cantidadUso * data.costoUnitarioUso,
    });

    const savedInsumo = await this.insumoRepo.save(registro);

    // Registrar gasto de insumo en finanzas
    if (savedInsumo.costoTotal > 0) {
      await this.financeService.registrarGastoInsumo({
        actividadId,
        insumoId: data.insumoId,
        monto: savedInsumo.costoTotal,
        descripcion: `Consumo de insumo ID ${data.insumoId}`,
        fecha: new Date(),
        usuarioId: (await this.findOne(actividadId)).creadoPorUsuarioId,
      });
    }

    return savedInsumo;
  }

  async calcularCostoTotal(actividadId: number) {
    const actividad = await this.findOne(actividadId);

    const costoMO = actividad.costoManoObra || 0;

    const servicios = await this.servicioRepo.find({ where: { actividadId } });
    const costoServicios = servicios.reduce((a, b) => a + b.costo, 0);

    const insumos = await this.insumoRepo.find({ where: { actividadId } });
    const costoInsumos = insumos.reduce((a, b) => a + b.costoTotal, 0);

    return {
      costoMO,
      costoServicios,
      costoInsumos,
      costoTotal: costoMO + costoServicios + costoInsumos,
    };
  }
}
