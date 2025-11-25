import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  // Internal property set by service when recalculating costs
  @IsOptional()
  @IsNumber()
  costoMO?: number;
}
