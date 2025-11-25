import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from '../config/configuration';
import { validationSchema } from '../config/validation.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { GeoModule } from '../modules/geo/geo.module';
import { CultivosModule } from '../modules/cultivos/cultivos.module';
import { ActivitiesModule } from '../modules/activities/activities.module';
import { InventoryModule } from '../modules/inventory/inventory.module';
import { WikiModule } from '../modules/wiki/wiki.module';
import { ProductionModule } from '../modules/production/production.module';
import { IotModule } from '../modules/iot/iot.module';
import { SeedsModule } from '../database/seeds/seeds.module';
import { ReportsModule } from '../modules/reports/reports.module';
import { JobsModule } from '../modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('config.database.host'),
        port: configService.get<number>('config.database.port'),
        username: configService.get<string>('config.database.username'),
        password: configService.get<string>('config.database.password'),
        database: configService.get<string>('config.database.name'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GeoModule,
    CultivosModule,
    ActivitiesModule,
    InventoryModule,
    WikiModule,
    ProductionModule,
    IotModule,
    SeedsModule,
    ReportsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
