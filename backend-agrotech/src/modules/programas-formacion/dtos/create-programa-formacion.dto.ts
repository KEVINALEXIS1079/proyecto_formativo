import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateProgramaFormacionDto {
    @IsString()
    numeroFicha: string;

    @IsString()
    nombre: string;

    @IsString()
    tipo: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @IsOptional()
    @IsIn(['ACTIVO', 'FINALIZADO', 'SUSPENDIDO'])
    estado?: string;
}
