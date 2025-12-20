import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('tipos_formacion')
export class TipoFormacion extends BaseEntity {
    @Column({ unique: true, length: 50 })
    codigo: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ default: true })
    activo: boolean;

    @Column({ type: 'int', default: 0 })
    orden: number;
}
