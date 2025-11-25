import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EPA_TipoCultivoWiki } from './epa-tipo-cultivo-wiki.entity';

@Entity('tipos_cultivos_wiki')
export class TipoCultivoWiki extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @OneToMany(() => EPA_TipoCultivoWiki, (relation) => relation.tipoCultivoWiki)
  epaTipoCultivos: EPA_TipoCultivoWiki[];
}
