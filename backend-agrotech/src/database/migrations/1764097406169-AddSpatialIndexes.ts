import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSpatialIndexes1764097406169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Índices espaciales GiST para PostGIS
        await queryRunner.query(`CREATE INDEX "idx_lotes_geom" ON "lotes" USING GIST (geom);`);
        await queryRunner.query(`CREATE INDEX "idx_lotes_centroide" ON "lotes" USING GIST (centroide);`);
        await queryRunner.query(`CREATE INDEX "idx_sublotes_geom" ON "sublotes" USING GIST (geom);`);
        await queryRunner.query(`CREATE INDEX "idx_sublotes_centroide" ON "sublotes" USING GIST (centroide);`);

        // Índices en campos frecuentemente consultados
        // Estados
        await queryRunner.query(`CREATE INDEX "idx_lotes_estado" ON "lotes" ("estado");`);
        await queryRunner.query(`CREATE INDEX "idx_sublotes_estado" ON "sublotes" ("estado");`);
        await queryRunner.query(`CREATE INDEX "idx_cultivos_estado" ON "cultivos" ("estado");`);
        await queryRunner.query(`CREATE INDEX "idx_ventas_estado" ON "ventas" ("estado");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_deleted_at" ON "actividades" ("deleted_at");`);
        await queryRunner.query(`CREATE INDEX "idx_usuarios_estado" ON "usuarios" ("estado");`);
        await queryRunner.query(`CREATE INDEX "idx_sensores_activo" ON "sensores" ("activo");`);

        // Fechas
        await queryRunner.query(`CREATE INDEX "idx_ventas_fecha" ON "ventas" ("fecha");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_fecha" ON "actividades" ("fecha");`);
        await queryRunner.query(`CREATE INDEX "idx_cultivos_fecha_siembra" ON "cultivos" ("fecha_siembra");`);
        await queryRunner.query(`CREATE INDEX "idx_cultivos_fecha_finalizacion" ON "cultivos" ("fecha_finalizacion");`);
        await queryRunner.query(`CREATE INDEX "idx_sensor_lecturas_timestamp" ON "sensor_lecturas" ("timestamp");`);

        // Foreign keys comunes para optimizar joins
        await queryRunner.query(`CREATE INDEX "idx_cultivos_lote_id" ON "cultivos" ("lote_id");`);
        await queryRunner.query(`CREATE INDEX "idx_cultivos_sublote_id" ON "cultivos" ("sublote_id");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_lote_id" ON "actividades" ("lote_id");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_sublote_id" ON "actividades" ("sublote_id");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_cultivo_id" ON "actividades" ("cultivo_id");`);
        await queryRunner.query(`CREATE INDEX "idx_ventas_cliente_id" ON "ventas" ("cliente_id");`);
        await queryRunner.query(`CREATE INDEX "idx_ventas_detalles_venta_id" ON "ventas_detalles" ("venta_id");`);
        await queryRunner.query(`CREATE INDEX "idx_ventas_detalles_lote_produccion_id" ON "ventas_detalles" ("lote_produccion_id");`);
        await queryRunner.query(`CREATE INDEX "idx_movimientos_produccion_lote_produccion_id" ON "movimientos_produccion" ("lote_produccion_id");`);
        await queryRunner.query(`CREATE INDEX "idx_lotes_produccion_cultivo_id" ON "lotes_produccion" ("cultivo_id");`);
        await queryRunner.query(`CREATE INDEX "idx_sensor_lecturas_sensor_id" ON "sensor_lecturas" ("sensor_id");`);
        await queryRunner.query(`CREATE INDEX "idx_sensores_cultivo_id" ON "sensores" ("cultivo_id");`);
        await queryRunner.query(`CREATE INDEX "idx_insumos_categoria_id" ON "insumos" ("categoria_id");`);
        await queryRunner.query(`CREATE INDEX "idx_insumos_almacen_id" ON "insumos" ("almacen_id");`);
        await queryRunner.query(`CREATE INDEX "idx_movimientos_insumos_insumo_id" ON "movimientos_insumos" ("insumo_id");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_insumos_uso_actividad_id" ON "actividades_insumos_uso" ("actividad_id");`);
        await queryRunner.query(`CREATE INDEX "idx_actividades_responsables_actividad_id" ON "actividades_responsables" ("actividad_id");`);

        // Agregar constraints de integridad referencial faltantes
        await queryRunner.query(`ALTER TABLE "lotes_produccion" ADD CONSTRAINT "FK_lotes_produccion_loteId" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "lotes_produccion" ADD CONSTRAINT "FK_lotes_produccion_subLoteId" FOREIGN KEY ("subLoteId") REFERENCES "sublotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "lotes_produccion" ADD CONSTRAINT "FK_lotes_produccion_actividadCosechaId" FOREIGN KEY ("actividadCosechaId") REFERENCES "actividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);

        await queryRunner.query(`ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "FK_movimientos_insumos_almacenOrigenId" FOREIGN KEY ("almacenOrigenId") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "FK_movimientos_insumos_almacenDestinoId" FOREIGN KEY ("almacenDestinoId") REFERENCES "almacenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumos" ADD CONSTRAINT "FK_movimientos_insumos_actividadId" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices en orden inverso
        // Remover constraints de integridad referencial
        await queryRunner.query(`ALTER TABLE "movimientos_insumos" DROP CONSTRAINT "FK_movimientos_insumos_actividadId";`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumos" DROP CONSTRAINT "FK_movimientos_insumos_almacenDestinoId";`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumos" DROP CONSTRAINT "FK_movimientos_insumos_almacenOrigenId";`);
        await queryRunner.query(`ALTER TABLE "lotes_produccion" DROP CONSTRAINT "FK_lotes_produccion_actividadCosechaId";`);
        await queryRunner.query(`ALTER TABLE "lotes_produccion" DROP CONSTRAINT "FK_lotes_produccion_subLoteId";`);
        await queryRunner.query(`ALTER TABLE "lotes_produccion" DROP CONSTRAINT "FK_lotes_produccion_loteId";`);

        // Remover índices
        await queryRunner.query(`DROP INDEX "idx_actividades_responsables_actividad_id";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_insumos_uso_actividad_id";`);
        await queryRunner.query(`DROP INDEX "idx_movimientos_insumos_insumo_id";`);
        await queryRunner.query(`DROP INDEX "idx_insumos_almacen_id";`);
        await queryRunner.query(`DROP INDEX "idx_insumos_categoria_id";`);
        await queryRunner.query(`DROP INDEX "idx_sensores_cultivo_id";`);
        await queryRunner.query(`DROP INDEX "idx_sensor_lecturas_sensor_id";`);
        await queryRunner.query(`DROP INDEX "idx_lotes_produccion_cultivo_id";`);
        await queryRunner.query(`DROP INDEX "idx_movimientos_produccion_lote_produccion_id";`);
        await queryRunner.query(`DROP INDEX "idx_ventas_detalles_lote_produccion_id";`);
        await queryRunner.query(`DROP INDEX "idx_ventas_detalles_venta_id";`);
        await queryRunner.query(`DROP INDEX "idx_ventas_cliente_id";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_cultivo_id";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_sublote_id";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_lote_id";`);
        await queryRunner.query(`DROP INDEX "idx_cultivos_sublote_id";`);
        await queryRunner.query(`DROP INDEX "idx_cultivos_lote_id";`);
        await queryRunner.query(`DROP INDEX "idx_sensor_lecturas_timestamp";`);
        await queryRunner.query(`DROP INDEX "idx_cultivos_fecha_finalizacion";`);
        await queryRunner.query(`DROP INDEX "idx_cultivos_fecha_siembra";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_fecha";`);
        await queryRunner.query(`DROP INDEX "idx_ventas_fecha";`);
        await queryRunner.query(`DROP INDEX "idx_sensores_activo";`);
        await queryRunner.query(`DROP INDEX "idx_usuarios_estado";`);
        await queryRunner.query(`DROP INDEX "idx_actividades_deleted_at";`);
        await queryRunner.query(`DROP INDEX "idx_ventas_estado";`);
        await queryRunner.query(`DROP INDEX "idx_cultivos_estado";`);
        await queryRunner.query(`DROP INDEX "idx_sublotes_estado";`);
        await queryRunner.query(`DROP INDEX "idx_lotes_estado";`);
        await queryRunner.query(`DROP INDEX "idx_sublotes_centroide";`);
        await queryRunner.query(`DROP INDEX "idx_sublotes_geom";`);
        await queryRunner.query(`DROP INDEX "idx_lotes_centroide";`);
        await queryRunner.query(`DROP INDEX "idx_lotes_geom";`);
    }

}
