import { IsNumber, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class HttpSensorReadingDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsOptional()
  timestamp?: string; // ISO string or date

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}