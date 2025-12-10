import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivosService } from './services/cultivos.service';
import { CultivosGateway } from './gateways/cultivos.gateway';
import { CultivosController } from './controllers/cultivos.controller';
import { Cultivo } from './entities/cultivo.entity';
import { CultivoHistorial } from './entities/cultivo-historial.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cultivo, CultivoHistorial]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    forwardRef(() => GeoModule),
  ],
  controllers: [CultivosController],
  providers: [CultivosService, CultivosGateway, CultivosController],
  exports: [CultivosService],
})
export class CultivosModule {}
