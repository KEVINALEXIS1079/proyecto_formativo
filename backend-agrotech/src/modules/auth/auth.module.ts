import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { PermissionsService } from './services/permissions.service';
import { AuthController } from './controllers/auth.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from '../users/entities/usuario.entity';
import { EmailCode } from './entities/email-code.entity';
import { Rol } from '../users/entities/rol.entity';
import { Permiso } from '../users/entities/permiso.entity';
import { RolPermiso } from './entities/rol-permiso.entity';
import { UsuarioPermiso } from '../users/entities/usuario-permiso.entity';
import { EmailService } from '../../common/services/email.service';
import { RedisService } from '../../common/services/redis.service';
import { VerificationService } from '../../common/services/verification.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, EmailCode, Rol, Permiso, RolPermiso, UsuarioPermiso]),
    PassportModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d' } as any,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, PermissionsController],
  providers: [AuthService, PermissionsService, LocalStrategy, JwtStrategy, EmailService, RedisService, VerificationService],
  exports: [AuthService, PermissionsService],
})
export class AuthModule {}
