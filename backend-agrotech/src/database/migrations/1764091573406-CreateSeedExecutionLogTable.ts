import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeedExecutionLogTable1764091573406 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "seed_execution_log" (id SERIAL PRIMARY KEY, seed_name VARCHAR(255) NOT NULL UNIQUE, executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, description TEXT)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "seed_execution_log"');
    }

}
