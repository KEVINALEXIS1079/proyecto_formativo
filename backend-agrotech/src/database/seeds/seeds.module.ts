import { Module } from '@nestjs/common';
import { SeedService } from './services/seed.service';

@Module({
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedsModule {}
