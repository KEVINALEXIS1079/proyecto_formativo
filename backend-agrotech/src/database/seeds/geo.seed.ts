import { DataSource } from 'typeorm';

// Geo
import { Lote } from '../../modules/geo/entities/lote.entity';
import { SubLote } from '../../modules/geo/entities/sublote.entity';

export async function seedGeo(dataSource: DataSource) {
  console.log('Ejecutando seed de datos geoespaciales...');

  const loteRepo = dataSource.getRepository(Lote);
  const subLoteRepo = dataSource.getRepository(SubLote);

  // Lotes
  console.log('  Creando lotes...');
  const lotesData = [
    {
      nombre: 'Finca Norte',
      geom: JSON.stringify({
        type: 'Polygon',
        coordinates: [[
          [-74.1, 4.6],
          [-74.0, 4.6],
          [-74.0, 4.7],
          [-74.1, 4.7],
          [-74.1, 4.6]
        ]]
      }),
      areaM2: 5000,
      areaHa: 0.5,
      descripcion: 'Lote principal en la zona norte',
      estado: 'activo',
    },
    {
      nombre: 'Finca Sur',
      geom: JSON.stringify({
        type: 'Polygon',
        coordinates: [[
          [-74.2, 4.5],
          [-74.1, 4.5],
          [-74.1, 4.6],
          [-74.2, 4.6],
          [-74.2, 4.5]
        ]]
      }),
      areaM2: 3000,
      areaHa: 0.3,
      descripcion: 'Lote secundario en la zona sur',
      estado: 'activo',
    },
  ];

  let lotesCreados = 0;
  const loteIds: number[] = [];
  for (const loteData of lotesData) {
    const existing = await loteRepo.findOne({ where: { nombre: loteData.nombre } });
    if (!existing) {
      const lote = loteRepo.create(loteData);
      const saved = await loteRepo.save(lote);
      loteIds.push(saved.id);
      lotesCreados++;
    } else {
      loteIds.push(existing.id);
    }
  }
  if (lotesCreados > 0) {
    console.log(`    ${lotesCreados} lotes creados`);
  }

  // Sublotes
  console.log('  Creando sublotes...');
  const sublotesData = [
    {
      nombre: 'Norte A',
      loteId: loteIds[0],
      geom: JSON.stringify({
        type: 'Polygon',
        coordinates: [[
          [-74.1, 4.6],
          [-74.05, 4.6],
          [-74.05, 4.65],
          [-74.1, 4.65],
          [-74.1, 4.6]
        ]]
      }),
      areaM2: 2500,
      areaHa: 0.25,
      descripcion: 'Sublote A del lote Norte',
    },
    {
      nombre: 'Norte B',
      loteId: loteIds[0],
      geom: JSON.stringify({
        type: 'Polygon',
        coordinates: [[
          [-74.05, 4.6],
          [-74.0, 4.6],
          [-74.0, 4.65],
          [-74.05, 4.65],
          [-74.05, 4.6]
        ]]
      }),
      areaM2: 2500,
      areaHa: 0.25,
      descripcion: 'Sublote B del lote Norte',
    },
  ];

  let sublotesCreados = 0;
  const subloteIds: number[] = [];
  for (const subloteData of sublotesData) {
    const existing = await subLoteRepo.findOne({ where: { nombre: subloteData.nombre } });
    if (!existing) {
      const sublote = subLoteRepo.create(subloteData);
      const saved = await subLoteRepo.save(sublote);
      subloteIds.push(saved.id);
      sublotesCreados++;
    } else {
      subloteIds.push(existing.id);
    }
  }
  if (sublotesCreados > 0) {
    console.log(`    ${sublotesCreados} sublotes creados`);
  }

  console.log('Seed de datos geoespaciales completado\n');
  return { loteIds, subloteIds };
}