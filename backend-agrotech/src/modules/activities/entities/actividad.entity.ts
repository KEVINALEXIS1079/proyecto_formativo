import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { Cultivo } from '../../geo/entities/cultivo.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { ActividadResponsable } from './actividad-responsable.entity';
import { ActividadServicio } from './actividad-servicio.entity';
import { ActividadEvidencia } from './actividad-evidencia.entity';
import { ActividadInsumoUso } from './actividad-insumo-uso.entity';

@Entity('actividades')
export class Actividad extends BaseEntity {
  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column()
  subtipo: string;

  @Column({ nullable: true })
  loteId: number;

  @Column({ nullable: true })
  subLoteId: number;

  @Column({ nullable: true })
  cultivoId: number;

  @Column()
  fecha: Date;

  @Column('float')
  horasActividad: number;

  @Column('float')
  precioHoraActividad: number;

  @Column('float')
  costoManoObra: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'creado_por_usuario_id' })
  creadoPorUsuarioId: number;

  // Alias para retrocompatibilidad
  get costoMO(): number {
    return this.costoManoObra;
  }

  @ManyToOne(() => Lote)
  @JoinColumn({ name: 'loteId' })
  lote: Lote;

  @ManyToOne(() => SubLote)
  @JoinColumn({ name: 'subLoteId' })
  subLote: SubLote;

  @ManyToOne(() => Cultivo)
  @JoinColumn({ name: 'cultivoId' })
  cultivo: Cultivo;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creadoPorUsuarioId' })
  creadoPorUsuario: Usuario;

  @OneToMany(() => ActividadResponsable, (responsable) => responsable.actividad)
  responsables: ActividadResponsable[];

  @OneToMany(() => ActividadServicio, (servicio) => servicio.actividad)
  servicios: ActividadServicio[];

  @OneToMany(() => ActividadEvidencia, (evidencia) => evidencia.actividad)
  evidencias: ActividadEvidencia[];

  @OneToMany(() => ActividadInsumoUso, (insumoUso) => insumoUso.actividad)
  insumosUso: ActividadInsumoUso[];
}
