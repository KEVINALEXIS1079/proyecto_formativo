import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotService } from './services/iot.service';
import { IotGateway } from './gateways/iot.gateway';
import { IotController } from './controllers/iot.controller';
import { Sensor } from './entities/sensor.entity';
import { SensorLectura } from './entities/sensor-lectura.entity';
import { TipoSensor } from './entities/tipo-sensor.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, SensorLectura, TipoSensor]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [IotController],
  providers: [IotService, IotGateway, IotController],
  exports: [IotService],
})
export class IotModule {}
