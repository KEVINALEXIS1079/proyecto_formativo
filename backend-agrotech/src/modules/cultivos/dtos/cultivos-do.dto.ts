import { IsNumber, IsOptional } from 'class-validator';
import { CreateCultivoDto } from './create-cultivo.dto';
import { UpdateCultivoDto } from './update-cultivo.dto';

export class CultivosFindAllDoDto {
  @IsOptional()
  @IsNumber()
  loteId?: number;

  @IsOptional()
  @IsNumber()
  subLoteId?: number;

  @IsOptional()
  estado?: string;

  @IsOptional()
  q?: string;
}

export class CultivosFindByIdDoDto {
  @IsNumber()
  id: number;
}

export class CultivosCreateDoDto extends CreateCultivoDto {}

export class CultivosUpdateDoDto {
  @IsNumber()
  id: number;

  data: UpdateCultivoDto;
}

export class CultivosRemoveDoDto {
  @IsNumber()
  id: number;
}
