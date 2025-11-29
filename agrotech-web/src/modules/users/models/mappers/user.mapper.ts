import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

export const UserMapper = {
  toDomain: (dto: any): User => {
    return {
      id: dto.id,
      nombre: dto.nombre,
      apellido: dto.apellido,
      identificacion: dto.identificacion,
      idFicha: dto.idFicha,
      telefono: dto.telefono,
      correo: dto.correo,
      estado: dto.estado,
      rolId: dto.rolId,
      rol: dto.rol,
      avatarUrl: dto.avatarUrl,
      lastLoginAt: dto.lastLoginAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toCreateDto: (user: Partial<User> & { password?: string }): CreateUserDto => {
    return {
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      identificacion: user.identificacion || '',
      idFicha: user.idFicha,
      telefono: user.telefono,
      correo: user.correo || '',
      password: user.password,
      rolId: user.rolId,
      estado: user.estado,
    };
  },

  toUpdateDto: (user: Partial<User>): UpdateUserDto => {
    return {
      nombre: user.nombre,
      apellido: user.apellido,
      identificacion: user.identificacion,
      idFicha: user.idFicha,
      telefono: user.telefono,
      correo: user.correo,
      rolId: user.rolId,
      estado: user.estado,
      avatarUrl: user.avatarUrl,
    };
  },
};
