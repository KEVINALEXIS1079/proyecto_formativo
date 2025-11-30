import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('wiki_tipo_epa')
export class TipoEpa extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ default: 'enfermedad' })
  tipoEpaEnum: string; // 'enfermedad' | 'plaga' | 'arvense'
}
