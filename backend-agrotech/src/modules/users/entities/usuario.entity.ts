import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Rol } from './rol.entity';
import { UsuarioPermiso } from './usuario-permiso.entity';
import { EmailCode } from '../../auth/entities/email-code.entity';

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  identificacion: string;

  @Column({ nullable: true })
  idFicha: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ default: 'ACTIVO' })
  estado: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  rolId: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @OneToMany(() => UsuarioPermiso, (usuarioPermiso) => usuarioPermiso.usuario)
  usuarioPermisos: UsuarioPermiso[];

  @OneToMany(() => EmailCode, (emailCode) => emailCode.usuario)
  emailCodes: EmailCode[];
}
