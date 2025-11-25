import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EPA_TipoCultivoWiki } from './epa-tipo-cultivo-wiki.entity';

@Entity('epas')
export class EPA extends BaseEntity {
  @Column()
  nombre: string;

  @Column()
  tipoEpa: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
  sintomas: string;

  @Column({ type: 'text', nullable: true })
  manejoYControl: string;

  @Column('simple-array', { nullable: true })
  mesesProbables: number[];

  @Column('simple-array', { nullable: true })
  temporadas: string[];

  @Column({ type: 'text', nullable: true })
  notasEstacionalidad: string;

  @Column('simple-array', { nullable: true })
  fotosSintomas: string[];

  @Column('simple-array', { nullable: true })
  fotosGenerales: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column()
  creadoPorUsuarioId: number;

  @OneToMany(() => EPA_TipoCultivoWiki, (relation) => relation.epa)
  epaTipoCultivos: EPA_TipoCultivoWiki[];
}
