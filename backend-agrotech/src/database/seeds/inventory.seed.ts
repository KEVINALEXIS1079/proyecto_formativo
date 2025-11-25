import { DataSource } from 'typeorm';

// Inventory
import { Categoria } from '../../modules/inventory/entities/categoria.entity';
import { Proveedor } from '../../modules/inventory/entities/proveedor.entity';
import { Almacen } from '../../modules/inventory/entities/almacen.entity';
import { Insumo } from '../../modules/inventory/entities/insumo.entity';
import { MovimientoInsumo } from '../../modules/inventory/entities/movimiento-insumo.entity';

export async function seedInventory(dataSource: DataSource) {
  console.log('Ejecutando seed de datos de inventario...');

  const categoriaRepo = dataSource.getRepository(Categoria);
  const proveedorRepo = dataSource.getRepository(Proveedor);
  const almacenRepo = dataSource.getRepository(Almacen);
  const insumoRepo = dataSource.getRepository(Insumo);
  const movimientoInsumoRepo = dataSource.getRepository(MovimientoInsumo);

  // Categorías
  console.log('  Creando categorías...');
  const categoriasData = [
    { nombre: 'Fertilizantes', descripcion: 'Productos para fertilización' },
    { nombre: 'Pesticidas', descripcion: 'Productos para control de plagas' },
    { nombre: 'Herramientas', descripcion: 'Herramientas agrícolas' },
  ];

  let categoriasCreadas = 0;
  const categoriasIds: number[] = [];
  for (const catData of categoriasData) {
    const existing = await categoriaRepo.findOne({ where: { nombre: catData.nombre } });
    if (!existing) {
      const categoria = categoriaRepo.create(catData);
      const saved = await categoriaRepo.save(categoria);
      categoriasIds.push(saved.id);
      categoriasCreadas++;
    } else {
      categoriasIds.push(existing.id);
    }
  }
  if (categoriasCreadas > 0) {
    console.log(`    ${categoriasCreadas} categorías creadas`);
  }

  // Proveedores
  console.log('  Creando proveedores...');
  const proveedoresData = [
    { nombre: 'AgroQuímicos S.A.', contacto: 'contacto@agroquimicos.com', telefono: '3001234567' },
    { nombre: 'Semillas del Valle', contacto: 'ventas@semillasvalle.com', telefono: '3019876543' },
  ];

  let proveedoresCreados = 0;
  const proveedoresIds: number[] = [];
  for (const provData of proveedoresData) {
    const existing = await proveedorRepo.findOne({ where: { nombre: provData.nombre } });
    if (!existing) {
      const proveedor = proveedorRepo.create(provData);
      const saved = await proveedorRepo.save(proveedor);
      proveedoresIds.push(saved.id);
      proveedoresCreados++;
    } else {
      proveedoresIds.push(existing.id);
    }
  }
  if (proveedoresCreados > 0) {
    console.log(`    ${proveedoresCreados} proveedores creados`);
  }

  // Almacenes
  console.log('  Creando almacenes...');
  const almacenesData = [
    { nombre: 'Almacén Principal', ubicacion: 'Finca Norte', capacidadM3: 100 },
    { nombre: 'Almacén Secundario', ubicacion: 'Finca Sur', capacidadM3: 50 },
  ];

  let almacenesCreados = 0;
  const almacenesIds: number[] = [];
  for (const almData of almacenesData) {
    const existing = await almacenRepo.findOne({ where: { nombre: almData.nombre } });
    if (!existing) {
      const almacen = almacenRepo.create(almData);
      const saved = await almacenRepo.save(almacen);
      almacenesIds.push(saved.id);
      almacenesCreados++;
    } else {
      almacenesIds.push(existing.id);
    }
  }
  if (almacenesCreados > 0) {
    console.log(`    ${almacenesCreados} almacenes creados`);
  }

  // Insumos
  console.log('  Creando insumos...');
  const insumosData = [
    {
      nombre: 'Fertilizante NPK 20-20-20',
      descripcion: 'Fertilizante balanceado para cultivos',
      tipoMateria: 'solido',
      unidadUso: 'gramos',
      stockUso: 50000,
      precioUnitarioUso: 0.6,
      presentacionUnidad: 'kg',
      presentacionCantidad: 25,
      almacenId: almacenesIds[0],
      proveedorId: proveedoresIds[0],
      categoriaId: categoriasIds[0],
      creadoPorUsuarioId: 1,
    },
    {
      nombre: 'Pesticida contra plagas',
      descripcion: 'Insecticida para control de plagas',
      tipoMateria: 'liquido',
      unidadUso: 'cm³',
      stockUso: 20000,
      precioUnitarioUso: 1.25,
      presentacionUnidad: 'litros',
      presentacionCantidad: 20,
      almacenId: almacenesIds[0],
      proveedorId: proveedoresIds[0],
      categoriaId: categoriasIds[1],
      creadoPorUsuarioId: 1,
    },
  ];

  let insumosCreados = 0;
  const insumoIds: number[] = [];
  for (const insumoData of insumosData) {
    const existing = await insumoRepo.findOne({ where: { nombre: insumoData.nombre } });
    if (!existing) {
      const insumo = insumoRepo.create(insumoData);
      const saved = await insumoRepo.save(insumo);
      insumoIds.push(saved.id);
      insumosCreados++;
    } else {
      insumoIds.push(existing.id);
    }
  }
  if (insumosCreados > 0) {
    console.log(`    ${insumosCreados} insumos creados`);
  }

  // Movimientos de insumos
  console.log('  Creando movimientos de insumos...');
  const movimientosData = [
    {
      insumoId: insumoIds[0],
      tipo: 'INGRESO',
      cantidadUso: 50000,
      costoUnitarioUso: 0.6,
      costoTotal: 30000,
      valorInventarioResultante: 30000,
      descripcion: 'Compra inicial de fertilizante sólido',
      usuarioId: 1,
    },
    {
      insumoId: insumoIds[1],
      tipo: 'INGRESO',
      cantidadUso: 20000,
      costoUnitarioUso: 1.25,
      costoTotal: 25000,
      valorInventarioResultante: 25000,
      descripcion: 'Compra inicial de pesticida líquido',
      usuarioId: 1,
    },
  ];

  let movimientosCreados = 0;
  for (const movData of movimientosData) {
    const existing = await movimientoInsumoRepo.findOne({
      where: {
        insumoId: movData.insumoId,
        tipo: movData.tipo,
      },
    });
    if (!existing) {
      const movimiento = movimientoInsumoRepo.create(movData);
      await movimientoInsumoRepo.save(movimiento);
      movimientosCreados++;
    }
  }
  if (movimientosCreados > 0) {
    console.log(`    ${movimientosCreados} movimientos de insumos creados`);
  }

  console.log('Seed de datos de inventario completado\n');
  return { categoriasIds, proveedoresIds, almacenesIds, insumoIds };
}