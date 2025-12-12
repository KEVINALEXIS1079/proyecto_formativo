import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import {
  CreateUserByAdminDto,
  UpdateProfileDto,
  ChangePasswordDto,
  ChangeRoleDto,
  ChangeStatusDto,
  UpdateUserByAdminDto,
  UserStatus,
} from '../dtos/user-management.dto';
import { RedisService } from '../../../common/services/redis.service';
import { EmailService } from '../../../common/services/email.service';
import { ImageUploadService } from '../../../common/services/image-upload.service';
import { UsersGateway } from '../gateways/users.gateway';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    private redisService: RedisService,
    private emailService: EmailService,
    private imageUploadService: ImageUploadService,
    @Inject(forwardRef(() => UsersGateway))
    private usersGateway: UsersGateway,
  ) { }

  // RF66: Búsqueda avanzada con filtros
  async findAll(filters?: { q?: string; rolId?: number; estado?: string }) {
    const queryBuilder = this.usuarioRepo.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('usuario.deletedAt IS NULL');

    // Búsqueda de texto en múltiples campos
    if (filters?.q && filters.q.trim() !== '') {
      queryBuilder.andWhere(
        '(usuario.nombre ILIKE :q OR usuario.apellido ILIKE :q OR usuario.correo ILIKE :q OR usuario.identificacion ILIKE :q)',
        { q: `%${filters.q}%` }
      );
    }

    // Filtro por rol
    if (filters?.rolId !== undefined && filters.rolId !== null) {
      queryBuilder.andWhere('usuario.rolId = :rolId', { rolId: Number(filters.rolId) });
    }

    // Filtro por estado
    if (filters?.estado && filters.estado.trim() !== '') {
      queryBuilder.andWhere('LOWER(usuario.estado) = LOWER(:estado)', { estado: filters.estado });
    }

    const result = await queryBuilder
      .orderBy('usuario.createdAt', 'DESC')
      .getMany();

    return result;
  }

  async findById(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} not found`);
    }

    return usuario;
  }

  async findByEmail(correo: string) {
    return this.usuarioRepo.findOne({ where: { correo } });
  }

  // RF67: Creación manual por admin
  async createByAdmin(data: CreateUserByAdminDto) {
    // Validar unicidad
    const existingEmail = await this.usuarioRepo.findOne({ where: { correo: data.correo } });
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existingId = await this.usuarioRepo.findOne({ where: { identificacion: data.identificacion } });
    if (existingId) {
      throw new BadRequestException('La identificación ya está registrada');
    }

    // Generar contraseña temporal si no se proporciona
    const password = data.password || this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = this.usuarioRepo.create({
      ...data,
      passwordHash,
      estado: 'activo',
      rolId: data.rolId || 5, // Default: Invitado
    });

    const saved = await this.usuarioRepo.save(usuario);

    // Enviar email con credenciales
    await this.emailService.sendWelcomeEmail(saved.correo, {
      nombre: saved.nombre,
      correo: saved.correo,
      password: password,
    });

    return saved;
  }

  // RF68: Edición completa de perfil
  async updateProfile(id: number, data: UpdateProfileDto) {
    const usuario = await this.findById(id);

    // Si se actualiza el correo, resetear emailVerifiedAt
    if (data.correo && data.correo !== usuario.correo) {
      const existing = await this.usuarioRepo.findOne({ where: { correo: data.correo } });
      if (existing) {
        throw new BadRequestException('El correo ya está registrado');
      }
      usuario.emailVerifiedAt = undefined as any;
    }

    Object.assign(usuario, data);
    return this.usuarioRepo.save(usuario);
  }

  // RF69: Cambio de rol con invalidación de caché
  async changeRole(id: number, data: ChangeRoleDto) {
    const usuario = await this.findById(id);

    const oldRoleId = usuario.rolId;

    usuario.rolId = data.rolId;
    const updatedUser = await this.usuarioRepo.save(usuario);

    // Invalidar caché de permisos
    await this.redisService.invalidateUserPermissions(id);

    // Opcional: Cerrar todas las sesiones activas
    await this.redisService.deleteAllUserSessions(id);

    // Emitir eventos WebSocket
    this.usersGateway.server.emit('users:updated', updatedUser);
    this.usersGateway.server.emit('users:roleChanged', {
      user: updatedUser,
      oldRoleId,
      newRoleId: data.rolId,
    });

    return { message: 'Rol actualizado. Sesiones cerradas. El usuario debe volver a iniciar sesión.' };
  }

  // RF70: Activar/Inactivar/Bloquear usuario
  async changeStatus(id: number, data: ChangeStatusDto) {
    const usuario = await this.findById(id);

    usuario.estado = data.estado;
    await this.usuarioRepo.save(usuario);

    // Si no es activo, cerrar todas las sesiones
    if (data.estado !== UserStatus.ACTIVO) {
      await this.redisService.deleteAllUserSessions(id);
    }

    return {
      message: `Usuario ${data.estado}. ${data.estado !== UserStatus.ACTIVO ? 'Sesiones cerradas.' : ''}`
    };
  }

  // RF71: Cambio de contraseña desde perfil
  async changePassword(id: number, data: ChangePasswordDto) {
    const usuario = await this.findById(id);

    // Validar contraseña actual
    const isValid = await bcrypt.compare(data.oldPassword, usuario.passwordHash);
    if (!isValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Actualizar contraseña
    usuario.passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.usuarioRepo.save(usuario);

    // Opcional: Cerrar otras sesiones (excepto la actual)
    // await this.redisService.deleteAllUserSessions(id);

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // Actualizar usuario por admin
  async updateByAdmin(id: number, data: UpdateUserByAdminDto) {
    const usuario = await this.findById(id);

    // Validar unicidad para correo
    if (data.correo && data.correo !== usuario.correo) {
      const existing = await this.usuarioRepo.findOne({ where: { correo: data.correo } });
      if (existing) {
        throw new BadRequestException('El correo ya está registrado');
      }
      usuario.emailVerifiedAt = undefined as any;
    }

    // Validar unicidad para identificacion
    if (data.identificacion && data.identificacion !== usuario.identificacion) {
      const existing = await this.usuarioRepo.findOne({ where: { identificacion: data.identificacion } });
      if (existing) {
        throw new BadRequestException('La identificación ya está registrada');
      }
    }

    Object.assign(usuario, data);
    const updatedUser = await this.usuarioRepo.save(usuario);

    // Emitir evento WebSocket
    this.usersGateway.server.emit('users:updated', updatedUser);

    return updatedUser;
  }

  // Métodos auxiliares existentes
  async create(data: CreateUserDto) {
    const existingEmail = await this.usuarioRepo.findOne({ where: { correo: data.correo } });
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const existingId = await this.usuarioRepo.findOne({ where: { identificacion: data.identificacion } });
    if (existingId) {
      throw new BadRequestException('La identificación ya está registrada');
    }

    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const usuario = this.usuarioRepo.create({
      nombre: data.nombre,
      correo: data.correo,
      identificacion: data.identificacion,
      passwordHash,
      estado: data.estado || 'activo',
      emailVerifiedAt: data.emailVerifiedAt,
    });

    return this.usuarioRepo.save(usuario);
  }

  async update(id: number, data: UpdateUserDto) {
    const usuario = await this.findById(id);

    if (data.correo && data.correo !== usuario.correo) {
      const existing = await this.usuarioRepo.findOne({ where: { correo: data.correo } });
      if (existing) {
        throw new BadRequestException('El correo ya está registrado');
      }
    }

    if (data.identificacion && data.identificacion !== usuario.identificacion) {
      const existing = await this.usuarioRepo.findOne({ where: { identificacion: data.identificacion } });
      if (existing) {
        throw new BadRequestException('La identificación ya está registrada');
      }
    }

    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      data.password = undefined;
    }

    Object.assign(usuario, data);
    return this.usuarioRepo.save(usuario);
  }

  async remove(id: number) {
    try {
      const usuario = await this.findById(id);
      usuario.estado = UserStatus.INACTIVO;
      // No soft delete, just deactivate
      return await this.usuarioRepo.save(usuario);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  async restore(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} not found`);
    }

    if (!usuario.deletedAt) {
      throw new BadRequestException('El usuario no está eliminado');
    }

    return this.usuarioRepo.recover(usuario);
  }

  async updateLastLogin(id: number) {
    await this.usuarioRepo.update(id, { lastLoginAt: new Date() });
  }

  // Subir avatar de usuario
  async uploadAvatar(userId: number, file: Express.Multer.File): Promise<Usuario> {
    const usuario = await this.findById(userId);

    // Crear carpeta personalizada: identificacion_nombre
    const folderName = `${usuario.identificacion}_${usuario.nombre}`;

    // Subir imagen con carpeta personalizada
    const avatarUrl = await this.imageUploadService.uploadImage(file, { folder: folderName });

    // Actualizar avatarUrl del usuario
    usuario.avatarUrl = avatarUrl;
    return this.usuarioRepo.save(usuario);
  }

  // Utilidad: Generar contraseña temporal
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
