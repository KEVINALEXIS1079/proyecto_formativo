import { DataSource } from 'typeorm';
import { ProgramaFormacion } from '../../modules/programas-formacion/entities/programa-formacion.entity';

export async function seedProgramasFormacion(dataSource: DataSource) {
    const repo = dataSource.getRepository(ProgramaFormacion);

    console.log('Ejecutando seed de programas de formación...');

    const programasData = [
        {
            numeroFicha: '2925484',
            nombre: 'Análisis y Desarrollo de Software (ADSO)',
            tipo: 'TECNOLOGO',
            descripcion: 'Programa enfocado en el desarrollo de aplicaciones web y móviles siguiendo las mejores prácticas de la industria.',
            estado: 'ACTIVO',
            cantidadAprendices: 30,
        },
        {
            numeroFicha: '2800123',
            nombre: 'Gestión de Empresas Agropecuarias',
            tipo: 'TECNICO',
            descripcion: 'Técnico en administración y optimización de recursos en el sector agropecuario.',
            estado: 'ACTIVO',
            cantidadAprendices: 25,
        },
        {
            numeroFicha: '2700555',
            nombre: 'Mantenimiento de Maquinaria Agrícola',
            tipo: 'TECNOLOGO',
            descripcion: 'Especialización en el mantenimiento preventivo y correctivo de tractores y equipos de campo.',
            estado: 'SUSPENDIDO',
            cantidadAprendices: 15,
        },
        {
            numeroFicha: '3001010',
            nombre: 'Cultivos Hidropónicos Avanzados',
            tipo: 'COMPLEMENTARIA',
            descripcion: 'Curso corto para la implementación de sistemas de riego y nutrición en hidroponía.',
            estado: 'ACTIVO',
            cantidadAprendices: 20,
        },
    ];

    let creados = 0;
    for (const data of programasData) {
        const existing = await repo.findOne({ where: { numeroFicha: data.numeroFicha } });
        if (!existing) {
            const programa = repo.create(data);
            await repo.save(programa);
            creados++;
        }
    }

    console.log(`Seed de programas completado: ${creados} creados\n`);
}
