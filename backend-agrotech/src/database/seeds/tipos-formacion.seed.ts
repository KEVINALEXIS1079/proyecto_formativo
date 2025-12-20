import { DataSource } from 'typeorm';
import { TipoFormacion } from '../../modules/programas-formacion/entities/tipo-formacion.entity';

export async function seedTiposFormacion(dataSource: DataSource) {
    const tipoRepo = dataSource.getRepository(TipoFormacion);

    const tipos = [
        {
            codigo: 'TECNICO',
            nombre: 'Técnico',
            descripcion: 'Formación técnica profesional',
            orden: 1,
            activo: true,
        },
        {
            codigo: 'TECNOLOGO',
            nombre: 'Tecnólogo',
            descripcion: 'Formación tecnológica',
            orden: 2,
            activo: true,
        },
        {
            codigo: 'COMPLEMENTARIA',
            nombre: 'Complementaria',
            descripcion: 'Formación complementaria',
            orden: 3,
            activo: true,
        },
        {
            codigo: 'CURSO',
            nombre: 'Curso',
            descripcion: 'Curso corto o especializado',
            orden: 4,
            activo: true,
        },
    ];

    for (const tipo of tipos) {
        const existing = await tipoRepo.findOne({ where: { codigo: tipo.codigo } });
        if (!existing) {
            await tipoRepo.save(tipoRepo.create(tipo));
            console.log(`✅ Tipo de formación creado: ${tipo.nombre}`);
        }
    }
}
