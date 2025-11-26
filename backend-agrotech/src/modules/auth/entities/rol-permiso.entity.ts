import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Rol } from '../../users/entities/rol.entity';
import { Permiso } from '../../users/entities/permiso.entity';

@Entity('rol_permisos')
export class RolPermiso extends BaseEntity {
  @Column()
  rolId: number;

  @Column()
  permisoId: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: 'permisoId' })
  permiso: Permiso;
}
