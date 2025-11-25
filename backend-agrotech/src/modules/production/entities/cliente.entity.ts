import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Venta } from './venta.entity';

@Entity('clientes')
export class Cliente extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ unique: true })
  identificacion: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];
}
