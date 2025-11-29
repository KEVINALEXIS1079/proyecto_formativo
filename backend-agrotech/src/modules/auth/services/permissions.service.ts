import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../../users/entities/rol.entity';
import { Permiso } from '../../users/entities/permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { UsuarioPermiso } from '../../users/entities/usuario-permiso.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Rol) private rolRepo: Repository<Rol>,
    @InjectRepository(Permiso) private permisoRepo: Repository<Permiso>,
    @InjectRepository(RolPermiso) private rolPermisoRepo: Repository<RolPermiso>,
    @InjectRepository(UsuarioPermiso) private usuarioPermisoRepo: Repository<UsuarioPermiso>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    private redisService: RedisService,
  ) {}

  // ==================== GESTIÓN DE PERMISOS ====================
  
  // RF07: Crear permiso
  async createPermiso(data: { modulo: string; accion: string; descripcion?: string }) {
    const clave = `${data.modulo}.${data.accion}`;
    
    // Validar que no exista
    const existing = await this.permisoRepo.findOne({ where: { clave } });
    if (existing) {
      throw new BadRequestException(`El permiso ${clave} ya existe`);
    }
    
    const permiso = this.permisoRepo.create({
      ...data,
      clave,
    });
    
    return this.permisoRepo.save(permiso);
  }

  async findAllPermisos() {
    return this.permisoRepo.find({ order: { modulo: 'ASC', accion: 'ASC' } });
  }

  async findPermisoById(id: number) {
    const permiso = await this.permisoRepo.findOne({ where: { id } });
    if (!permiso) throw new NotFoundException(`Permiso ${id} not found`);
    return permiso;
  }

  async updatePermiso(id: number, data: { modulo?: string; accion?: string; descripcion?: string }) {
    const permiso = await this.findPermisoById(id);
    
    if (data.modulo && data.accion) {
      const clave = `${data.modulo}.${data.accion}`;
      // Check if another permission has this key
      const existing = await this.permisoRepo.findOne({ where: { clave } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`El permiso ${clave} ya existe`);
      }
      permiso.clave = clave;
    } else if (data.modulo || data.accion) {
       // If only one part changes, we need to reconstruct the key using the other part from existing
       const modulo = data.modulo || permiso.modulo;
       const accion = data.accion || permiso.accion;
       const clave = `${modulo}.${accion}`;
       
       const existing = await this.permisoRepo.findOne({ where: { clave } });
       if (existing && existing.id !== id) {
         throw new BadRequestException(`El permiso ${clave} ya existe`);
       }
       permiso.clave = clave;
    }

    Object.assign(permiso, data);
    return this.permisoRepo.save(permiso);
  }

  // ==================== GESTIÓN DE ROLES ====================
  
  // RF06: Crear rol
  async createRol(data: { nombre: string; descripcion?: string; esSistema?: boolean }) {
    const rol = this.rolRepo.create({
      ...data,
      esSistema: data.esSistema || false,
      estado: 'activo',
    });
    
    return this.rolRepo.save(rol);
  }

  async findAllRoles() {
    return this.rolRepo.find();
  }

  async findRolById(id: number) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) throw new NotFoundException(`Rol ${id} not found`);
    return rol;
  }

  async updateRol(id: number, data: { nombre?: string; descripcion?: string; estado?: string }) {
    const rol = await this.findRolById(id);
    
    if (rol.esSistema) {
      throw new BadRequestException('No se puede modificar un rol del sistema');
    }
    
    Object.assign(rol, data);
    return this.rolRepo.save(rol);
  }

  async deleteRol(id: number) {
    const rol = await this.findRolById(id);
    
    if (rol.esSistema) {
      throw new BadRequestException('No se puede eliminar un rol del sistema');
    }
    
    return this.rolRepo.softRemove(rol);
  }

  async restoreRol(id: number) {
    const rol = await this.rolRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!rol) {
      throw new NotFoundException(`Rol ${id} not found`);
    }

    if (!rol.deletedAt) {
      throw new BadRequestException('El rol no está eliminado');
    }

    if (rol.esSistema) {
      throw new BadRequestException('No se puede restaurar un rol del sistema');
    }

    return this.rolRepo.recover(rol);
  }

  // ==================== ASIGNAR PERMISOS A ROLES ====================
  
  // RF06: Asignar permiso a rol
  async assignPermisoToRol(rolId: number, permisoId: number) {
    const rol = await this.findRolById(rolId);
    const permiso = await this.findPermisoById(permisoId);
    
    // Verificar si ya existe
    const existing = await this.rolPermisoRepo.findOne({
      where: { rolId, permisoId },
    });
    
    if (existing) {
      throw new BadRequestException('El permiso ya está asignado a este rol');
    }
    
    const rolPermiso = this.rolPermisoRepo.create({ rolId, permisoId });
    await this.rolPermisoRepo.save(rolPermiso);
    
    // Invalidar caché de permisos para usuarios con este rol
    await this.redisService.invalidateRolePermissions(rolId);
    
    return { message: `Permiso ${permiso.clave} asignado al rol ${rol.nombre}` };
  }

  // RF06: Remover permiso de rol
  async removePermisoFromRol(rolId: number, permisoId: number) {
    const rolPermiso = await this.rolPermisoRepo.findOne({
      where: { rolId, permisoId },
    });
    
    if (!rolPermiso) {
      throw new NotFoundException('El permiso no está asignado a este rol');
    }
    
    await this.rolPermisoRepo.remove(rolPermiso);
    
    // Invalidar caché de permisos para usuarios con este rol
    await this.redisService.invalidateRolePermissions(rolId);
    
    return { message: 'Permiso removido del rol' };
  }

  // RF06: Obtener permisos de un rol
  async getPermisosByRol(rolId: number) {
    const rol = await this.findRolById(rolId);
    
    const rolPermisos = await this.rolPermisoRepo.find({
      where: { rolId },
      relations: ['permiso'],
    });
    
    return rolPermisos.map(rp => rp.permiso);
  }

  // ==================== ASIGNAR PERMISOS A USUARIOS ====================
  
  // RF07: Asignar permiso directo a usuario
  async assignPermisoToUsuario(usuarioId: number, permisoId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} not found`);
    
    const permiso = await this.findPermisoById(permisoId);
    
    // Verificar si ya existe
    const existing = await this.usuarioPermisoRepo.findOne({
      where: { usuarioId, permisoId },
    });
    
    if (existing) {
      throw new BadRequestException('El permiso ya está asignado a este usuario');
    }
    
    const usuarioPermiso = this.usuarioPermisoRepo.create({ usuarioId, permisoId });
    await this.usuarioPermisoRepo.save(usuarioPermiso);
    
    // Invalidar caché de permisos para este usuario
    await this.redisService.invalidateUserPermissions(usuarioId);
    
    return { message: `Permiso ${permiso.clave} asignado al usuario` };
  }

  // RF07: Remover permiso directo de usuario
  async removePermisoFromUsuario(usuarioId: number, permisoId: number) {
    const usuarioPermiso = await this.usuarioPermisoRepo.findOne({
      where: { usuarioId, permisoId },
    });
    
    if (!usuarioPermiso) {
      throw new NotFoundException('El permiso no está asignado a este usuario');
    }
    
    await this.usuarioPermisoRepo.remove(usuarioPermiso);
    
    // Invalidar caché de permisos para este usuario
    await this.redisService.invalidateUserPermissions(usuarioId);
    
    return { message: 'Permiso removido del usuario' };
  }

  // RF07: Obtener permisos directos de un usuario
  async getPermisosDirectosByUsuario(usuarioId: number) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} not found`);
    
    const usuarioPermisos = await this.usuarioPermisoRepo.find({
      where: { usuarioId },
      relations: ['permiso'],
    });
    
    return usuarioPermisos.map(up => up.permiso);
  }

  // ==================== PERMISOS EFECTIVOS ====================
  
  // RF08: Calcular permisos efectivos de un usuario
  async getPermisosEfectivos(usuarioId: number): Promise<string[]> {
    const usuario = await this.usuarioRepo.findOne({ 
      where: { id: usuarioId },
      relations: ['rol'],
    });
    
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} not found`);
    
    const permisosSet = new Set<string>();
    
    // 1. Permisos del rol
    const permisosRol = await this.getPermisosByRol(usuario.rolId);
    permisosRol.forEach(p => permisosSet.add(p.clave));
    
    // 2. Permisos directos del usuario
    const permisosDirectos = await this.getPermisosDirectosByUsuario(usuarioId);
    permisosDirectos.forEach(p => permisosSet.add(p.clave));
    
    return Array.from(permisosSet);
  }

  // RF08: Verificar si un usuario tiene un permiso específico
  async hasPermiso(usuarioId: number, permisoClave: string): Promise<boolean> {
    const permisosEfectivos = await this.getPermisosEfectivos(usuarioId);
    return permisosEfectivos.includes(permisoClave);
  }

  // ==================== ASIGNACIÓN MASIVA ====================
  
  // Asignar múltiples permisos a un rol
  async assignMultiplePermisosToRol(rolId: number, permisoIds: number[]) {
    const rol = await this.findRolById(rolId);
    const results = [];
    
    for (const permisoId of permisoIds) {
      try {
        await this.assignPermisoToRol(rolId, permisoId);
        results.push({ permisoId, success: true });
      } catch (error) {
        results.push({ permisoId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Sincronizar permisos de un rol (reemplazar todos)
  async syncPermisosRol(rolId: number, permisoIds: number[]) {
    const rol = await this.findRolById(rolId);
    
    // Eliminar todos los permisos actuales
    await this.rolPermisoRepo.delete({ rolId });
    
    // Asignar los nuevos
    for (const permisoId of permisoIds) {
      await this.rolPermisoRepo.save({ rolId, permisoId });
    }
    
    // Invalidar caché de permisos para usuarios con este rol
    await this.redisService.invalidateRolePermissions(rolId);
    
    return { message: `Permisos sincronizados para el rol ${rol.nombre}` };
  }
  // Sincronizar permisos de un usuario (reemplazar todos los permisos directos)
  async syncUserPermissions(usuarioId: number, permisoIds: number[]) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} not found`);
    
    // Eliminar todos los permisos directos actuales
    await this.usuarioPermisoRepo.delete({ usuarioId });
    
    // Asignar los nuevos
    for (const permisoId of permisoIds) {
      await this.usuarioPermisoRepo.save({ usuarioId, permisoId });
    }
    
    // Invalidar caché de permisos para este usuario
    await this.redisService.invalidateUserPermissions(usuarioId);
    
    return { message: `Permisos sincronizados para el usuario` };
  }
}
