import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiService } from './services/wiki.service';
import { WikiGateway } from './gateways/wiki.gateway';
import { WikiController } from './controllers/wiki.controller';
import { EPA } from './entities/epa.entity';
import { TipoCultivoWiki } from './entities/tipo-cultivo-wiki.entity';
import { EPA_TipoCultivoWiki } from './entities/epa-tipo-cultivo-wiki.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([EPA, TipoCultivoWiki, EPA_TipoCultivoWiki]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  providers: [WikiService, WikiGateway, WikiController],
})
export class WikiModule {}
