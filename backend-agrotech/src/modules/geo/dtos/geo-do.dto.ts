import { IsNumber, IsOptional } from 'class-validator';
import { CreateLoteDto } from './create-lote.dto';
import { UpdateLoteDto } from './update-lote.dto';
import { CreateSubLoteDto } from './create-sublote.dto';
import { UpdateSubLoteDto } from './update-sublote.dto';


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