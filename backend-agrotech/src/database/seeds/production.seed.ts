import { DataSource } from 'typeorm';
import { ProductoAgro } from '../../modules/production/entities/producto-agro.entity';
import { Cliente } from '../../modules/production/entities/cliente.entity';

export async function seedProduction(dataSource: DataSource) {
  console.log('Ejecutando seed de producción...');

  const productoRepo = dataSource.getRepository(ProductoAgro);
  const clienteRepo = dataSource.getRepository(Cliente);

  // Productos agro básicos
  const productosData = [
    {
      nombre: 'Tomate',
      unidadBase: 'kg',
      descripcion: 'Tomate fresco para consumo directo',
    },
    {
      nombre: 'Maíz',
      unidadBase: 'kg',
      descripcion: 'Maíz amarillo para alimentación',
    },
    {
      nombre: 'Café pergamino',
      unidadBase: 'kg',
      descripcion: 'Café en pergamino listo para procesamiento',
    },
    {
      nombre: 'Papa',
      unidadBase: 'kg',
      descripcion: 'Papa blanca de calidad premium',
    },
    {
      nombre: 'Cebolla',
      unidadBase: 'kg',
      descripcion: 'Cebolla blanca para exportación',
    },
    {
      nombre: 'Arroz paddy',
      unidadBase: 'kg',
      descripcion: 'Arroz en cáscara para procesamiento',
    },
  ];

  let productosCreados = 0;
  const productoIds: number[] = [];
  for (const productoData of productosData) {
    const existing = await productoRepo.findOne({ where: { nombre: productoData.nombre } });
    if (!existing) {
      const producto = productoRepo.create(productoData);
      const saved = await productoRepo.save(producto);
      productoIds.push(saved.id);
      productosCreados++;
    } else {
      productoIds.push(existing.id);
    }
  }

  if (productosCreados > 0) {
    console.log(`  ${productosCreados} productos agro creados`);
  } else {
    console.log('  ℹProductos agro ya existen, omitiendo...');
  }

  // Clientes iniciales
  const clientesData = [
    {
      nombre: 'Supermercados La Economía S.A.',
      identificacion: '900.123.456-1',
      telefono: '+57 1 2345678',
      email: 'compras@laeconomia.com',
      direccion: 'Calle 123 #45-67, Bogotá, Colombia',
      notas: 'Cliente mayorista, pagos a 30 días',
    },
    {
      nombre: 'Distribuidora Agroindustria Ltda.',
      identificacion: '901.234.567-2',
      telefono: '+57 1 3456789',
      email: 'pedidos@agroindustria.com',
      direccion: 'Carrera 89 #12-34, Medellín, Colombia',
      notas: 'Especializados en productos orgánicos',
    },
    {
      nombre: 'Exportadora Nacional S.A.S.',
      identificacion: '902.345.678-3',
      telefono: '+57 1 4567890',
      email: 'export@exportadora.com',
      direccion: 'Avenida 68 #45-23, Barranquilla, Colombia',
      notas: 'Cliente de exportación, requiere certificaciones',
    },
    {
      nombre: 'Restaurante El Sabor Campestre',
      identificacion: '12345678-9',
      telefono: '+57 1 5678901',
      email: 'admin@saborcampestre.com',
      direccion: 'Transversal 45 #67-89, Cali, Colombia',
      notas: 'Cliente minorista, pedidos semanales',
    },
    {
      nombre: 'Cooperativa Agrícola del Valle',
      identificacion: '903.456.789-4',
      telefono: '+57 1 6789012',
      email: 'ventas@cooperativa-valle.com',
      direccion: 'Vereda La Esperanza, Valle del Cauca, Colombia',
      notas: 'Cooperativa de pequeños productores',
    },
  ];

  let clientesCreados = 0;
  const clienteIds: number[] = [];
  for (const clienteData of clientesData) {
    const existing = await clienteRepo.findOne({ where: { identificacion: clienteData.identificacion } });
    if (!existing) {
      const cliente = clienteRepo.create(clienteData);
      const saved = await clienteRepo.save(cliente);
      clienteIds.push(saved.id);
      clientesCreados++;
    } else {
      clienteIds.push(existing.id);
    }
  }

  if (clientesCreados > 0) {
    console.log(`  ${clientesCreados} clientes creados`);
  } else {
    console.log('  ℹClientes ya existen, omitiendo...');
  }

  console.log('Seed de producción completado\n');
  return { productoIds, clienteIds };
}