import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotGlobalConfig } from '../entities/iot-global-config.entity';
import {
  CreateGlobalConfigDto,
  UpdateGlobalConfigDto,
} from '../dtos/create-global-config.dto';
import { IotMqttService } from './iot-mqtt.service';
import { IotService } from './iot.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class IotGlobalConfigService {
  constructor(
    @InjectRepository(IotGlobalConfig)
    private readonly configRepo: Repository<IotGlobalConfig>,
    private readonly mqttService: IotMqttService,
    @Inject(forwardRef(() => IotService))
    private readonly iotService: IotService,
  ) {}

  async create(dto: CreateGlobalConfigDto) {
    const entity = this.configRepo.create({
      ...dto,
      defaultSensorsInitialized: false,
    });
    const saved = await this.configRepo.save(entity);
    
    // Initialize sensors for the first time
    await this.initializeSensors(saved, [...(saved.defaultTopics || []), ...(saved.customTopics || [])]);
    
    // Mark as initialized
    saved.defaultSensorsInitialized = true;
    const finalSaved = await this.configRepo.save(saved);

    await this.mqttService.registerConfig(finalSaved);
    return finalSaved;
  }

  findAll() {
    return this.configRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const cfg = await this.configRepo.findOne({ where: { id } });
    if (!cfg) {
      throw new NotFoundException(`Config ${id} not found`);
    }
    return cfg;
  }

  async update(id: number, dto: UpdateGlobalConfigDto) {
    const cfg = await this.findOne(id);

    const oldTopics = [...(cfg.defaultTopics || []), ...(cfg.customTopics || [])];
    const newDefault = dto.defaultTopics !== undefined ? dto.defaultTopics : cfg.defaultTopics;
    const newCustom = dto.customTopics !== undefined ? dto.customTopics : cfg.customTopics;
    const newTopics = [...(newDefault || []), ...(newCustom || [])];

    // Calculate ONLY new topics to add
    const topicsToAdd = newTopics.filter(t => !oldTopics.includes(t));

    // Store old lote and sublote values to check if they changed
    const oldLoteId = cfg.loteId;
    const oldSubLoteId = cfg.subLoteId;

    Object.assign(cfg, dto);
    const saved = await this.configRepo.save(cfg);

    // Update lote and sublote of associated sensors if they changed
    if (saved.loteId !== oldLoteId || saved.subLoteId !== oldSubLoteId) {
      await this.iotService.updateSensorsLoteSubLoteByGlobalConfigId(
        id,
        saved.loteId,
        saved.subLoteId
      );
    }

    if (topicsToAdd.length > 0) {
      await this.initializeSensors(saved, topicsToAdd);
    }

    await this.mqttService.updateConfig(saved);
    await this.iotService.reconnectSensorsByGlobalConfigId(saved.id);
    return saved;
  }

  async remove(id: number) {
    const cfg = await this.findOne(id);
    cfg.activo = false;
    const saved = await this.configRepo.save(cfg);
    await this.mqttService.updateConfig(saved);
    return saved;
  }

  async reconnect(id: number) {
    const cfg = await this.findOne(id);
    await this.mqttService.updateConfig(cfg);
    await this.iotService.reconnectSensorsByGlobalConfigId(cfg.id);
    return { message: `Reconexion solicitada para config ${id}` };
  }

  private async initializeSensors(config: IotGlobalConfig, topics: string[]) {
    if (!topics || topics.length === 0) return;

    console.log(`[IoT] Initializing sensors for config ${config.id}, topics: ${topics.join(', ')}`);

    for (const topic of topics) {
      // Check if sensor already exists for this config and topic
      const existing = await this.iotService.findSensorByTopicAndConfig(topic, config.id);
      if (existing) continue;

      // Create Sensor via IotService (Type mapping is handled internally)
      await this.iotService.createAutoSensor({
        nombre: `Sensor ${topic} - ${config.name}`,
        mqttTopic: topic,
        globalConfigId: config.id,
        loteId: config.loteId,
        subLoteId: config.subLoteId,
        // tipoNombre: undefined // Let auto-mapper handle it
      });
    }
  }
}
