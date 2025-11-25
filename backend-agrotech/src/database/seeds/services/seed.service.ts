import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedRolesAdmin } from '../roles-admin.seed';
import { seedPermisos } from '../permisos.seed';
import { seedUsuarios } from '../usuarios.seed';
import { seedGeo } from '../geo.seed';
import { seedCultivos } from '../cultivos.seed';
import { seedInventory } from '../inventory.seed';
import { seedActivities } from '../activities.seed';
import { seedIot } from '../iot.seed';
import { seedWiki } from '../wiki.seed';
import { seedProduction } from '../production.seed';

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
      // Define seeds
      const seeds = [
        { name: 'roles-admin', fn: seedRolesAdmin },
        { name: 'permisos', fn: seedPermisos },
        { name: 'usuarios', fn: seedUsuarios },
        { name: 'geo', fn: seedGeo },
        { name: 'cultivos', fn: seedCultivos },
        { name: 'inventory', fn: seedInventory },
        { name: 'activities', fn: seedActivities },
        { name: 'iot', fn: seedIot },
        { name: 'wiki', fn: seedWiki },
        { name: 'production', fn: seedProduction },
      ];

      // Execute seeds individually if not already executed
      for (const seed of seeds) {
        const result = await queryRunner.query(
          `SELECT COUNT(*) as count FROM ${this.SEED_LOG_TABLE} WHERE seed_name = $1`,
          [seed.name]
        );
        const count = parseInt(result[0].count, 10);

        if (count === 0) {
          this.logger.log(`Executing seed: ${seed.name}...`);
          await seed.fn(this.dataSource);

          // Log execution
          await queryRunner.query(
            `INSERT INTO ${this.SEED_LOG_TABLE} (seed_name, description) VALUES ($1, $2)`,
            [seed.name, `Executed seed: ${seed.name}`]
          );

          this.logger.log(`Seed ${seed.name} executed successfully!`);
        } else {
          this.logger.log(`Seed ${seed.name} has already been executed. Skipping...`);
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
