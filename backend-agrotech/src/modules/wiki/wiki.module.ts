import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiService } from './services/wiki.service';
import { WikiGateway } from './gateways/wiki.gateway';
import { WikiController } from './controllers/wiki.controller';
import { WikiTypesController } from './controllers/wiki-types.controller';
import { EPA } from './entities/epa.entity';
import { TipoCultivoWiki } from './entities/tipo-cultivo-wiki.entity';
import { EPA_TipoCultivoWiki } from './entities/epa-tipo-cultivo-wiki.entity';
import { TipoEpa } from './entities/tipo-epa.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EPA, TipoCultivoWiki, EPA_TipoCultivoWiki, TipoEpa]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [WikiController, WikiTypesController],
  providers: [WikiService, WikiGateway],
})
export class WikiModule {}
