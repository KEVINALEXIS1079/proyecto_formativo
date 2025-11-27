import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './services/activities.service';
import { ActivitiesGateway } from './gateways/activities.gateway';
import { ActivitiesController } from './controllers/activities.controller';
import { Actividad } from './entities/actividad.entity';
import { ActividadResponsable } from './entities/actividad-responsable.entity';
import { ActividadServicio } from './entities/actividad-servicio.entity';
import { ActividadEvidencia } from './entities/actividad-evidencia.entity';
import { ActividadInsumoUso } from './entities/actividad-insumo-uso.entity';
import { ActividadInsumo } from './entities/actividad-insumo.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeoModule } from '../geo/geo.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductionModule } from '../production/production.module';
import { FinanceModule } from '../finance/finance.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Actividad,
      ActividadResponsable,
      ActividadServicio,
      ActividadEvidencia,
      ActividadInsumoUso,
      ActividadInsumo,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    GeoModule,
    InventoryModule,
    ProductionModule,
    FinanceModule,
    AuthModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesGateway, ActivitiesController],
})
export class ActivitiesModule {}
