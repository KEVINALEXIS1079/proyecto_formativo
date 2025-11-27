import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionFinanciera } from './entities/transaccion-financiera.entity';
import { FinanceService } from './services/finance.service';
import { FinanceController } from './controllers/finance.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransaccionFinanciera]), AuthModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
