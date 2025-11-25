import { DataSource } from 'typeorm';

// Cultivos
import { Cultivo } from '../../modules/cultivos/entities/cultivo.entity';
// Geo
import { Lote } from '../../modules/geo/entities/lote.entity';
import { SubLote } from '../../modules/geo/entities/sublote.entity';

export async function seedCultivos(dataSource: DataSource) {
  console.log('Ejecutando seed de cultivos...');

  const cultivoRepo = dataSource.getRepository(Cultivo);
  const loteRepo = dataSource.getRepository(Lote);
  const subloteRepo = dataSource.getRepository(SubLote);

  // Obtener IDs de lotes y sublotes existentes
  const lotes = await loteRepo.find({ order: { id: 'ASC' } });
  const sublotes = await subloteRepo.find({ order: { id: 'ASC' } });

  if (lotes.length === 0 || sublotes.length === 0) {
    console.log('  No se encontraron lotes o sublotes. Omitiendo seed de cultivos.');
    return [];
  }

  const cultivosData = [
    {
      nombreCultivo: 'Tomate',
      tipoCultivo: 'Hortaliza',
      descripcion: 'Cultivo de tomate cherry',
      subLoteId: sublotes[0].id,
      fechaSiembra: new Date('2024-03-01'),
      estado: 'activo',
    },
    {
      nombreCultivo: 'Maíz',
      tipoCultivo: 'Cereal',
      descripcion: 'Cultivo de maíz dulce',
      subLoteId: sublotes[1]?.id || sublotes[0].id,
      fechaSiembra: new Date('2024-03-15'),
      estado: 'activo',
    },
    {
      nombreCultivo: 'Papa',
      tipoCultivo: 'Tubérculo',
      descripcion: 'Cultivo de papa blanca',
      loteId: lotes[1]?.id || lotes[0].id,
      fechaSiembra: new Date('2024-02-20'),
      estado: 'activo',
    },
  ];

  let cultivosCreados = 0;
  const cultivoIds: number[] = [];
  for (const cultivoData of cultivosData) {
    const existing = await cultivoRepo.findOne({
      where: {
        nombreCultivo: cultivoData.nombreCultivo,
        subLoteId: cultivoData.subLoteId,
        loteId: cultivoData.loteId
      }
    });
    if (!existing) {
      const cultivo = cultivoRepo.create(cultivoData);
      const saved = await cultivoRepo.save(cultivo);
      cultivoIds.push(saved.id);
      cultivosCreados++;
    } else {
      cultivoIds.push(existing.id);
    }
  }

  if (cultivosCreados > 0) {
    console.log(`    ${cultivosCreados} cultivos creados`);
  }

  console.log('Seed de cultivos completado\n');
  return cultivoIds;
}