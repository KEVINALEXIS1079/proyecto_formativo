import { IsNumber } from 'class-validator';
import { CreateActivityDto } from './create-activity.dto';
import { UpdateActivityDto } from './update-activity.dto';

export class ActivitiesCreateDoDto extends CreateActivityDto {}

export class ActivitiesFindAllDoDto {
  // Add filters if needed, e.g., @IsOptional() @IsString() q?: string;
}

export class ActivitiesFindOneDoDto {
  @IsNumber()
  id: number;
}

export class ActivitiesUpdateDoDto {
  @IsNumber()
  id: number;

  data: UpdateActivityDto;
}

export class ActivitiesRemoveDoDto {
  @IsNumber()
  id: number;
}