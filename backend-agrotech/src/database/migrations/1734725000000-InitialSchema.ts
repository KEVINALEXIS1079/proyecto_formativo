import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1734725000000 implements MigrationInterface {
  name = 'InitialSchema1734725000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Esta es la migración inicial del esquema de la base de datos
    // Las tablas ya están creadas por TypeORM synchronize
    // Esta migración sirve como punto de partida para futuras migraciones
    
    await queryRunner.query(`
      -- Verificar que las tablas principales existen
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuario', 'rol', 'permiso', 'cultivo', 'lote', 'actividad');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No se revierte la migración inicial
    // Para resetear la base de datos, usar: npm run schema:drop
  }
}
