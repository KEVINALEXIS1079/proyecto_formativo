import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoService } from './services/geo.service';
import { GeoGateway } from './gateways/geo.gateway';
import { GeoController } from './controllers/geo.controller';
import { Lote } from './entities/lote.entity';
import { SubLote } from './entities/sublote.entity';
import { Cultivo } from './entities/cultivo.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Lote, SubLote, Cultivo]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [GeoController],
  providers: [GeoService, GeoGateway, GeoController],
  exports: [GeoService],
})
export class GeoModule {}
