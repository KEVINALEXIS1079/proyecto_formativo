import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultivosService } from './services/cultivos.service';
import { CultivosController } from './controllers/cultivos.controller';
import { CultivosGateway } from './gateways/cultivos.gateway';
import { Cultivo } from './entities/cultivo.entity';
import { Lote } from '../geo/entities/lote.entity';
import { SubLote } from '../geo/entities/sublote.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cultivo, Lote, SubLote]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [CultivosController],
  providers: [CultivosService, CultivosGateway],
  exports: [CultivosService],
})
export class CultivosModule {}
