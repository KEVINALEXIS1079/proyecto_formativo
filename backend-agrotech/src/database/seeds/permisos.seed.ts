import { DataSource } from 'typeorm';
import { Permiso } from '../../modules/users/entities/permiso.entity';
import { RolPermiso } from '../../modules/auth/entities/rol-permiso.entity';

export async function seedPermisos(dataSource: DataSource) {
  const permisoRepo = dataSource.getRepository(Permiso);
  const rolPermisoRepo = dataSource.getRepository(RolPermiso);

  console.log('Ejecutando seed de permisos...');

  // Definir permisos base
  const permisosBase = [
    // Usuarios
    { modulo: 'usuarios', accion: 'ver', clave: 'usuarios.ver', descripcion: 'Ver usuarios' },
    { modulo: 'usuarios', accion: 'crear', clave: 'usuarios.crear', descripcion: 'Crear usuarios' },
    { modulo: 'usuarios', accion: 'editar', clave: 'usuarios.editar', descripcion: 'Editar usuarios' },
    { modulo: 'usuarios', accion: 'eliminar', clave: 'usuarios.eliminar', descripcion: 'Eliminar usuarios' },
    { modulo: 'usuarios', accion: 'ver_permisos', clave: 'usuarios.ver_permisos', descripcion: 'Ver permisos de usuarios' },
    { modulo: 'usuarios', accion: 'asignar_permisos', clave: 'usuarios.asignar_permisos', descripcion: 'Asignar permisos a usuarios' },
    { modulo: 'usuarios', accion: 'ver_perfil', clave: 'usuarios.ver_perfil', descripcion: 'Permite ver el perfil de usuarios individuales' },

    // Roles
    { modulo: 'roles', accion: 'ver', clave: 'roles.ver', descripcion: 'Ver roles' },
    { modulo: 'roles', accion: 'crear', clave: 'roles.crear', descripcion: 'Crear roles' },
    { modulo: 'roles', accion: 'editar', clave: 'roles.editar', descripcion: 'Editar roles' },
    { modulo: 'roles', accion: 'eliminar', clave: 'roles.eliminar', descripcion: 'Eliminar roles' },
    { modulo: 'roles', accion: 'asignar_permisos', clave: 'roles.asignar_permisos', descripcion: 'Asignar permisos a roles' },
    
    // Permisos
    { modulo: 'permisos', accion: 'ver', clave: 'permisos.ver', descripcion: 'Ver permisos' },
    { modulo: 'permisos', accion: 'crear', clave: 'permisos.crear', descripcion: 'Crear permisos' },
    
    // Lotes
    { modulo: 'lotes', accion: 'ver', clave: 'lotes.ver', descripcion: 'Ver lotes' },
    { modulo: 'lotes', accion: 'crear', clave: 'lotes.crear', descripcion: 'Crear lotes' },
    { modulo: 'lotes', accion: 'editar', clave: 'lotes.editar', descripcion: 'Editar lotes' },
    { modulo: 'lotes', accion: 'eliminar', clave: 'lotes.eliminar', descripcion: 'Eliminar lotes' },
    // Sublotes
    { modulo: 'sublotes', accion: 'ver', clave: 'sublotes.ver', descripcion: 'Ver sublotes' },
    { modulo: 'sublotes', accion: 'crear', clave: 'sublotes.crear', descripcion: 'Crear sublotes' },
    { modulo: 'sublotes', accion: 'editar', clave: 'sublotes.editar', descripcion: 'Editar sublotes' },
    { modulo: 'sublotes', accion: 'eliminar', clave: 'sublotes.eliminar', descripcion: 'Eliminar sublotes' },
    
    // Cultivos
    { modulo: 'cultivos', accion: 'ver', clave: 'cultivos.ver', descripcion: 'Ver cultivos' },
    { modulo: 'cultivos', accion: 'crear', clave: 'cultivos.crear', descripcion: 'Crear cultivos' },
    { modulo: 'cultivos', accion: 'editar', clave: 'cultivos.editar', descripcion: 'Editar cultivos' },
    { modulo: 'cultivos', accion: 'eliminar', clave: 'cultivos.eliminar', descripcion: 'Eliminar cultivos' },
    
    // Actividades
    { modulo: 'actividades', accion: 'ver', clave: 'actividades.ver', descripcion: 'Ver actividades' },
    { modulo: 'actividades', accion: 'crear', clave: 'actividades.crear', descripcion: 'Crear actividades' },
    { modulo: 'actividades', accion: 'editar', clave: 'actividades.editar', descripcion: 'Editar actividades' },
    { modulo: 'actividades', accion: 'eliminar', clave: 'actividades.eliminar', descripcion: 'Eliminar actividades' },
    
    // Inventario
    { modulo: 'inventario', accion: 'ver', clave: 'inventario.ver', descripcion: 'Ver inventario' },
    { modulo: 'inventario', accion: 'crear', clave: 'inventario.crear', descripcion: 'Crear insumos' },
    { modulo: 'inventario', accion: 'editar', clave: 'inventario.editar', descripcion: 'Editar insumos' },
    { modulo: 'inventario', accion: 'eliminar', clave: 'inventario.eliminar', descripcion: 'Eliminar insumos' },
    
    // IoT
    { modulo: 'iot', accion: 'ver', clave: 'iot.ver', descripcion: 'Ver sensores y lecturas' },
    { modulo: 'iot', accion: 'crear', clave: 'iot.crear', descripcion: 'Crear sensores' },
    { modulo: 'iot', accion: 'editar', clave: 'iot.editar', descripcion: 'Editar sensores' },
    { modulo: 'iot', accion: 'eliminar', clave: 'iot.eliminar', descripcion: 'Eliminar sensores' },
    
    // Ventas
    { modulo: 'ventas', accion: 'ver', clave: 'ventas.ver', descripcion: 'Ver ventas' },
    { modulo: 'ventas', accion: 'crear', clave: 'ventas.crear', descripcion: 'Crear ventas' },
    { modulo: 'ventas', accion: 'anular', clave: 'ventas.anular', descripcion: 'Anular ventas' },
  ];

  let permisosCreados = 0;
  const permisoIds: number[] = [];

  for (const permisoData of permisosBase) {
    const existing = await permisoRepo.findOne({ where: { clave: permisoData.clave } });
    if (!existing) {
      const permiso = permisoRepo.create(permisoData);
      const saved = await permisoRepo.save(permiso);
      permisoIds.push(saved.id);
      permisosCreados++;
    } else {
      permisoIds.push(existing.id);
    }
  }

  if (permisosCreados > 0) {
    console.log(`  ${permisosCreados} permisos creados`);
  } else {
    console.log('  ℹPermisos ya existen, omitiendo...');
  }

  // Asignar TODOS los permisos al rol Administrador (ID: 1)
  const adminRolId = 1;
  let permisosAsignados = 0;

  for (const permisoId of permisoIds) {
    const existing = await rolPermisoRepo.findOne({
      where: { rolId: adminRolId, permisoId },
    });

    if (!existing) {
      await rolPermisoRepo.save({ rolId: adminRolId, permisoId });
      permisosAsignados++;
    }
  }

  if (permisosAsignados > 0) {
    console.log(`  ${permisosAsignados} permisos asignados al rol Administrador`);
  } else {
    console.log('  ℹPermisos ya asignados al Administrador');
  }

  // Asignar permiso "usuarios.ver_perfil" a todos los roles existentes
  const verPerfilPermiso = await permisoRepo.findOne({ where: { clave: 'usuarios.ver_perfil' } });
  if (verPerfilPermiso) {
    const roleIds = [1, 2, 3, 4, 5]; // IDs de los roles: Administrador, Instructor, Aprendiz, Pasante, Invitado
    let permisosAsignadosGlobal = 0;

    for (const rolId of roleIds) {
      const existing = await rolPermisoRepo.findOne({
        where: { rolId, permisoId: verPerfilPermiso.id },
      });

      if (!existing) {
        await rolPermisoRepo.save({ rolId, permisoId: verPerfilPermiso.id });
        permisosAsignadosGlobal++;
        console.log(`Permiso usuarios.ver_perfil asignado al rol ID ${rolId}`);
      }
    }

    if (permisosAsignadosGlobal > 0) {
      console.log(`  ${permisosAsignadosGlobal} asignaciones de permiso usuarios.ver_perfil realizadas`);
    } else {
      console.log('  ℹPermiso usuarios.ver_perfil ya asignado a todos los roles');
    }
  } else {
    console.log('  ⚠Permiso usuarios.ver_perfil no encontrado');
  }

  console.log('Seed de permisos completado\n');
}
