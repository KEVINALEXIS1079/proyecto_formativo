import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Sensor } from '../../iot/entities/sensor.entity';
import { SensorLectura } from '../../iot/entities/sensor-lectura.entity';
import { MovimientoInsumo } from '../../inventory/entities/movimiento-insumo.entity';
import { RedisService } from '../../../common/services/redis.service';
import { CropReportsService } from '../../reports/services/crop-reports.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    @InjectRepository(SensorLectura)
    private readonly sensorLecturaRepository: Repository<SensorLectura>,
    @InjectRepository(MovimientoInsumo)
    private readonly movimientoInsumoRepository: Repository<MovimientoInsumo>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly cropReportsService: CropReportsService,
  ) {}

  @Cron('*/5 * * * *') // Cada 5 minutos
  async updateSensorConnectionStatus() {
    this.logger.log('Ejecutando job: Actualizar estado de conexión de sensores');

    const ttlMinutes = this.configService.get<number>('config.jobs.sensorDisconnectTtlMinutes', 10);
    const cutoffDate = new Date(Date.now() - ttlMinutes * 60 * 1000);

    try {
      const result = await this.sensorRepository.update(
        {
          lastSeenAt: LessThan(cutoffDate),
          estadoConexion: 'CONECTADO', // Solo actualizar si están conectados
        },
        {
          estadoConexion: 'DESCONECTADO',
        },
      );

      this.logger.log(`Sensores desconectados: ${result.affected}`);
    } catch (error) {
      this.logger.error('Error en job de actualización de estado de sensores', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Diariamente a medianoche
  async cleanupOldData() {
    this.logger.log('Ejecutando job: Limpieza de datos antiguos');

    const sensorRetentionYears = this.configService.get<number>('config.jobs.sensorReadingsRetentionYears', 1);
    const movementRetentionYears = this.configService.get<number>('config.jobs.inventoryMovementsRetentionYears', 2);

    const sensorCutoffDate = new Date();
    sensorCutoffDate.setFullYear(sensorCutoffDate.getFullYear() - sensorRetentionYears);

    const movementCutoffDate = new Date();
    movementCutoffDate.setFullYear(movementCutoffDate.getFullYear() - movementRetentionYears);

    try {
      // Soft delete de lecturas de sensores antiguas
      const sensorResult = await this.sensorLecturaRepository.update(
        {
          createdAt: LessThan(sensorCutoffDate),
          deletedAt: IsNull(), // Solo si no están ya eliminadas
        },
        {
          deletedAt: new Date(),
        },
      );

      this.logger.log(`Lecturas de sensores eliminadas: ${sensorResult.affected}`);

      // Soft delete de movimientos de insumo antiguos
      const movementResult = await this.movimientoInsumoRepository.update(
        {
          createdAt: LessThan(movementCutoffDate),
          deletedAt: IsNull(), // Solo si no están ya eliminadas
        },
        {
          deletedAt: new Date(),
        },
      );

      this.logger.log(`Movimientos de insumo eliminados: ${movementResult.affected}`);
    } catch (error) {
      this.logger.error('Error en job de limpieza de datos antiguos', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR) // Cada hora
  async cleanupExpiredPermissionCache() {
    this.logger.log('Ejecutando job: Limpieza de caché expirada de permisos efectivos');

    try {
      // Redis maneja automáticamente la expiración TTL, pero podemos limpiar cachés antiguos manualmente
      // o invalidar cachés que puedan estar corruptos
      const client = this.redisService.getClient();

      // Obtener todas las claves de permisos
      const keys = await client.keys('permissions:user:*');

      if (keys.length === 0) {
        this.logger.log('No hay cachés de permisos para limpiar');
        return;
      }

      let cleanedCount = 0;
      const maxAgeHours = this.configService.get<number>('config.jobs.permissionCacheMaxAgeHours', 24);

      for (const key of keys) {
        // Verificar TTL de cada clave
        const ttl = await client.ttl(key);
        if (ttl === -1) { // Sin expiración (no debería pasar)
          await client.del(key);
          cleanedCount++;
          this.logger.warn(`Eliminada clave sin TTL: ${key}`);
        } else if (ttl > maxAgeHours * 3600) { // TTL demasiado largo
          // Resetear TTL a valor razonable
          await client.expire(key, maxAgeHours * 3600);
          this.logger.log(`Reseteado TTL para clave: ${key}`);
        }
      }

      this.logger.log(`Limpieza de caché de permisos completada. Claves procesadas: ${keys.length}, limpiadas: ${cleanedCount}`);
    } catch (error) {
      this.logger.error('Error en job de limpieza de caché de permisos', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM) // Diariamente a las 2 AM
  async validateInventoryConsistency() {
    this.logger.log('Ejecutando job: Validación de coherencia inventario vs actividades (RF61)');

    try {
      // Obtener todos los cultivos activos (asumiendo que tienen actividades recientes)
      const cultivosActivos = await this.cropReportsService.getCultivosFiltered({
        fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      });

      let totalCultivos = 0;
      let cultivosConInconsistencias = 0;
      let totalInconsistencias = 0;

      for (const cultivo of cultivosActivos) {
        try {
          const resultado = await this.cropReportsService.validateConsistency(cultivo.id);

          if (!resultado.esCoherente) {
            cultivosConInconsistencias++;
            totalInconsistencias += resultado.diferencias.length;

            this.logger.warn(`Inconsistencias encontradas en cultivo ${cultivo.nombreCultivo} (ID: ${cultivo.id}):`);
            resultado.diferencias.forEach(diff => {
              this.logger.warn(`  - ${diff.nombre || `Insumo ${diff.insumoId}`}: ${diff.mensaje}`);
            });
          }

          totalCultivos++;
        } catch (error) {
          this.logger.error(`Error validando coherencia para cultivo ${cultivo.id}:`, error);
        }
      }

      this.logger.log(`Validación de coherencia completada. Cultivos procesados: ${totalCultivos}, con inconsistencias: ${cultivosConInconsistencias}, total inconsistencias: ${totalInconsistencias}`);

      // Aquí se podría enviar notificación por email o guardar en log de auditoría
      if (totalInconsistencias > 0) {
        this.logger.warn(`Se encontraron ${totalInconsistencias} inconsistencias en ${cultivosConInconsistencias} cultivos. Revisar logs para detalles.`);
      }
    } catch (error) {
      this.logger.error('Error en job de validación de coherencia inventario', error);
    }
  }
}