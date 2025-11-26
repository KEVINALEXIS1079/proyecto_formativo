import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../../modules/users/entities/rol.entity';
import { Usuario } from '../../modules/users/entities/usuario.entity';
import { Permiso } from '../../modules/users/entities/permiso.entity';
import { RolPermiso } from '../../modules/auth/entities/rol-permiso.entity';

export async function seedRolesAndAdmin(dataSource: DataSource) {
  const rolRepo = dataSource.getRepository(Rol);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const permisoRepo = dataSource.getRepository(Permiso);
  const rolPermisoRepo = dataSource.getRepository(RolPermiso);

  console.log('Ejecutando seed de roles y admin...');

  // Crear roles base (solo si no existen)
  const rolesData = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', esSistema: true, estado: 'activo' },
    { id: 2, nombre: 'Instructor', descripcion: 'Instructor SENA', esSistema: true, estado: 'activo' },
    { id: 3, nombre: 'Aprendiz', descripcion: 'Aprendiz SENA', esSistema: true, estado: 'activo' },
    { id: 4, nombre: 'Pasante', descripcion: 'Pasante', esSistema: true, estado: 'activo' },
    { id: 5, nombre: 'Invitado', descripcion: 'Usuario invitado sin permisos', esSistema: true, estado: 'activo' },
  ];

  let rolesCreated = 0;
  for (const roleData of rolesData) {
    const existing = await rolRepo.findOne({ where: { nombre: roleData.nombre } });
    if (!existing) {
      const rol = rolRepo.create(roleData);
      await rolRepo.save(rol);
      console.log(`Rol creado: ${roleData.nombre}`);
      rolesCreated++;
    }
  }

  if (rolesCreated === 0) {
    console.log('Roles ya existen, omitiendo...');
  }

  // Asignar TODOS los permisos al rol Administrador
  const allPermisos = await permisoRepo.find();
  if (allPermisos.length > 0) {
    let permisosAsignados = 0;
    for (const permiso of allPermisos) {
      const existing = await rolPermisoRepo.findOne({
        where: { rolId: 1, permisoId: permiso.id },
      });

      if (!existing) {
        await rolPermisoRepo.save({ rolId: 1, permisoId: permiso.id });
        permisosAsignados++;
      }
    }
    console.log(`Se asignaron ${permisosAsignados} nuevos permisos al Administrador`);
  }

  // Crear usuario admin (solo si no existe)
  const adminEmail = process.env.ADMIN_EMAIL || 'agrotechsena2025@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Agrotech2025';

  const existingAdmin = await usuarioRepo.findOne({ where: { correo: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = usuarioRepo.create({
      nombre: 'Admin',
      apellido: 'Agrotech',
      identificacion: '000000000',
      correo: adminEmail,
      passwordHash,
      rolId: 1, // Administrador
      estado: 'activo',
      emailVerifiedAt: new Date(),
    });
    await usuarioRepo.save(admin);
    console.log(`Usuario admin creado: ${adminEmail}`);
  } else {
    console.log(`Usuario admin ya existe: ${adminEmail}`);
  }

  console.log('Seed de roles y admin completado\n');
}
