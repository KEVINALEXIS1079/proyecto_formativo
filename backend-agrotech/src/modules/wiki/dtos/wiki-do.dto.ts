import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { CreateEpaDto } from './create-epa.dto';
import { UpdateEpaDto } from './update-epa.dto';

export class WikiCreateDoDto extends CreateEpaDto {}

export class WikiFindAllDoDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  tipoEpa?: string;

  @IsOptional()
  @IsNumber()
  tipoCultivoWikiId?: number;

  @IsOptional()
  @IsNumber()
  mes?: number;

  @IsOptional()
  @IsString()
  temporada?: string;

  @IsOptional()
  @IsBoolean()
  conFotos?: boolean;
}

export class WikiFindOneDoDto {
  @IsNumber()
  id: number;
}

export class WikiUpdateDoDto {
  @IsNumber()
  id: number;

  data: UpdateEpaDto;
}

export class WikiRemoveDoDto {
  @IsNumber()
  id: number;
}

export class WikiFindAllTiposCultivoDoDto {
  // No parameters needed for this action
}