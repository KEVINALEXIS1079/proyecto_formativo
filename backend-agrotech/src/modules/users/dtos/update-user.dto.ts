import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  correo?: string;
  
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString({ message: 'La identificación debe ser un string válido' })
  @Matches(/^\d+$/, { message: 'La identificación debe contener solo dígitos' })
  identificacion?: string;

  // Internal use only - set by service when password is provided
  passwordHash?: string;
}
