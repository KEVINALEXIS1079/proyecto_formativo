import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Auth/Users
import { Usuario } from '../../modules/users/entities/usuario.entity';
import { Rol } from '../../modules/auth/entities/rol.entity';

export async function seedRolesAdmin(dataSource: DataSource) {
  console.log('Ejecutando seed de roles y admin...');

  const usuarioRepo = dataSource.getRepository(Usuario);
  const rolRepo = dataSource.getRepository(Rol);

  // Crear roles base si no existen
  const rolesData = [
    { nombre: 'Administrador', descripcion: 'Acceso completo al sistema', esSistema: true },
    { nombre: 'Instructor', descripcion: 'Gestión de actividades y cultivos', esSistema: true },
    { nombre: 'Aprendiz', descripcion: 'Participación en actividades', esSistema: true },
    { nombre: 'Pasante', descripcion: 'Observador con permisos limitados', esSistema: true },
    { nombre: 'Invitado', descripcion: 'Usuario registrado sin rol asignado', esSistema: true },
  ];

  let rolesCreados = 0;
  for (const rolData of rolesData) {
    const existing = await rolRepo.findOne({ where: { nombre: rolData.nombre } });
    if (!existing) {
      const rol = rolRepo.create(rolData);
      await rolRepo.save(rol);
      rolesCreados++;
    }
  }
  if (rolesCreados > 0) {
    console.log(`  ${rolesCreados} roles creados`);
  } else {
    console.log('  ℹRoles ya existen, omitiendo...');
  }

  // Crear usuario admin si no existe
  const adminData = {
    nombre: 'Admin',
    apellido: 'Sistema',
    identificacion: '123456789',
    correo: 'agrotechsena2025@gmail.com',
    passwordHash: await bcrypt.hash('admin123', 10),
    rolId: 1, // Administrador
    estado: 'activo',
    emailVerifiedAt: new Date(),
  };

  const existingAdmin = await usuarioRepo.findOne({ where: { correo: adminData.correo } });
  if (!existingAdmin) {
    const admin = usuarioRepo.create(adminData);
    await usuarioRepo.save(admin);
    console.log('  Usuario admin creado: agrotechsena2025@gmail.com');
  } else {
    console.log('  ℹUsuario admin ya existe: agrotechsena2025@gmail.com');
  }

  console.log('Seed de roles y admin completado\n');
}
