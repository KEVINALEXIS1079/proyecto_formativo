import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Lote } from '../../geo/entities/lote.entity';
import { SubLote } from '../../geo/entities/sublote.entity';
import { Cultivo } from '../../cultivos/entities/cultivo.entity';
import { Usuario } from '../../users/entities/usuario.entity';
import { ActividadResponsable } from './actividad-responsable.entity';
import { ActividadServicio } from './actividad-servicio.entity';
import { ActividadEvidencia } from './actividad-evidencia.entity';
import { ActividadInsumoUso } from './actividad-insumo-uso.entity';

import { ActividadInsumoReserva } from './actividad-insumo-reserva.entity';
import { UsoHerramienta } from '../../inventory/entities/uso-herramienta.entity';
import { ActividadHerramienta } from './actividad-herramienta.entity';

@Entity('actividades')
export class Actividad extends BaseEntity {
  // ... existing columns ...

  @OneToMany(() => ActividadInsumoReserva, (reserva) => reserva.actividad)
  insumosReserva: ActividadInsumoReserva[];

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

  @Column('float', { nullable: true, default: 0 })
  horasActividad: number;

  @Column('float', { nullable: true, default: 0 })
  precioHoraActividad: number;

  @Column('float', { nullable: true, default: 0 })
  costoManoObra: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: 'Pendiente' })
  estado: string; // 'Pendiente' | 'Finalizada'

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
  @JoinColumn({ name: 'creado_por_usuario_id' })
  creadoPorUsuario: Usuario;

  @OneToMany(() => ActividadResponsable, (responsable) => responsable.actividad, {
    cascade: true,
  })
  responsables: ActividadResponsable[];

  @OneToMany(() => ActividadServicio, (servicio) => servicio.actividad, {
    cascade: true,
  })
  servicios: ActividadServicio[];

  @OneToMany(() => ActividadEvidencia, (evidencia) => evidencia.actividad, {
    cascade: true,
  })
  evidencias: ActividadEvidencia[];

  @OneToMany(() => ActividadInsumoUso, (insumoUso) => insumoUso.actividad)
  insumosUso: ActividadInsumoUso[];

  @OneToMany(() => UsoHerramienta, (uso) => uso.actividad)
  usosHerramientas: UsoHerramienta[];

  @OneToMany(() => ActividadHerramienta, (h) => h.actividad, { cascade: true })
  herramientas: ActividadHerramienta[];

  // Campos específicos para Cosecha
  @Column('int', { nullable: true })
  cantidadPlantas: number; // "Cuantos palos se cosecharon"

  @Column('float', { nullable: true })
  kgRecolectados: number; // "Cuanto fue la cantidad que salio"

  @Column({ nullable: true })
  productoAgroId: number;

  @ManyToOne('ProductoAgro')
  @JoinColumn({ name: 'productoAgroId' })
  productoAgro: any;
}
