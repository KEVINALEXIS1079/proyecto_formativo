import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAuditFields1764051033893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna creadoPorUsuarioId a la tabla cultivos
    await queryRunner.addColumn(
      'cultivos',
      new TableColumn({
        name: 'creadoPorUsuarioId',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Crear índice para la nueva columna
    await queryRunner.query(
      'CREATE INDEX "IDX_cultivos_creadoPorUsuarioId" ON "cultivos" ("creadoPorUsuarioId")',
    );

    // Agregar foreign key constraint
    await queryRunner.query(
      'ALTER TABLE "cultivos" ADD CONSTRAINT "FK_cultivos_creadoPorUsuarioId" FOREIGN KEY ("creadoPorUsuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key constraint
    await queryRunner.query(
      'ALTER TABLE "cultivos" DROP CONSTRAINT "FK_cultivos_creadoPorUsuarioId"',
    );

    // Remover índice
    await queryRunner.query('DROP INDEX "IDX_cultivos_creadoPorUsuarioId"');

    // Remover columna
    await queryRunner.dropColumn('cultivos', 'creadoPorUsuarioId');
  }
}