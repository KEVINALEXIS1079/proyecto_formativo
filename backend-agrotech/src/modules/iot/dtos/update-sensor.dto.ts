import { IsBoolean, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSensorDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  mqttTopic?: string;

  @IsInt()
  @IsOptional()
  globalConfigId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral mínimo debe ser un número' })
  umbralMin?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'El umbral máximo debe ser un número' })
  umbralMax?: number | null;
}
