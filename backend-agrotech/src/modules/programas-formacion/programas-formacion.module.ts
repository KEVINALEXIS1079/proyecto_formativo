import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramasFormacionController } from './programas-formacion.controller';
import { ProgramasFormacionService } from './programas-formacion.service';
import { ProgramaFormacion } from './entities/programa-formacion.entity';
import { TipoFormacion } from './entities/tipo-formacion.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProgramaFormacion, TipoFormacion]),
        AuthModule
    ],
    controllers: [ProgramasFormacionController],
    providers: [ProgramasFormacionService],
    exports: [ProgramasFormacionService],
})
export class ProgramasFormacionModule { }
