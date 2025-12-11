import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Usuario } from '../../users/entities/usuario.entity';
import { EmailCode } from '../entities/email-code.entity';
import { EmailService } from '../../../common/services/email.service';
import { RedisService } from '../../../common/services/redis.service';
import { VerificationService } from '../../../common/services/verification.service';
import { RegisterDto } from '../dtos/register.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { RequestResetDto, ResetPasswordDto } from '../dtos/reset-password.dto';
import { ROLES } from '../../../common/constants/roles.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    @InjectRepository(EmailCode) private emailCodeRepo: Repository<EmailCode>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private redisService: RedisService,
    private verificationService: VerificationService,
  ) { }

  // RF01: Iniciar registro (Pre-registro en Redis)
  async startRegistration(registerDto: RegisterDto) {
    // Validar unicidad
    const existingUser = await this.usuarioRepo.findOne({
      where: [
        { identificacion: registerDto.identificacion },
        { correo: registerDto.correo },
      ],
    });

    if (existingUser) {
      // Recuperación si está pendiente
      if (existingUser.estado === 'pendiente_verificacion') {
        // Re-enviar código para el existente
        await this.generateVerificationCode(existingUser.id, existingUser.correo);
        return { message: 'Usuario pendiente encontrado. Código reenviado.' };
      }
      if (existingUser.correo === registerDto.correo) throw new BadRequestException('El correo ya está registrado');
      throw new BadRequestException('La identificación ya está registrada');
    }

    // Generar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password antes de guardar en Redis
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const userToStore = { ...registerDto, passwordHash, password: undefined };

    // Guardar en Redis (TTL 30 min)
    await this.redisService.getClient().setex(`pre-reg:${registerDto.correo}`, 1800, JSON.stringify({ user: userToStore, code }));

    // Enviar email
    await this.emailService.sendVerificationEmail(registerDto.correo, code);

    return { message: 'Código de verificación enviado. Revisa tu correo.' };
  }

  // RF01: Completar registro
  async completeRegistration(correo: string, code: string) {
    const data = await this.redisService.getClient().get(`pre-reg:${correo}`);
    if (!data) {
      // throw new BadRequestException('Sesión de registro expirada...');
      return { success: false, message: 'Sesión de registro expirada o no encontrada. Regístrate de nuevo.' };
    }

    const { user, code: storedCode } = JSON.parse(data);
    if (storedCode !== code) {
      // throw new BadRequestException('Código inválido');
      return { success: false, message: 'Código inválido' };
    }

    // Crear usuario
    const newUser = this.usuarioRepo.create({
      nombre: user.nombre,
      apellido: user.apellido,
      identificacion: user.identificacion,
      idFicha: user.idFicha,
      telefono: user.telefono,
      correo: user.correo,
      passwordHash: user.passwordHash,
      // Rol por defecto
      rolId: ROLES.INVITADO,
      // Ya verificado
      estado: 'activo',
      emailVerifiedAt: new Date(),
    });

    const saved = await this.usuarioRepo.save(newUser);

    // Limpiar Redis
    await this.redisService.getClient().del(`pre-reg:${correo}`);

    const { passwordHash: _, ...result } = saved;
    return { success: true, user: result, message: 'Registro completado' };
  }

  // Deprecated direct register (kept for compatibility if needed, using startRegistration logic is preferred)
  async register(registerDto: RegisterDto) {
    return this.startRegistration(registerDto);
  }

  // RF02: Generar código de verificación
  private async generateVerificationCode(usuarioId: number, correo: string) {
    await this.verificationService.generateCode(correo, 'verify', usuarioId);
    return { message: 'Código de verificación enviado al correo' };
  }

  // RF02: Verificar correo
  async verifyEmail(verifyDto: VerifyEmailDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { correo: verifyDto.correo } });
    if (!usuario) {
      // throw new NotFoundException('Usuario no encontrado');
      return { success: false, message: 'Usuario no encontrado' };
    }

    const isValid = await this.verificationService.verifyCode('verify', usuario.id, verifyDto.code);
    if (!isValid) {
      // throw new BadRequestException('Código inválido, expirado o ya usado');
      return { success: false, message: 'Código inválido, expirado o ya usado' };
    }

    // Marcar email como verificado
    usuario.emailVerifiedAt = new Date();
    // User request: wait for admin approval
    // usuario.estado = 'activo'; 
    usuario.estado = 'pendiente_aprobacion';
    await this.usuarioRepo.save(usuario);

    // Invalidar códigos anteriores no usados
    await this.emailCodeRepo.update(
      {
        usuarioId: usuario.id,
        tipo: 'verify',
        usedAt: IsNull(),
      },
      { usedAt: new Date() },
    );

    return { success: true, message: 'Correo verificado exitosamente' };
  }

  // RF02: Reenviar código de verificación
  async resendVerificationCode(correo: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { correo } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.emailVerifiedAt) {
      throw new BadRequestException('El correo ya está verificado');
    }

    await this.verificationService.generateCode(correo, 'verify', usuario.id);
    return { message: 'Código de verificación reenviado al correo' };
  }

  // RF03: Login (ya existente, mejorado)
  async validateUser(correo: string, password: string): Promise<any> {
    const usuario = await this.usuarioRepo.findOne({
      where: { correo },
      relations: ['rol'],
    });

    if (!usuario) {
      return null;
    }

    // Verificar que no esté inactivo o eliminado
    if (usuario.estado === 'inactivo' || usuario.deletedAt) {
      throw new UnauthorizedException('Usuario inactivo o eliminado');
    }

    // Verificar status
    if (usuario.estado === 'pendiente_verificacion') {
      throw new UnauthorizedException('Debes verificar tu correo electrónico antes de iniciar sesión');
    }

    if (usuario.estado === 'pendiente_aprobacion') {
      throw new UnauthorizedException('Tu cuenta está pendiente de aprobación por un administrador');
    }

    // Verificar que el usuario tenga el email verificado (estado activo)
    if (usuario.estado !== 'activo') {
      throw new UnauthorizedException('El usuario no está activo');
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Actualizar lastLoginAt
    usuario.lastLoginAt = new Date();
    await this.usuarioRepo.save(usuario);

    const { passwordHash, ...result } = usuario;
    return result;
  }

  async login(user: any) {
    // Generar ID único de sesión (jti)
    const sessionId = uuidv4();

    // Payload JWT mínimo (sin permisos)
    const payload = {
      correo: user.correo,
      sub: user.id,
      rolId: user.rolId,
      jti: sessionId, // JWT ID para identificar la sesión
    };

    const access_token = this.jwtService.sign(payload);

    // Crear sesión en Redis (7 días)
    await this.redisService.createSession(sessionId, user.id, 604800);

    // Cachear permisos efectivos en Redis (1 hora)
    const permissions = await this.getEffectivePermissions(user.id);
    await this.redisService.setUserPermissions(user.id, permissions, 3600);

    return {
      access_token,
      user,
    };
  }

  async logout(sessionId: string, token: string, tokenTtl: number) {
    // Eliminar sesión de Redis
    await this.redisService.deleteSession(sessionId);

    // Agregar token a blacklist
    await this.redisService.blacklistToken(token, tokenTtl);

    return { message: 'Logout exitoso' };
  }

  // Obtener permisos efectivos de un usuario (rol + permisos directos)
  private async getEffectivePermissions(userId: number): Promise<string[]> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: userId },
      relations: ['rol', 'rol.rolPermisos', 'rol.rolPermisos.permiso', 'usuarioPermisos', 'usuarioPermisos.permiso'],
    });

    if (!usuario) return [];

    const permisosSet = new Set<string>();

    // Permisos del rol
    if (usuario.rol?.rolPermisos) {
      usuario.rol.rolPermisos.forEach(rp => {
        if (rp.permiso?.clave) {
          permisosSet.add(rp.permiso.clave);
        }
      });
    }

    // Permisos directos del usuario
    if (usuario.usuarioPermisos) {
      usuario.usuarioPermisos.forEach(up => {
        if (up.permiso?.clave) {
          permisosSet.add(up.permiso.clave);
        }
      });
    }

    return Array.from(permisosSet);
  }

  // RF05: Solicitar recuperación de contraseña
  async requestPasswordReset(requestDto: RequestResetDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { correo: requestDto.correo } });

    if (!usuario) {
      // throw new NotFoundException('El correo no está registrado en el sistema');
      // Return success: false to handle it gracefully in frontend
      return { success: false, message: 'El correo no está registrado en el sistema' };
    }

    await this.verificationService.generateCode(usuario.correo, 'reset', usuario.id);

    return { success: true, message: 'Código de recuperación enviado a tu correo' };
  }

  // RF05: Resetear contraseña
  async resetPassword(resetDto: ResetPasswordDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { correo: resetDto.correo } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const emailCode = await this.emailCodeRepo.findOne({
      where: {
        usuarioId: usuario.id,
        tipo: 'reset',
        code: resetDto.code,
        usedAt: IsNull(),
      },
    });

    if (!emailCode) {
      throw new BadRequestException('Código inválido o ya usado');
    }

    if (new Date() > emailCode.expiresAt) {
      throw new BadRequestException('Código expirado');
    }

    // Actualizar contraseña
    usuario.passwordHash = await bcrypt.hash(resetDto.nuevaPassword, 10);
    await this.usuarioRepo.save(usuario);

    // Marcar código como usado
    emailCode.usedAt = new Date();
    await this.emailCodeRepo.save(emailCode);

    // TODO: Invalidar todas las sesiones activas del usuario (Redis)

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // RF05: Verificar código de recuperación (sin resetear)
  async verifyResetCode(correo: string, code: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { correo } });
    if (!usuario) {
      // Por seguridad, puedes retornar error genérico o falso.
      // Retornamos falso para que el frontend sepa que no es válido,
      // pero intentamos no filtrar info si es posible.
      // En este caso, si llega aquí es porque el usuario ya ingresó el correo.
      throw new NotFoundException('Usuario no encontrado');
    }

    const emailCode = await this.emailCodeRepo.findOne({
      where: {
        usuarioId: usuario.id,
        tipo: 'reset',
        code,
        usedAt: IsNull(),
      },
    });

    if (!emailCode) {
      return { valid: false, message: 'Código inválido o ya usado' };
    }

    if (new Date() > emailCode.expiresAt) {
      return { valid: false, message: 'Código expirado' };
    }

    return { valid: true, message: 'Código válido' };
  }

}
