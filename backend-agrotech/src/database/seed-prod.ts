import { AppDataSource } from './config/data-source';
import { seedRolesAndAdmin } from './seeds/roles-admin.seed';
import { seedPermisos } from './seeds/permisos.seed';

async function runProdSeed() {
  try {
    console.log('Inicializando conexión a base de datos (PROD SEED)...');
    await AppDataSource.initialize();
    console.log('Conexión establecida.');

    console.log('Iniciando seed de producción (Solo Roles, Permisos y Admin)...');

    // 1. Roles y Admin (Roles must exist for users and permissions)
    await seedRolesAndAdmin(AppDataSource);

    // 2. Permisos (Permissions depend on roles for assignment)
    await seedPermisos(AppDataSource);

    console.log('Seed de producción completado exitosamente.');
    console.log('Nota: No se han creado usuarios adicionales, cultivos, reportes ni datos de prueba.');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error durante el seed de producción:', error);
    process.exit(1);
  }
}

runProdSeed();
