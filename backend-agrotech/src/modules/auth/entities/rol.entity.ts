import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

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
}
