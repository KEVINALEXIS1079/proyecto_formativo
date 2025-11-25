import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Permiso } from './permiso.entity';

@Entity('usuarios_permisos')
export class UsuarioPermiso {
  @PrimaryColumn()
  usuarioId: number;

  @PrimaryColumn()
  permisoId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioPermisos)
  usuario: Usuario;

  @ManyToOne(() => Permiso, (permiso) => permiso.usuarioPermisos)
  permiso: Permiso;
}
