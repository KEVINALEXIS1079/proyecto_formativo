import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Auth/Users
import { Usuario } from '../../modules/users/entities/usuario.entity';

// Geo
import { Lote } from '../../modules/geo/entities/lote.entity';
import { SubLote } from '../../modules/geo/entities/sublote.entity';
import { Cultivo } from '../../modules/geo/entities/cultivo.entity';

// Inventory
import { Categoria } from '../../modules/inventory/entities/categoria.entity';
import { Proveedor } from '../../modules/inventory/entities/proveedor.entity';
import { Almacen } from '../../modules/inventory/entities/almacen.entity';
import { Insumo } from '../../modules/inventory/entities/insumo.entity';
import { MovimientoInsumo } from '../../modules/inventory/entities/movimiento-insumo.entity';

// Activities
import { Actividad } from '../../modules/activities/entities/actividad.entity';
import { ActividadResponsable } from '../../modules/activities/entities/actividad-responsable.entity';
import { ActividadServicio } from '../../modules/activities/entities/actividad-servicio.entity';
import { ActividadInsumo } from '../../modules/activities/entities/actividad-insumo.entity';
import { ActividadInsumoUso } from '../../modules/activities/entities/actividad-insumo-uso.entity';
import { ActividadEvidencia } from '../../modules/activities/entities/actividad-evidencia.entity';

// IoT
import { TipoSensor } from '../../modules/iot/entities/tipo-sensor.entity';
import { Sensor } from '../../modules/iot/entities/sensor.entity';
import { SensorLectura } from '../../modules/iot/entities/sensor-lectura.entity';

// Production
import { ProductoAgro } from '../../modules/production/entities/producto-agro.entity';
import { LoteProduccion } from '../../modules/production/entities/lote-produccion.entity';
import { MovimientoProduccion } from '../../modules/production/entities/movimiento-produccion.entity';
import { Cliente } from '../../modules/production/entities/cliente.entity';
import { Venta } from '../../modules/production/entities/venta.entity';
import { VentaDetalle } from '../../modules/production/entities/venta-detalle.entity';
import { Pago } from '../../modules/production/entities/pago.entity';
import { Factura } from '../../modules/production/entities/factura.entity';

// Wiki
import { TipoCultivoWiki } from '../../modules/wiki/entities/tipo-cultivo-wiki.entity';
import { EPA } from '../../modules/wiki/entities/epa.entity';
import { EPA_TipoCultivoWiki } from '../../modules/wiki/entities/epa-tipo-cultivo-wiki.entity';

export async function seedPrueba1(dataSource: DataSource) {
  console.log('Ejecutando seed de datos de prueba comprehensivos...');

  // Repositorios
  const usuarioRepo = dataSource.getRepository(Usuario);
  const loteRepo = dataSource.getRepository(Lote);
  const subLoteRepo = dataSource.getRepository(SubLote);
  const cultivoRepo = dataSource.getRepository(Cultivo);
  const categoriaRepo = dataSource.getRepository(Categoria);
  const proveedorRepo = dataSource.getRepository(Proveedor);
  const almacenRepo = dataSource.getRepository(Almacen);
  const insumoRepo = dataSource.getRepository(Insumo);
  const movimientoInsumoRepo = dataSource.getRepository(MovimientoInsumo);
  const actividadRepo = dataSource.getRepository(Actividad);
  const actividadResponsableRepo = dataSource.getRepository(ActividadResponsable);
  const actividadServicioRepo = dataSource.getRepository(ActividadServicio);
  const actividadInsumoRepo = dataSource.getRepository(ActividadInsumo);
  const actividadInsumoUsoRepo = dataSource.getRepository(ActividadInsumoUso);
  const actividadEvidenciaRepo = dataSource.getRepository(ActividadEvidencia);
  const tipoSensorRepo = dataSource.getRepository(TipoSensor);
  const sensorRepo = dataSource.getRepository(Sensor);
  const sensorLecturaRepo = dataSource.getRepository(SensorLectura);
  const productoAgroRepo = dataSource.getRepository(ProductoAgro);
  const loteProduccionRepo = dataSource.getRepository(LoteProduccion);
  const movimientoProduccionRepo = dataSource.getRepository(MovimientoProduccion);
  const clienteRepo = dataSource.getRepository(Cliente);
  const ventaRepo = dataSource.getRepository(Venta);
  const ventaDetalleRepo = dataSource.getRepository(VentaDetalle);
  const pagoRepo = dataSource.getRepository(Pago);
  const facturaRepo = dataSource.getRepository(Factura);
  const tipoCultivoWikiRepo = dataSource.getRepository(TipoCultivoWiki);
  const ePARepo = dataSource.getRepository(EPA);
  const ePATipoCultivoWikiRepo = dataSource.getRepository(EPA_TipoCultivoWiki);

  // Usuarios adicionales
  console.log('  Creando usuarios adicionales...');
  const usuariosData = [
    {
      nombre: 'Juan',
      apellido: 'Pérez',
      identificacion: '111111111',
      correo: 'juan.perez@sena.edu.co',
      passwordHash: await bcrypt.hash('password123', 10),
      rolId: 2, // Instructor
      estado: 'activo',
      emailVerifiedAt: new Date(),
    },
    {
      nombre: 'María',
      apellido: 'García',
      identificacion: '222222222',
      correo: 'maria.garcia@sena.edu.co',
      passwordHash: await bcrypt.hash('password123', 10),
      rolId: 3, // Aprendiz
      estado: 'activo',
      emailVerifiedAt: new Date(),
    },
    {
      nombre: 'Carlos',
      apellido: 'López',
      identificacion: '333333333',
      correo: 'carlos.lopez@sena.edu.co',
      passwordHash: await bcrypt.hash('password123', 10),
      rolId: 4, // Pasante
      estado: 'activo',
      emailVerifiedAt: new Date(),
    },
  ];

  let usuariosCreados = 0;
  for (const userData of usuariosData) {
    const existing = await usuarioRepo.findOne({ where: { correo: userData.correo } });
    if (!existing) {
      const usuario = usuarioRepo.create(userData);
      await usuarioRepo.save(usuario);
      usuariosCreados++;
    }
  }
  if (usuariosCreados > 0) {
    console.log(`    ${usuariosCreados} usuarios creados`);
  }
  console.log('Sección usuarios completada.');
  
  // Geo: Lotes
  console.log('  Creando lotes...');
  const lotesData = [
    {
      nombre: 'Finca Norte',
      areaM2: 5000,
      areaHa: 0.5,
      descripcion: 'Lote principal en la zona norte',
      estado: 'activo',
    },
    {
      nombre: 'Finca Sur',
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

  // Geo: Sublotes
  console.log('  Creando sublotes...');
  const sublotesData = [
    {
      nombre: 'Norte A',
      loteId: loteIds[0],
      areaM2: 2500,
      areaHa: 0.25,
      descripcion: 'Sublote A del lote Norte',
    },
    {
      nombre: 'Norte B',
      loteId: loteIds[0],
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

  // Geo: Cultivos
  console.log('  Creando cultivos...');
  const cultivosData = [
    {
      nombreCultivo: 'Tomate',
      tipoCultivo: 'Hortaliza',
      descripcion: 'Cultivo de tomate cherry',
      subLoteId: subloteIds[0],
      fechaSiembra: new Date('2024-03-01'),
      estado: 'activo',
    },
    {
      nombreCultivo: 'Maíz',
      tipoCultivo: 'Cereal',
      descripcion: 'Cultivo de maíz dulce',
      subLoteId: subloteIds[1],
      fechaSiembra: new Date('2024-03-15'),
      estado: 'activo',
    },
    {
      nombreCultivo: 'Papa',
      tipoCultivo: 'Tubérculo',
      descripcion: 'Cultivo de papa blanca',
      loteId: loteIds[1],
      fechaSiembra: new Date('2024-02-20'),
      estado: 'activo',
    },
  ];

  let cultivosCreados = 0;
  const cultivoIds: number[] = [];
  for (const cultivoData of cultivosData) {
    const existing = await cultivoRepo.findOne({ where: { nombreCultivo: cultivoData.nombreCultivo, subLoteId: cultivoData.subLoteId, loteId: cultivoData.loteId } });
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
  console.log('Sección geo completada.');
  
  // Inventory: Categorías
  console.log('  Creando categorías de inventario...');
  const categoriasData = [
    { nombre: 'Fertilizantes', descripcion: 'Productos para fertilización' },
    { nombre: 'Pesticidas', descripcion: 'Productos para control de plagas' },
    { nombre: 'Herramientas', descripcion: 'Herramientas agrícolas' },
  ];

  let categoriasCreadas = 0;
  const categoriaIds: number[] = [];
  for (const catData of categoriasData) {
    const existing = await categoriaRepo.findOne({ where: { nombre: catData.nombre } });
    if (!existing) {
      const categoria = categoriaRepo.create(catData);
      const saved = await categoriaRepo.save(categoria);
      categoriaIds.push(saved.id);
      categoriasCreadas++;
    } else {
      categoriaIds.push(existing.id);
    }
  }
  if (categoriasCreadas > 0) {
    console.log(`    ${categoriasCreadas} categorías creadas`);
  }

  // Inventory: Proveedores
  console.log('  Creando proveedores...');
  const proveedoresData = [
    { nombre: 'AgroQuímicos S.A.', contacto: 'contacto@agroquimicos.com', telefono: '3001234567' },
    { nombre: 'Semillas del Valle', contacto: 'ventas@semillasvalle.com', telefono: '3019876543' },
  ];

  let proveedoresCreados = 0;
  const proveedorIds: number[] = [];
  for (const provData of proveedoresData) {
    const existing = await proveedorRepo.findOne({ where: { nombre: provData.nombre } });
    if (!existing) {
      const proveedor = proveedorRepo.create(provData);
      const saved = await proveedorRepo.save(proveedor);
      proveedorIds.push(saved.id);
      proveedoresCreados++;
    } else {
      proveedorIds.push(existing.id);
    }
  }
  if (proveedoresCreados > 0) {
    console.log(`    ${proveedoresCreados} proveedores creados`);
  }

  // Inventory: Almacenes
  console.log('  Creando almacenes...');
  const almacenesData = [
    { nombre: 'Almacén Principal', ubicacion: 'Finca Norte', capacidadM3: 100 },
    { nombre: 'Almacén Secundario', ubicacion: 'Finca Sur', capacidadM3: 50 },
  ];

  let almacenesCreados = 0;
  const almacenIds: number[] = [];
  for (const almData of almacenesData) {
    const existing = await almacenRepo.findOne({ where: { nombre: almData.nombre } });
    if (!existing) {
      const almacen = almacenRepo.create(almData);
      const saved = await almacenRepo.save(almacen);
      almacenIds.push(saved.id);
      almacenesCreados++;
    } else {
      almacenIds.push(existing.id);
    }
  }
  if (almacenesCreados > 0) {
    console.log(`    ${almacenesCreados} almacenes creados`);
  }

  // Inventory: Insumos
  console.log('  Creando insumos...');
  const insumosData = [
    {
      nombre: 'Fertilizante NPK 20-20-20',
      descripcion: 'Fertilizante balanceado',
      categoriaId: categoriaIds[0],
      proveedorId: proveedorIds[0],
      unidadMedida: 'kg',
      precioUnitario: 15000,
      stockMinimo: 10,
      stockActual: 50,
      almacenId: almacenIds[0],
      presentacionTipo: 'Saco',
      presentacionCantidad: 25,
      presentacionUnidad: 'kg',
      unidadUso: 'kg/ha',
      tipoMateria: 'Químico',
      factorConversionUso: 1,
      stockPresentacion: 2,
      stockUso: 50,
      precioUnitarioPresentacion: 375000,
      precioUnitarioUso: 15000,
      valorInventario: 750000,
      fechaRegistro: new Date('2024-02-01'),
    },
    {
      nombre: 'Pesticida contra plagas',
      descripcion: 'Insecticida para control de plagas',
      categoriaId: categoriaIds[1],
      proveedorId: proveedorIds[0],
      unidadMedida: 'litros',
      precioUnitario: 25000,
      stockMinimo: 5,
      stockActual: 20,
      almacenId: almacenIds[0],
      presentacionTipo: 'Bidón',
      presentacionCantidad: 20,
      presentacionUnidad: 'litros',
      unidadUso: 'litros/ha',
      tipoMateria: 'Químico',
      factorConversionUso: 1,
      stockPresentacion: 1,
      stockUso: 20,
      precioUnitarioPresentacion: 500000,
      precioUnitarioUso: 25000,
      valorInventario: 500000,
      fechaRegistro: new Date('2024-02-01'),
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

  // Inventory: Movimientos de insumos
  console.log('  Creando movimientos de insumos...');
  const movimientosData = [
    {
      insumoId: insumoIds[0],
      tipo: 'entrada',
      cantidad: 50,
      precioUnitario: 15000,
      almacenId: almacenIds[0],
      fecha: new Date('2024-02-15'),
      descripcion: 'Compra inicial de fertilizante',
      cantidadPresentacion: 2,
      cantidadUso: 50,
      costoUnitarioPresentacion: 375000,
      costoUnitarioUso: 15000,
      costoTotal: 750000,
      valorInventarioResultante: 750000,
      usuarioId: 1,
    },
    {
      insumoId: insumoIds[1],
      tipo: 'entrada',
      cantidad: 20,
      precioUnitario: 25000,
      almacenId: almacenIds[0],
      fecha: new Date('2024-02-20'),
      descripcion: 'Compra inicial de pesticida',
      cantidadPresentacion: 1,
      cantidadUso: 20,
      costoUnitarioPresentacion: 500000,
      costoUnitarioUso: 25000,
      costoTotal: 500000,
      valorInventarioResultante: 500000,
      usuarioId: 1,
    },
  ];

  let movimientosCreados = 0;
  for (const movData of movimientosData) {
    // Para evitar duplicados, verificar por insumoId y tipo
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
  console.log('Sección inventory completada.');
  
  // Activities: Actividades
  console.log('  Creando actividades...');
  const actividadesData = [
    {
      nombre: 'Siembra de tomate',
      descripcion: 'Siembra de semillas de tomate en sublote Norte A',
      cultivoId: cultivoIds[0],
      fechaInicio: new Date('2024-03-01'),
      fechaFin: new Date('2024-03-01'),
      costoMO: 50000,
      costoInsumos: 15000,
      costoTotal: 65000,
      estado: 'completada',
      tipo: 'Siembra',
      subtipo: 'Manual',
      fecha: new Date('2024-03-01'),
      horasActividad: 8,
      precioHoraActividad: 6250,
      costoManoObra: 50000,
      creadoPorUsuarioId: 1,
    },
    {
      nombre: 'Aplicación de fertilizante',
      descripcion: 'Aplicación de fertilizante NPK al cultivo de maíz',
      cultivoId: cultivoIds[1],
      fechaInicio: new Date('2024-03-20'),
      fechaFin: new Date('2024-03-20'),
      costoMO: 30000,
      costoInsumos: 22500,
      costoTotal: 52500,
      estado: 'completada',
      tipo: 'Fertilización',
      subtipo: 'Aplicación',
      fecha: new Date('2024-03-20'),
      horasActividad: 6,
      precioHoraActividad: 5000,
      costoManoObra: 30000,
      creadoPorUsuarioId: 1,
    },
  ];

  let actividadesCreadas = 0;
  const actividadIds: number[] = [];
  for (const actData of actividadesData) {
    const existing = await actividadRepo.findOne({ where: { nombre: actData.nombre, cultivoId: actData.cultivoId } });
    if (!existing) {
      const actividad = actividadRepo.create(actData);
      const saved = await actividadRepo.save(actividad);
      actividadIds.push(saved.id);
      actividadesCreadas++;
    } else {
      actividadIds.push(existing.id);
    }
  }
  if (actividadesCreadas > 0) {
    console.log(`    ${actividadesCreadas} actividades creadas`);
  }

  // Activities: Responsables (obtener usuarios creados)
  const usuarios = await usuarioRepo.find({ where: { estado: 'activo' } });
  const instructor = usuarios.find(u => u.rolId === 2);
  const aprendiz = usuarios.find(u => u.rolId === 3);

  console.log('  Creando responsables de actividades...');
  const responsablesData = [
    { actividadId: actividadIds[0], usuarioId: instructor?.id || 1, rol: 'Instructor', horas: 8, precioHora: 5000, costo: 40000 },
    { actividadId: actividadIds[0], usuarioId: aprendiz?.id || 2, rol: 'Aprendiz', horas: 6, precioHora: 3000, costo: 18000 },
    { actividadId: actividadIds[1], usuarioId: instructor?.id || 1, rol: 'Instructor', horas: 6, precioHora: 5000, costo: 30000 },
  ];

  let responsablesCreados = 0;
  for (const respData of responsablesData) {
    const existing = await actividadResponsableRepo.findOne({
      where: { actividadId: respData.actividadId, usuarioId: respData.usuarioId },
    });
    if (!existing) {
      const responsable = actividadResponsableRepo.create(respData);
      await actividadResponsableRepo.save(responsable);
      responsablesCreados++;
    }
  }
  if (responsablesCreados > 0) {
    console.log(`    ${responsablesCreados} responsables asignados`);
  }

  // Activities: Servicios
  console.log('  Creando servicios de actividades...');
  const serviciosData = [
    { actividadId: actividadIds[0], nombreServicio: 'Preparación del suelo', horas: 4, precioHora: 5000, costo: 20000 },
    { actividadId: actividadIds[0], nombreServicio: 'Siembra de semillas', horas: 6, precioHora: 5000, costo: 30000 },
    { actividadId: actividadIds[1], nombreServicio: 'Aplicación de fertilizante', horas: 6, precioHora: 5000, costo: 30000 },
  ];

  let serviciosCreados = 0;
  for (const servData of serviciosData) {
    const existing = await actividadServicioRepo.findOne({
      where: { actividadId: servData.actividadId, nombreServicio: servData.nombreServicio },
    });
    if (!existing) {
      const servicio = actividadServicioRepo.create(servData);
      await actividadServicioRepo.save(servicio);
      serviciosCreados++;
    }
  }
  if (serviciosCreados > 0) {
    console.log(`    ${serviciosCreados} servicios creados`);
  }

  // Activities: Insumos en actividades
  console.log('  Creando insumos en actividades...');
  const actividadInsumosData = [
    {
      actividadId: actividadIds[0],
      insumoId: insumoIds[0],
      cantidadPlaneada: 10,
      cantidadUsada: 10,
      unidad: 'kg',
      costoUnitario: 15000,
      costoTotal: 150000,
      fechaUso: new Date('2024-03-01'),
    },
    {
      actividadId: actividadIds[1],
      insumoId: insumoIds[0],
      cantidadPlaneada: 15,
      cantidadUsada: 15,
      unidad: 'kg',
      costoUnitario: 15000,
      costoTotal: 225000,
      fechaUso: new Date('2024-03-20'),
    },
  ];

  let actividadInsumosCreados = 0;
  const actividadInsumoIds: number[] = [];
  for (const actInsData of actividadInsumosData) {
    const existing = await actividadInsumoRepo.findOne({
      where: { actividadId: actInsData.actividadId, insumoId: actInsData.insumoId },
    });
    if (!existing) {
      const actInsumo = actividadInsumoRepo.create(actInsData);
      const saved = await actividadInsumoRepo.save(actInsumo);
      actividadInsumoIds.push(saved.id);
      actividadInsumosCreados++;
    } else {
      actividadInsumoIds.push(existing.id);
    }
  }
  if (actividadInsumosCreados > 0) {
    console.log(`    ${actividadInsumosCreados} insumos asignados a actividades`);
  }

  // Activities: Uso de insumos
  console.log('  Creando uso de insumos en actividades...');
  const usoInsumosData = [
    {
      actividadId: actividadIds[0],
      insumoId: insumoIds[0],
      cantidadUso: 10,
      cantidadUsada: 10,
      unidad: 'kg',
      costoUnitarioUso: 15000,
      costoTotal: 150000,
      fechaUso: new Date('2024-03-01'),
    },
    {
      actividadId: actividadIds[1],
      insumoId: insumoIds[0],
      cantidadUso: 15,
      cantidadUsada: 15,
      unidad: 'kg',
      costoUnitarioUso: 15000,
      costoTotal: 225000,
      fechaUso: new Date('2024-03-20'),
    },
  ];

  let usosCreados = 0;
  for (const usoData of usoInsumosData) {
    const existing = await actividadInsumoUsoRepo.findOne({
      where: { actividadId: usoData.actividadId, insumoId: usoData.insumoId },
    });
    if (!existing) {
      const uso = actividadInsumoUsoRepo.create(usoData);
      await actividadInsumoUsoRepo.save(uso);
      usosCreados++;
    }
  }
  if (usosCreados > 0) {
    console.log(`    ${usosCreados} usos de insumos registrados`);
  }

  // Activities: Evidencias
  console.log('  Creando evidencias de actividades...');
  const evidenciasData = [
    { actividadId: actividadIds[0], imagenes: ['https://example.com/foto-siembra.jpg'], descripcion: 'Foto de la siembra' },
    { actividadId: actividadIds[1], imagenes: ['https://example.com/video-fertilizante.mp4'], descripcion: 'Video de aplicación de fertilizante' },
  ];

  let evidenciasCreadas = 0;
  for (const eviData of evidenciasData) {
    const existing = await actividadEvidenciaRepo.findOne({
      where: { actividadId: eviData.actividadId, descripcion: eviData.descripcion },
    });
    if (!existing) {
      const evidencia = actividadEvidenciaRepo.create(eviData);
      await actividadEvidenciaRepo.save(evidencia);
      evidenciasCreadas++;
    }
  }
  if (evidenciasCreadas > 0) {
    console.log(`    ${evidenciasCreadas} evidencias creadas`);
  }
  console.log('Sección activities completada.');
  
  // IoT: Tipos de sensores
  console.log('  Creando tipos de sensores...');
  const tiposSensorData = [
    { nombre: 'Temperatura', unidad: '°C', descripcion: 'Sensor de temperatura ambiente' },
    { nombre: 'Humedad', unidad: '%', descripcion: 'Sensor de humedad relativa' },
    { nombre: 'pH del suelo', unidad: 'pH', descripcion: 'Sensor de pH del suelo' },
  ];

  let tiposSensorCreados = 0;
  const tipoSensorIds: number[] = [];
  for (const tipoData of tiposSensorData) {
    const existing = await tipoSensorRepo.findOne({ where: { nombre: tipoData.nombre } });
    if (!existing) {
      const tipoSensor = tipoSensorRepo.create(tipoData);
      const saved = await tipoSensorRepo.save(tipoSensor);
      tipoSensorIds.push(saved.id);
      tiposSensorCreados++;
    } else {
      tipoSensorIds.push(existing.id);
    }
  }
  if (tiposSensorCreados > 0) {
    console.log(`    ${tiposSensorCreados} tipos de sensores creados`);
  }

  // IoT: Sensores
  console.log('  Creando sensores...');
  const sensoresData = [
    { nombre: 'Sensor Temp Norte A', tipoSensorId: tipoSensorIds[0], cultivoId: cultivoIds[0], protocolo: 'MQTT', ubicacion: 'Centro del sublote', estado: 'activo' },
    { nombre: 'Sensor Humedad Norte A', tipoSensorId: tipoSensorIds[1], cultivoId: cultivoIds[0], protocolo: 'MQTT', ubicacion: 'Centro del sublote', estado: 'activo' },
    { nombre: 'Sensor Temp Maíz', tipoSensorId: tipoSensorIds[0], cultivoId: cultivoIds[1], protocolo: 'MQTT', ubicacion: 'Centro del sublote', estado: 'activo' },
  ];

  let sensoresCreados = 0;
  const sensorIds: number[] = [];
  for (const sensorData of sensoresData) {
    const existing = await sensorRepo.findOne({ where: { nombre: sensorData.nombre } });
    if (!existing) {
      const sensor = sensorRepo.create(sensorData);
      const saved = await sensorRepo.save(sensor);
      sensorIds.push(saved.id);
      sensoresCreados++;
    } else {
      sensorIds.push(existing.id);
    }
  }
  if (sensoresCreados > 0) {
    console.log(`    ${sensoresCreados} sensores creados`);
  }

  // IoT: Lecturas de sensores
  console.log('  Creando lecturas de sensores...');
  const lecturasData = [
    { sensorId: sensorIds[0], valor: 25.5, fecha: new Date('2024-11-20T08:00:00') },
    { sensorId: sensorIds[0], valor: 26.0, fecha: new Date('2024-11-20T12:00:00') },
    { sensorId: sensorIds[1], valor: 65.0, fecha: new Date('2024-11-20T08:00:00') },
    { sensorId: sensorIds[1], valor: 70.0, fecha: new Date('2024-11-20T12:00:00') },
    { sensorId: sensorIds[2], valor: 24.0, fecha: new Date('2024-11-20T08:00:00') },
  ];

  let lecturasCreadas = 0;
  for (const lecData of lecturasData) {
    const existing = await sensorLecturaRepo.findOne({
      where: { sensorId: lecData.sensorId, fecha: lecData.fecha },
    });
    if (!existing) {
      const lectura = sensorLecturaRepo.create(lecData);
      await sensorLecturaRepo.save(lectura);
      lecturasCreadas++;
    }
  }
  if (lecturasCreadas > 0) {
    console.log(`    ${lecturasCreadas} lecturas de sensores creadas`);
  }
  console.log('Sección IoT completada.');
  
  // Production: Productos agro
  console.log('  Creando productos agro...');
  const productosData = [
    { nombre: 'Tomate cherry', descripcion: 'Tomate cherry fresco', unidadBase: 'kg' },
    { nombre: 'Maíz dulce', descripcion: 'Maíz dulce en mazorca', unidadBase: 'kg' },
    { nombre: 'Papa blanca', descripcion: 'Papa blanca de calidad', unidadBase: 'kg' },
  ];

  let productosCreados = 0;
  const productoIds: number[] = [];
  for (const prodData of productosData) {
    const existing = await productoAgroRepo.findOne({ where: { nombre: prodData.nombre } });
    if (!existing) {
      const producto = productoAgroRepo.create(prodData);
      const saved = await productoAgroRepo.save(producto);
      productoIds.push(saved.id);
      productosCreados++;
    } else {
      productoIds.push(existing.id);
    }
  }
  if (productosCreados > 0) {
    console.log(`    ${productosCreados} productos agro creados`);
  }

  // Production: Lotes de producción
  console.log('  Creando lotes de producción...');
  const lotesProdData = [
    {
      productoAgroId: productoIds[0],
      cultivoId: cultivoIds[0],
      cantidadKg: 200,
      stockDisponibleKg: 200,
      costoUnitarioKg: 1200,
      costoTotal: 240000,
      precioSugeridoKg: 1500,
      fechaProduccion: new Date('2024-06-15'),
      fechaVencimiento: new Date('2024-07-15'),
    },
    {
      productoAgroId: productoIds[1],
      cultivoId: cultivoIds[1],
      cantidadKg: 150,
      stockDisponibleKg: 150,
      costoUnitarioKg: 1000,
      costoTotal: 150000,
      precioSugeridoKg: 1300,
      fechaProduccion: new Date('2024-07-01'),
      fechaVencimiento: new Date('2024-08-01'),
    },
  ];

  let lotesProdCreados = 0;
  const loteProdIds: number[] = [];
  for (const loteProdData of lotesProdData) {
    const existing = await loteProduccionRepo.findOne({
      where: { productoAgroId: loteProdData.productoAgroId, cultivoId: loteProdData.cultivoId },
    });
    if (!existing) {
      const loteProd = loteProduccionRepo.create(loteProdData);
      const saved = await loteProduccionRepo.save(loteProd);
      loteProdIds.push(saved.id);
      lotesProdCreados++;
    } else {
      loteProdIds.push(existing.id);
    }
  }
  if (lotesProdCreados > 0) {
    console.log(`    ${lotesProdCreados} lotes de producción creados`);
  }

  // Production: Movimientos de producción
  console.log('  Creando movimientos de producción...');
  const usuarioActivo = await usuarioRepo.findOne({ where: { estado: 'activo' } });
  const movimientosProdData = [
    {
      loteProduccionId: loteProdIds[0],
      tipo: 'cosecha',
      cantidadKg: 200,
      costoUnitarioKg: 1200,
      costoTotal: 240000,
      descripcion: 'Cosecha inicial de tomate',
      usuarioId: usuarioActivo?.id ?? 1,
    },
    {
      loteProduccionId: loteProdIds[1],
      tipo: 'cosecha',
      cantidadKg: 150,
      costoUnitarioKg: 1000,
      costoTotal: 150000,
      descripcion: 'Cosecha inicial de maíz',
      usuarioId: usuarioActivo?.id ?? 1,
    },
  ];

  let movimientosProdCreados = 0;
  for (const movProdData of movimientosProdData) {
    const existing = await movimientoProduccionRepo.findOne({
      where: { loteProduccionId: movProdData.loteProduccionId, tipo: movProdData.tipo },
    });
    if (!existing) {
      const movimiento = movimientoProduccionRepo.create(movProdData);
      await movimientoProduccionRepo.save(movimiento);
      movimientosProdCreados++;
    }
  }
  if (movimientosProdCreados > 0) {
    console.log(`    ${movimientosProdCreados} movimientos de producción creados`);
  }

  // Production: Clientes
  console.log('  Creando clientes...');
  const clientesData = [
    { nombre: 'Supermercado XYZ', identificacion: '900123456', telefono: '3024567890', email: 'compras@supermercadoxyz.com', direccion: 'Calle 123 #45-67' },
    { nombre: 'Restaurante El Sabor', identificacion: '800987654', telefono: '3035678901', email: 'admin@elsabor.com', direccion: 'Carrera 89 #12-34' },
  ];

  let clientesCreados = 0;
  const clienteIds: number[] = [];
  for (const cliData of clientesData) {
    const existing = await clienteRepo.findOne({ where: { nombre: cliData.nombre } });
    if (!existing) {
      const cliente = clienteRepo.create(cliData);
      const saved = await clienteRepo.save(cliente);
      clienteIds.push(saved.id);
      clientesCreados++;
    } else {
      clienteIds.push(existing.id);
    }
  }
  if (clientesCreados > 0) {
    console.log(`    ${clientesCreados} clientes creados`);
  }

  // Production: Ventas
  console.log('  Creando ventas...');
  const ventasData = [
    {
      clienteId: clienteIds[0],
      fecha: new Date('2024-06-20'),
      subtotal: 400000,
      impuestos: 0,
      descuento: 0,
      total: 400000,
      estado: 'completada',
      usuarioId: usuarioActivo?.id ?? 1,
    },
    {
      clienteId: clienteIds[1],
      fecha: new Date('2024-07-05'),
      subtotal: 75000,
      impuestos: 0,
      descuento: 0,
      total: 75000,
      estado: 'completada',
      usuarioId: usuarioActivo?.id ?? 1,
    },
  ];

  let ventasCreadas = 0;
  const ventaIds: number[] = [];
  for (const ventaData of ventasData) {
    const existing = await ventaRepo.findOne({
      where: { clienteId: ventaData.clienteId, fecha: ventaData.fecha },
    });
    if (!existing) {
      const venta = ventaRepo.create(ventaData);
      const saved = await ventaRepo.save(venta);
      ventaIds.push(saved.id);
      ventasCreadas++;
    } else {
      ventaIds.push(existing.id);
    }
  }
  if (ventasCreadas > 0) {
    console.log(`    ${ventasCreadas} ventas creadas`);
  }

  // Production: Detalles de ventas
  console.log('  Creando detalles de ventas...');
  const detallesVentaData = [
    {
      ventaId: ventaIds[0],
      productoAgroId: productoIds[0],
      loteProduccionId: loteProdIds[0],
      cantidadKg: 50,
      precioUnitarioKg: 8000,
      precioTotal: 400000,
      costoUnitarioKg: 1200,
      costoTotal: 60000,
    },
    {
      ventaId: ventaIds[1],
      productoAgroId: productoIds[1],
      loteProduccionId: loteProdIds[1],
      cantidadKg: 15,
      precioUnitarioKg: 5000,
      precioTotal: 75000,
      costoUnitarioKg: 1000,
      costoTotal: 15000,
    },
  ];

  let detallesCreados = 0;
  for (const detData of detallesVentaData) {
    const existing = await ventaDetalleRepo.findOne({
      where: { ventaId: detData.ventaId, loteProduccionId: detData.loteProduccionId },
    });
    if (!existing) {
      const detalle = ventaDetalleRepo.create(detData);
      await ventaDetalleRepo.save(detalle);
      detallesCreados++;
    }
  }
  if (detallesCreados > 0) {
    console.log(`    ${detallesCreados} detalles de ventas creados`);
  }

  // Production: Pagos
  console.log('  Creando pagos...');
  const pagosData = [
    { ventaId: ventaIds[0], monto: 400000, metodo: 'efectivo', moneda: 'COP' },
    { ventaId: ventaIds[1], monto: 75000, metodo: 'transferencia', moneda: 'COP' },
  ];

  let pagosCreados = 0;
  for (const pagoData of pagosData) {
    const existing = await pagoRepo.findOne({
      where: { ventaId: pagoData.ventaId, monto: pagoData.monto },
    });
    if (!existing) {
      const pago = pagoRepo.create(pagoData);
      await pagoRepo.save(pago);
      pagosCreados++;
    }
  }
  if (pagosCreados > 0) {
    console.log(`    ${pagosCreados} pagos creados`);
  }

  // Production: Facturas
  console.log('  Creando facturas...');
  const facturasData = [
    { ventaId: ventaIds[0], numero: 'F001-2024', prefijo: 'F001', fechaEmision: new Date('2024-06-20'), vencimiento: new Date('2024-07-20') },
    { ventaId: ventaIds[1], numero: 'F002-2024', prefijo: 'F002', fechaEmision: new Date('2024-07-05'), vencimiento: new Date('2024-08-05') },
  ];

  let facturasCreadas = 0;
  for (const factData of facturasData) {
    const existing = await facturaRepo.findOne({ where: { ventaId: factData.ventaId } });
    if (!existing) {
      const factura = facturaRepo.create(factData);
      await facturaRepo.save(factura);
      facturasCreadas++;
    }
  }
  if (facturasCreadas > 0) {
    console.log(`    ${facturasCreadas} facturas creadas`);
  }
  console.log('Sección production completada.');
  
  // Wiki: Tipos de cultivo wiki
  console.log('  Creando tipos de cultivo wiki...');
  const tiposCultivoWikiData = [
    { nombre: 'Hortalizas', descripcion: 'Cultivos de hortalizas como tomate, lechuga, etc.' },
    { nombre: 'Cereales', descripcion: 'Cultivos de cereales como maíz, trigo, etc.' },
    { nombre: 'Tubérculos', descripcion: 'Cultivos de tubérculos como papa, yuca, etc.' },
  ];

  let tiposCultivoWikiCreados = 0;
  const tipoCultivoWikiIds: number[] = [];
  for (const tipoWikiData of tiposCultivoWikiData) {
    const existing = await tipoCultivoWikiRepo.findOne({ where: { nombre: tipoWikiData.nombre } });
    if (!existing) {
      const tipoWiki = tipoCultivoWikiRepo.create(tipoWikiData);
      const saved = await tipoCultivoWikiRepo.save(tipoWiki);
      tipoCultivoWikiIds.push(saved.id);
      tiposCultivoWikiCreados++;
    } else {
      tipoCultivoWikiIds.push(existing.id);
    }
  }
  if (tiposCultivoWikiCreados > 0) {
    console.log(`    ${tiposCultivoWikiCreados} tipos de cultivo wiki creados`);
  }

  // Wiki: EPAs
  console.log('  Creando EPAs...');
  const epasData = [
    { nombre: 'Preparación del suelo', tipoEpa: 'buenas_practicas', descripcion: 'Proceso para preparar el suelo antes de la siembra', instrucciones: 'Arar, fertilizar, nivelar el terreno.', creadoPorUsuarioId: usuarioActivo?.id ?? 1 },
    { nombre: 'Siembra', tipoEpa: 'buenas_practicas', descripcion: 'Técnicas de siembra adecuadas', instrucciones: 'Profundidad, distancia entre semillas, riego inicial.', creadoPorUsuarioId: usuarioActivo?.id ?? 1 },
    { nombre: 'Manejo de plagas', tipoEpa: 'manejo_plagas', descripcion: 'Control integrado de plagas', instrucciones: 'Identificación, métodos preventivos y curativos.', creadoPorUsuarioId: usuarioActivo?.id ?? 1 },
  ];

  let epasCreadas = 0;
  const epaIds: number[] = [];
  for (const epaData of epasData) {
    const existing = await ePARepo.findOne({ where: { nombre: epaData.nombre } });
    if (!existing) {
      const epa = ePARepo.create(epaData);
      const saved = await ePARepo.save(epa);
      epaIds.push(saved.id);
      epasCreadas++;
    } else {
      epaIds.push(existing.id);
    }
  }
  if (epasCreadas > 0) {
    console.log(`    ${epasCreadas} EPAs creadas`);
  }

  // Wiki: Relaciones EPA - Tipo Cultivo
  console.log('  Creando relaciones EPA - Tipo Cultivo...');
  const relacionesData = [
    { epaId: epaIds[0], tipoCultivoWikiId: tipoCultivoWikiIds[0] }, // Preparación suelo - Hortalizas
    { epaId: epaIds[0], tipoCultivoWikiId: tipoCultivoWikiIds[1] }, // Preparación suelo - Cereales
    { epaId: epaIds[0], tipoCultivoWikiId: tipoCultivoWikiIds[2] }, // Preparación suelo - Tubérculos
    { epaId: epaIds[1], tipoCultivoWikiId: tipoCultivoWikiIds[0] }, // Siembra - Hortalizas
    { epaId: epaIds[1], tipoCultivoWikiId: tipoCultivoWikiIds[1] }, // Siembra - Cereales
    { epaId: epaIds[2], tipoCultivoWikiId: tipoCultivoWikiIds[0] }, // Manejo plagas - Hortalizas
  ];

  let relacionesCreadas = 0;
  for (const relData of relacionesData) {
    const existing = await ePATipoCultivoWikiRepo.findOne({
      where: { epaId: relData.epaId, tipoCultivoWikiId: relData.tipoCultivoWikiId },
    });
    if (!existing) {
      const relacion = ePATipoCultivoWikiRepo.create(relData);
      await ePATipoCultivoWikiRepo.save(relacion);
      relacionesCreadas++;
    }
  }
  if (relacionesCreadas > 0) {
    console.log(`    ${relacionesCreadas} relaciones EPA - Tipo Cultivo creadas`);
  }
  console.log('Sección wiki completada.');
  
  console.log('Seed de datos de prueba comprehensivos completado\n');
}
