import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { Permiso } from '../../users/entities/permiso.entity';

@Entity('usuario_permisos')
export class UsuarioPermiso extends BaseEntity {
  @Column()
  usuarioId: number;

  @Column()
  permisoId: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: 'permisoId' })
  permiso: Permiso;
}
