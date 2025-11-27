import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedRolesAndAdmin } from '../roles-admin.seed';
import { seedPermisos } from '../permisos.seed';
import { seedModules } from '../modules.seed';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);
  private readonly SEED_LOG_TABLE = 'seed_execution_log';

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    this.logger.log('Checking if seeds need to be executed...');
    await this.runSeedsIfNotExecuted();
  }

  private async runSeedsIfNotExecuted() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Drop log table if exists
      await queryRunner.query(`DROP TABLE IF EXISTS ${this.SEED_LOG_TABLE}`);

      // Create log table with new structure
      await queryRunner.query(`
        CREATE TABLE ${this.SEED_LOG_TABLE} (
          id SERIAL PRIMARY KEY,
          seed_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      this.logger.log(`Created ${this.SEED_LOG_TABLE} table`);

      // Define seeds
      const seeds = [
        { name: 'roles-admin', fn: seedRolesAndAdmin },
        { name: 'permisos', fn: seedPermisos },
        { name: 'modules', fn: seedModules },
      ];

      // Execute seeds individually if not already executed
      for (const seed of seeds) {
        const result = await queryRunner.query(
          `SELECT COUNT(*) as count FROM ${this.SEED_LOG_TABLE} WHERE seed_name = $1`,
          [seed.name],
        );
        const count = parseInt(result[0].count, 10);

        if (count === 0) {
          this.logger.log(`Executing seed: ${seed.name}...`);
          await seed.fn(this.dataSource);

          // Log execution
          await queryRunner.query(
            `INSERT INTO ${this.SEED_LOG_TABLE} (seed_name, description) VALUES ($1, $2)`,
            [seed.name, `Executed seed: ${seed.name}`],
          );

          this.logger.log(`Seed ${seed.name} executed successfully!`);
        } else {
          this.logger.log(
            `Seed ${seed.name} has already been executed. Skipping...`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error executing seeds:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
