import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateGlobalConfigDto {
  @IsString()
  name: string;

  @IsString()
  broker: string;

  @IsInt()
  port: number;

  @IsString()
  protocol: string;

  @IsString()
  topicPrefix: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultTopics?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customTopics?: string[];

  @IsInt()
  @IsOptional()
  loteId?: number;

  @IsInt()
  @IsOptional()
  subLoteId?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;
}

export class UpdateGlobalConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  broker?: string;

  @IsInt()
  @IsOptional()
  port?: number;

  @IsString()
  @IsOptional()
  protocol?: string;

  @IsString()
  @IsOptional()
  topicPrefix?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  defaultTopics?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  customTopics?: string[];

  @IsInt()
  @IsOptional()
  loteId?: number;

  @IsInt()
  @IsOptional()
  subLoteId?: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
