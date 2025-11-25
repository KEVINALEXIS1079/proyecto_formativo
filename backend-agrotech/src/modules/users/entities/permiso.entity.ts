import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RolPermiso } from '../../auth/entities/rol-permiso.entity';
import { UsuarioPermiso } from './usuario-permiso.entity';

@Entity('permisos')
export class Permiso extends BaseEntity {
  @Column()
  modulo: string;

  @Column()
  accion: string;

  @Column()
  clave: string;

  @OneToMany(() => RolPermiso, (rolPermiso) => rolPermiso.permiso)
  rolPermisos: RolPermiso[];

  @OneToMany(() => UsuarioPermiso, (usuarioPermiso) => usuarioPermiso.permiso)
  usuarioPermisos: UsuarioPermiso[];
}
