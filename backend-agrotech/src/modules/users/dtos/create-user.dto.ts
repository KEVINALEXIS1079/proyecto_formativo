import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsEnum, IsNumberString } from 'class-validator';

export enum UserStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BLOQUEADO = 'bloqueado',
  PENDIENTE_VERIFICACION = 'pendiente_verificacion',
}

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser un texto válido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido: string;

  @IsString({ message: 'La identificación debe ser un string válido' })
  @Matches(/^\d+$/, { message: 'La identificación debe contener solo dígitos' })
  @MaxLength(20, { message: 'La identificación no puede exceder 20 caracteres' })
  identificacion: string;

  @IsOptional()
  @IsString({ message: 'El ID de ficha debe ser un string válido' })
  @MaxLength(20, { message: 'El ID de ficha no puede exceder 20 caracteres' })
  idFicha?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string válido' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El teléfono solo puede contener números y símbolos +, -, (), espacios' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto válido' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado debe ser: activo, inactivo, bloqueado o pendiente_verificacion' })
  estado?: UserStatus;

  @IsOptional()
  emailVerifiedAt?: Date;

  @IsOptional()
  passwordHash?: string;
}
