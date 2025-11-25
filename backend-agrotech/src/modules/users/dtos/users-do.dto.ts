import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UsersFindAllDoDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsNumber()
  rolId?: number;

  @IsOptional()
  @IsString()
  estado?: string;
}

export class UsersFindByIdDoDto {
  @IsNumber()
  id: number;
}

export class UsersRemoveDoDto {
  @IsNumber()
  id: number;
}