import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotService } from './services/iot.service';
import { IotGateway } from './gateways/iot.gateway';
import { IotController } from './controllers/iot.controller';
import { Sensor } from './entities/sensor.entity';
import { SensorLectura } from './entities/sensor-lectura.entity';
import { TipoSensor } from './entities/tipo-sensor.entity';
import { IotGlobalConfig } from './entities/iot-global-config.entity';
import { SensorAlerta } from './entities/sensor-alert.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { MqttService } from '../../common/services/mqtt.service';
import { GeoModule } from '../geo/geo.module';
import { IotMqttService } from './services/iot-mqtt.service';
import { IotGlobalConfigService } from './services/iot-global-config.service';
import { IotGlobalConfigController } from './controllers/iot-global-config.controller';
import { IotReportsService } from './services/iot-reports.service';
import { IotReportsController } from './controllers/iot-reports.controller';
import { Lote } from '../geo/entities/lote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sensor,
      SensorLectura,
      TipoSensor,
      IotGlobalConfig,
      SensorAlerta,
      Lote,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    GeoModule,
  ],
  controllers: [IotController, IotGlobalConfigController, IotReportsController],
  providers: [
    IotService,
    IotGateway,
    MqttService,
    IotMqttService,
    IotGlobalConfigService,
    IotReportsService,
  ],
  exports: [IotService, IotMqttService, IotGlobalConfigService, IotReportsService],
})
export class IotModule {}
