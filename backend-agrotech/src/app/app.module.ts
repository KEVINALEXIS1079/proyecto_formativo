import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { FinanceModule } from '../modules/finance/finance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
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
        synchronize: true, // Enabled to create schema since tables are missing
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
    FinanceModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
