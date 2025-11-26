import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Usuario } from './usuario.entity';
import { RolPermiso } from '../../auth/entities/rol-permiso.entity';

@Entity('roles')
export class Rol extends BaseEntity {
  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ name: 'es_sistema', default: false })
  esSistema: boolean;

  @Column({ default: 'activo' })
  estado: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @OneToMany(() => RolPermiso, (rolPermiso) => rolPermiso.rol)
  rolPermisos: RolPermiso[];
}
