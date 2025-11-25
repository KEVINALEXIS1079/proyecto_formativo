import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersGateway } from './gateways/users.gateway';
import { UsersController } from './controllers/users.controller';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { RedisService } from '../../common/services/redis.service';
import { EmailService } from '../../common/services/email.service';
import { ImageUploadService } from '../../common/services/image-upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol, Permiso]),
    forwardRef(() => AuthModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway, RedisService, EmailService, ImageUploadService],
  exports: [UsersService],
})
export class UsersModule {}
