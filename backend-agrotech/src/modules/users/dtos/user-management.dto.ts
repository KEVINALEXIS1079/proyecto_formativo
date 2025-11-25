import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, IsNumberString, IsNumber } from 'class-validator';

export class CreateUserByAdminDto {
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
  password?: string; // Si no se proporciona, se genera automáticamente

  @IsOptional()
  rolId?: number;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto válido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'El ID de ficha debe ser un string válido' })
  @MaxLength(20, { message: 'El ID de ficha no puede exceder 20 caracteres' })
  idFicha?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string válido' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El teléfono solo puede contener números y símbolos +, -, (), espacios' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser un texto válido' })
  @MaxLength(500, { message: 'La URL del avatar no puede exceder 500 caracteres' })
  avatarUrl?: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual debe ser un texto válido' })
  oldPassword: string;

  @IsString({ message: 'La nueva contraseña debe ser un texto válido' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La nueva contraseña no puede exceder 100 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número' }
  )
  newPassword: string;
}

export class ChangeRoleDto {
  @IsNumber({}, { message: 'El rolId debe ser un número válido' })
  rolId: number;
}

export enum UserStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BLOQUEADO = 'bloqueado',
  PENDIENTE_VERIFICACION = 'pendiente_verificacion',
}

export class ChangeStatusDto {
  @IsString({ message: 'El estado debe ser un texto válido' })
  estado: UserStatus;
}

export class UpdateUserByAdminDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un texto válido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsString({ message: 'La identificación debe ser un string válido' })
  @Matches(/^\d+$/, { message: 'La identificación debe contener solo dígitos' })
  @MaxLength(20, { message: 'La identificación no puede exceder 20 caracteres' })
  identificacion?: string;

  @IsOptional()
  @IsString({ message: 'El ID de ficha debe ser un string válido' })
  @MaxLength(20, { message: 'El ID de ficha no puede exceder 20 caracteres' })
  idFicha?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string válido' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'El teléfono solo puede contener números y símbolos +, -, (), espacios' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo?: string;

  @IsOptional()
  @IsString({ message: 'La URL del avatar debe ser un texto válido' })
  @MaxLength(500, { message: 'La URL del avatar no puede exceder 500 caracteres' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto válido' })
  estado?: UserStatus;
}
