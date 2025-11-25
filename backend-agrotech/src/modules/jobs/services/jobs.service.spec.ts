import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JobsService } from './jobs.service';
import { Sensor } from '../../iot/entities/sensor.entity';
import { SensorLectura } from '../../iot/entities/sensor-lectura.entity';
import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';

describe('JobsService', () => {
  let service: JobsService;
  let sensorRepository: Repository<Sensor>;
  let sensorLecturaRepository: Repository<SensorLectura>;
  let movimientoInsumoRepository: Repository<MovimientoInsumo>;
  let configService: ConfigService;

  const mockSensorRepository = {
    update: jest.fn(),
  };

  const mockSensorLecturaRepository = {
    update: jest.fn(),
  };

  const mockMovimientoInsumoRepository = {
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Sensor),
          useValue: mockSensorRepository,
        },
        {
          provide: getRepositoryToken(SensorLectura),
          useValue: mockSensorLecturaRepository,
        },
        {
          provide: getRepositoryToken(MovimientoInsumo),
          useValue: mockMovimientoInsumoRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    sensorRepository = module.get<Repository<Sensor>>(getRepositoryToken(Sensor));
    sensorLecturaRepository = module.get<Repository<SensorLectura>>(getRepositoryToken(SensorLectura));
    movimientoInsumoRepository = module.get<Repository<MovimientoInsumo>>(getRepositoryToken(MovimientoInsumo));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateSensorConnectionStatus', () => {
    it('should update disconnected sensors', async () => {
      const ttlMinutes = 10;
      const expectedCutoffDate = new Date(Date.now() - ttlMinutes * 60 * 1000);
      const mockResult = { affected: 5 };

      mockConfigService.get.mockReturnValue(ttlMinutes);
      mockSensorRepository.update.mockResolvedValue(mockResult);

      await service.updateSensorConnectionStatus();

      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.sensorDisconnectTtlMinutes', 10);
      expect(mockSensorRepository.update).toHaveBeenCalledWith(
        {
          lastSeenAt: expect.any(Date),
          estadoConexion: 'CONECTADO',
        },
        {
          estadoConexion: 'DESCONECTADO',
        },
      );
      expect(mockSensorRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockConfigService.get.mockReturnValue(10);
      mockSensorRepository.update.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.updateSensorConnectionStatus();

      expect(consoleSpy).toHaveBeenCalledWith('Error en job de actualización de estado de sensores', error);
      consoleSpy.mockRestore();
    });

    it('should use default TTL when config not found', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockSensorRepository.update.mockResolvedValue({ affected: 0 });

      await service.updateSensorConnectionStatus();

      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.sensorDisconnectTtlMinutes', 10);
    });
  });

  describe('cleanupOldData', () => {
    it('should cleanup old sensor readings and inventory movements', async () => {
      const sensorRetentionYears = 1;
      const movementRetentionYears = 2;
      const sensorCutoffDate = new Date();
      sensorCutoffDate.setFullYear(sensorCutoffDate.getFullYear() - sensorRetentionYears);
      const movementCutoffDate = new Date();
      movementCutoffDate.setFullYear(movementCutoffDate.getFullYear() - movementRetentionYears);

      mockConfigService.get
        .mockReturnValueOnce(sensorRetentionYears)
        .mockReturnValueOnce(movementRetentionYears);
      mockSensorLecturaRepository.update.mockResolvedValue({ affected: 10 });
      mockMovimientoInsumoRepository.update.mockResolvedValue({ affected: 5 });

      await service.cleanupOldData();

      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.sensorReadingsRetentionYears', 1);
      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.inventoryMovementsRetentionYears', 2);
      expect(mockSensorLecturaRepository.update).toHaveBeenCalledWith(
        {
          createdAt: expect.any(Date),
          deletedAt: null,
        },
        {
          deletedAt: expect.any(Date),
        },
      );
      expect(mockMovimientoInsumoRepository.update).toHaveBeenCalledWith(
        {
          createdAt: expect.any(Date),
          deletedAt: null,
        },
        {
          deletedAt: expect.any(Date),
        },
      );
    });

    it('should handle errors in sensor cleanup', async () => {
      const error = new Error('Sensor cleanup error');
      mockConfigService.get.mockReturnValue(1);
      mockSensorLecturaRepository.update.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.cleanupOldData();

      expect(consoleSpy).toHaveBeenCalledWith('Error en job de limpieza de datos antiguos', error);
      consoleSpy.mockRestore();
    });

    it('should handle errors in movement cleanup', async () => {
      const error = new Error('Movement cleanup error');
      mockConfigService.get
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);
      mockSensorLecturaRepository.update.mockResolvedValue({ affected: 0 });
      mockMovimientoInsumoRepository.update.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await service.cleanupOldData();

      expect(consoleSpy).toHaveBeenCalledWith('Error en job de limpieza de datos antiguos', error);
      consoleSpy.mockRestore();
    });

    it('should use default retention years when config not found', async () => {
      mockConfigService.get
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(undefined);
      mockSensorLecturaRepository.update.mockResolvedValue({ affected: 0 });
      mockMovimientoInsumoRepository.update.mockResolvedValue({ affected: 0 });

      await service.cleanupOldData();

      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.sensorReadingsRetentionYears', 1);
      expect(mockConfigService.get).toHaveBeenCalledWith('config.jobs.inventoryMovementsRetentionYears', 2);
    });
  });
});