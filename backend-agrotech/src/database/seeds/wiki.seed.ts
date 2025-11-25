import { DataSource } from 'typeorm';
import { TipoCultivoWiki } from '../../modules/wiki/entities/tipo-cultivo-wiki.entity';
import { EPA } from '../../modules/wiki/entities/epa.entity';
import { EPA_TipoCultivoWiki } from '../../modules/wiki/entities/epa-tipo-cultivo-wiki.entity';
import { Usuario } from '../../modules/users/entities/usuario.entity';

export async function seedWiki(dataSource: DataSource) {
  console.log('Ejecutando seed de wiki...');

  const tipoCultivoRepo = dataSource.getRepository(TipoCultivoWiki);
  const epaRepo = dataSource.getRepository(EPA);
  const epaTipoRepo = dataSource.getRepository(EPA_TipoCultivoWiki);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // Obtener usuarios existentes
  const usuarios = await usuarioRepo.find({ order: { id: 'ASC' } });

  if (usuarios.length === 0) {
    console.log('  No se encontraron usuarios. Omitiendo seed de wiki.');
    return [];
  }

  // Tipos de cultivo wiki
  const tiposCultivoData = [
    {
      nombre: 'Café',
      descripcion: 'Cultivo de café arábica y robusta, principal producto de exportación',
    },
    {
      nombre: 'Tomate',
      descripcion: 'Cultivo de tomate para consumo fresco y procesamiento industrial',
    },
    {
      nombre: 'Maíz',
      descripcion: 'Cultivo de maíz para alimentación humana y animal',
    },
  ];

  let tiposCreados = 0;
  const tipoCultivoIds: number[] = [];
  for (const tipoData of tiposCultivoData) {
    const existing = await tipoCultivoRepo.findOne({ where: { nombre: tipoData.nombre } });
    if (!existing) {
      const tipo = tipoCultivoRepo.create(tipoData);
      const saved = await tipoCultivoRepo.save(tipo);
      tipoCultivoIds.push(saved.id);
      tiposCreados++;
    } else {
      tipoCultivoIds.push(existing.id);
    }
  }

  if (tiposCreados > 0) {
    console.log(`  ${tiposCreados} tipos de cultivo wiki creados`);
  } else {
    console.log('  ℹTipos de cultivo wiki ya existen, omitiendo...');
  }

  // EPAs comunes
  const epasData = [
    {
      nombre: 'Mildiu del tomate',
      tipoEpa: 'Enfermedad',
      descripcion: 'Enfermedad fúngica causada por Phytophthora infestans',
      sintomas: 'Manchas irregulares en hojas, tallos y frutos con halo amarillo',
      manejoYControl: 'Aplicar fungicidas sistémicos, mejorar drenaje, rotación de cultivos',
      mesesProbables: [3, 4, 5, 9, 10, 11],
      temporadas: ['Invierno', 'Primavera'],
      notasEstacionalidad: 'Más común en épocas de lluvia intensa',
      tags: ['fúngica', 'hojas', 'frutos'],
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Áfidos en tomate',
      tipoEpa: 'Plaga',
      descripcion: 'Insectos chupadores que afectan el crecimiento de las plantas',
      sintomas: 'Deformación de hojas, presencia de melaza, hormigas asociadas',
      manejoYControl: 'Aplicar insecticidas sistémicos, introducir depredadores naturales',
      mesesProbables: [1, 2, 3, 4, 11, 12],
      temporadas: ['Verano', 'Otoño'],
      notasEstacionalidad: 'Prolifera en climas cálidos y secos',
      tags: ['insectos', 'chupadores', 'hojas'],
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Royas del maíz',
      tipoEpa: 'Enfermedad',
      descripcion: 'Enfermedad causada por hongos del género Puccinia',
      sintomas: 'Pústulas anaranjadas en hojas, reducción del rendimiento',
      manejoYControl: 'Uso de variedades resistentes, fungicidas preventivos',
      mesesProbables: [4, 5, 6, 7],
      temporadas: ['Primavera', 'Verano'],
      notasEstacionalidad: 'Favorecida por humedad relativa alta',
      tags: ['fúngica', 'hojas', 'pústulas'],
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Gusano cogollero del maíz',
      tipoEpa: 'Plaga',
      descripcion: 'Larva de Spodoptera frugiperda que daña las hojas',
      sintomas: 'Perforaciones irregulares en hojas, presencia de excrementos',
      manejoYControl: 'Aplicación de insecticidas biológicos, monitoreo constante',
      mesesProbables: [5, 6, 7, 8, 9],
      temporadas: ['Primavera', 'Verano', 'Otoño'],
      notasEstacionalidad: 'Activo durante todo el ciclo del cultivo',
      tags: ['insectos', 'hojas', 'larvas'],
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Roya del café',
      tipoEpa: 'Enfermedad',
      descripcion: 'Enfermedad fúngica Hemileia vastatrix',
      sintomas: 'Manchas amarillas en hojas con pústulas anaranjadas en el envés',
      manejoYControl: 'Uso de variedades resistentes, control químico preventivo',
      mesesProbables: [9, 10, 11, 12, 1],
      temporadas: ['Otoño', 'Invierno'],
      notasEstacionalidad: 'Más severa en altitudes medias',
      tags: ['fúngica', 'hojas', 'roya'],
      creadoPorUsuarioId: usuarios[0].id,
    },
    {
      nombre: 'Broca del café',
      tipoEpa: 'Plaga',
      descripcion: 'Insecto Hypothenemus hampei que perfora los granos',
      sintomas: 'Perforaciones en cerezas, presencia de serrín',
      manejoYControl: 'Recolección sanitaria, uso de trampas, control biológico',
      mesesProbables: [1, 2, 3, 4, 11, 12],
      temporadas: ['Invierno', 'Primavera'],
      notasEstacionalidad: 'Presente todo el año en zonas cafeteras',
      tags: ['insectos', 'granos', 'perforaciones'],
      creadoPorUsuarioId: usuarios[0].id,
    },
  ];

  let epasCreadas = 0;
  const epaIds: number[] = [];
  for (const epaData of epasData) {
    const existing = await epaRepo.findOne({ where: { nombre: epaData.nombre } });
    if (!existing) {
      const epa = epaRepo.create(epaData);
      const saved = await epaRepo.save(epa);
      epaIds.push(saved.id);
      epasCreadas++;
    } else {
      epaIds.push(existing.id);
    }
  }

  if (epasCreadas > 0) {
    console.log(`  ${epasCreadas} EPAs creadas`);
  } else {
    console.log('  ℹEPAs ya existen, omitiendo...');
  }

  // Relaciones EPA - Tipo Cultivo
  const relacionesData = [
    { epaId: epaIds[0], tipoCultivoWikiId: tipoCultivoIds[1] }, // Mildiu - Tomate
    { epaId: epaIds[1], tipoCultivoWikiId: tipoCultivoIds[1] }, // Áfidos - Tomate
    { epaId: epaIds[2], tipoCultivoWikiId: tipoCultivoIds[2] }, // Royas - Maíz
    { epaId: epaIds[3], tipoCultivoWikiId: tipoCultivoIds[2] }, // Gusano cogollero - Maíz
    { epaId: epaIds[4], tipoCultivoWikiId: tipoCultivoIds[0] }, // Roya - Café
    { epaId: epaIds[5], tipoCultivoWikiId: tipoCultivoIds[0] }, // Broca - Café
  ];

  let relacionesCreadas = 0;
  for (const relacionData of relacionesData) {
    const existing = await epaTipoRepo.findOne({
      where: {
        epaId: relacionData.epaId,
        tipoCultivoWikiId: relacionData.tipoCultivoWikiId,
      }
    });
    if (!existing) {
      await epaTipoRepo.save(relacionData);
      relacionesCreadas++;
    }
  }

  if (relacionesCreadas > 0) {
    console.log(`  ${relacionesCreadas} relaciones EPA-Tipo Cultivo creadas`);
  } else {
    console.log('  ℹRelaciones EPA-Tipo Cultivo ya existen, omitiendo...');
  }

  console.log('Seed de wiki completado\n');
  return { tipoCultivoIds, epaIds };
}