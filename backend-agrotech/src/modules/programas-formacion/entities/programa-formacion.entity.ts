import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Usuario } from '../../users/entities/usuario.entity';

@Entity('programas_formacion')
export class ProgramaFormacion extends BaseEntity {
    @Column({ unique: true, length: 20 })
    numeroFicha: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 50 })
    tipo: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'date', nullable: true })
    fechaInicio: Date;

    @Column({ type: 'date', nullable: true })
    fechaFin: Date;

    @Column({ default: 'ACTIVO' })
    estado: string;

    @Column({ type: 'int', default: 0 })
    cantidadAprendices: number;

    @OneToMany(() => Usuario, (usuario) => usuario.programaFormacion)
    usuarios: Usuario[];
}
