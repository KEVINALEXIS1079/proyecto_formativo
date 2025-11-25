import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JobsService } from './services/jobs.service';
import { Sensor } from '../iot/entities/sensor.entity';
import { SensorLectura } from '../iot/entities/sensor-lectura.entity';
import { MovimientoInsumo } from '../inventory/entities/movimiento-insumo.entity';
import { RedisService } from '../../common/services/redis.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, SensorLectura, MovimientoInsumo]),
    ConfigModule,
    ReportsModule,
  ],
  providers: [JobsService, RedisService],
  exports: [JobsService],
})
export class JobsModule {}