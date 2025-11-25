import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Auth/Users
import { Usuario } from '../../modules/users/entities/usuario.entity';

export async function seedUsuarios(dataSource: DataSource) {
  console.log('Ejecutando seed de usuarios adicionales...');

  const usuarioRepo = dataSource.getRepository(Usuario);

  // Usuarios adicionales para pruebas
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
    console.log(`  ${usuariosCreados} usuarios adicionales creados`);
  } else {
    console.log('  ℹUsuarios adicionales ya existen, omitiendo...');
  }

  console.log('Seed de usuarios adicionales completado\n');
}