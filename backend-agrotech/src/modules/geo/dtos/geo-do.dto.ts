import { IsNumber, IsOptional } from 'class-validator';
import { CreateLoteDto } from './create-lote.dto';
import { UpdateLoteDto } from './update-lote.dto';
import { CreateSubLoteDto } from './create-sublote.dto';
import { UpdateSubLoteDto } from './update-sublote.dto';
import { CreateCultivoDto } from './create-cultivo.dto';
import { UpdateCultivoDto } from './update-cultivo.dto';

export class GeoFindAllLotesDoDto {}

export class GeoFindLoteByIdDoDto {
  @IsNumber()
  id: number;
}

export class GeoCreateLoteDoDto extends CreateLoteDto {}

export class GeoUpdateLoteDoDto {
  @IsNumber()
  id: number;

  data: UpdateLoteDto;
}

export class GeoRemoveLoteDoDto {
  @IsNumber()
  id: number;
}

export class GeoFindAllSubLotesDoDto {
  @IsOptional()
  @IsNumber()
  loteId?: number;
}

export class GeoFindSubLoteByIdDoDto {
  @IsNumber()
  id: number;
}

export class GeoCreateSubLoteDoDto extends CreateSubLoteDto {}

export class GeoUpdateSubLoteDoDto {
  @IsNumber()
  id: number;

  data: UpdateSubLoteDto;
}

export class GeoRemoveSubLoteDoDto {
  @IsNumber()
  id: number;
}

export class GeoFindAllCultivosDoDto {
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

export class GeoFindCultivoByIdDoDto {
  @IsNumber()
  id: number;
}

export class GeoCreateCultivoDoDto extends CreateCultivoDto {}

export class GeoUpdateCultivoDoDto {
  @IsNumber()
  id: number;

  data: UpdateCultivoDto;
}

export class GeoRemoveCultivoDoDto {
  @IsNumber()
  id: number;
}