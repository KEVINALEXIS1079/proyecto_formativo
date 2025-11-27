import { AppDataSource } from './config/data-source';
import { seedModules } from './seeds/modules.seed';
import { seedRolesAndAdmin } from './seeds/roles-admin.seed';
import { seedPermisos } from './seeds/permisos.seed';

async function runSeed() {
  try {
    console.log('Inicializando conexión a base de datos...');
    await AppDataSource.initialize();
    console.log('Conexión establecida.');

    console.log('Iniciando seed...');

    // 1. Roles y Admin (Roles must exist for users and permissions)
    await seedRolesAndAdmin(AppDataSource);

    // 2. Permisos (Permissions depend on roles for assignment)
    await seedPermisos(AppDataSource);

    // 3. Módulos (Users depend on roles)
    await seedModules(AppDataSource);

    console.log('Seed completado exitosamente.');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

runSeed();
