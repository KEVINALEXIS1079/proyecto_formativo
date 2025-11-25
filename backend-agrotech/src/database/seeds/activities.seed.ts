import { DataSource } from 'typeorm';
import { Actividad } from '../../modules/activities/entities/actividad.entity';
import { Cultivo } from '../../modules/cultivos/entities/cultivo.entity';
import { Usuario } from '../../modules/users/entities/usuario.entity';

export async function seedActivities(dataSource: DataSource) {
  console.log('Ejecutando seed de actividades...');

  const actividadRepo = dataSource.getRepository(Actividad);
  const cultivoRepo = dataSource.getRepository(Cultivo);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // Obtener IDs de cultivos y usuarios existentes
  const cultivos = await cultivoRepo.find({ order: { id: 'ASC' } });
  const usuarios = await usuarioRepo.find({ order: { id: 'ASC' } });

  if (cultivos.length === 0 || usuarios.length === 0) {
    console.log('  No se encontraron cultivos o usuarios. Omitiendo seed de actividades.');
    return [];
  }

  const actividadesData = [
    {
      nombre: 'Siembra inicial de tomate',
      tipo: 'CREACION',
      subtipo: 'SIEMBRA',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-03-01'),
      descripcion: 'Siembra de semillas de tomate cherry en el sublote asignado',
      horasActividad: 4,
      precioHoraActividad: 15000,
      costoManoObra: 60000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Riego semanal',
      tipo: 'MANTENIMIENTO',
      subtipo: 'RIEGO',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-03-08'),
      descripcion: 'Riego programado para mantener humedad óptima',
      horasActividad: 2,
      precioHoraActividad: 12000,
      costoManoObra: 24000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Fertilización orgánica',
      tipo: 'MANTENIMIENTO',
      subtipo: 'FERTILIZACION',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-03-15'),
      descripcion: 'Aplicación de fertilizante orgánico para promover crecimiento',
      horasActividad: 3,
      precioHoraActividad: 14000,
      costoManoObra: 42000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Control de plagas',
      tipo: 'MANTENIMIENTO',
      subtipo: 'CONTROL_PLAGAS',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-03-22'),
      descripcion: 'Aplicación de productos naturales para control de plagas',
      horasActividad: 2.5,
      precioHoraActividad: 13000,
      costoManoObra: 32500,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Poda formativa',
      tipo: 'MANTENIMIENTO',
      subtipo: 'PODA',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-04-01'),
      descripcion: 'Poda para mejorar la estructura de las plantas',
      horasActividad: 3.5,
      precioHoraActividad: 16000,
      costoManoObra: 56000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Cosecha de tomate',
      tipo: 'FINALIZACION',
      subtipo: 'COSECHA',
      cultivoId: cultivos[0].id,
      fecha: new Date('2024-05-15'),
      descripcion: 'Cosecha manual de tomates maduros',
      horasActividad: 6,
      precioHoraActividad: 18000,
      costoManoObra: 108000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Siembra de maíz',
      tipo: 'CREACION',
      subtipo: 'SIEMBRA',
      cultivoId: cultivos[1]?.id || cultivos[0].id,
      fecha: new Date('2024-03-15'),
      descripcion: 'Siembra directa de semillas de maíz dulce',
      horasActividad: 5,
      precioHoraActividad: 15000,
      costoManoObra: 75000,
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Riego de maíz',
      tipo: 'MANTENIMIENTO',
      subtipo: 'RIEGO',
      cultivoId: cultivos[1]?.id || cultivos[0].id,
      fecha: new Date('2024-03-20'),
      descripcion: 'Riego inicial para germinación',
      horasActividad: 2,
      precioHoraActividad: 12000,
      costoManoObra: 24000,
      creadoPorUsuarioId: usuarios[0].id,
    },
  ];

  let actividadesCreadas = 0;
  const actividadIds: number[] = [];
  for (const actividadData of actividadesData) {
    const existing = await actividadRepo.findOne({
      where: {
        nombre: actividadData.nombre,
        cultivoId: actividadData.cultivoId,
        fecha: actividadData.fecha,
      }
    });
    if (!existing) {
      const actividad = actividadRepo.create(actividadData);
      const saved = await actividadRepo.save(actividad);
      actividadIds.push(saved.id);
      actividadesCreadas++;
    } else {
      actividadIds.push(existing.id);
    }
  }

  if (actividadesCreadas > 0) {
    console.log(`  ${actividadesCreadas} actividades creadas`);
  } else {
    console.log('  ℹActividades ya existen, omitiendo...');
  }

  console.log('Seed de actividades completado\n');
  return actividadIds;
}