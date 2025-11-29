import { IsString, IsEmail, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser un texto válido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido: string;

  @IsString({ message: 'La identificación debe ser un texto válido' })
  @MaxLength(20, { message: 'La identificación no puede exceder 20 caracteres' })
  identificacion: string;

  @IsOptional()
  @IsString({ message: 'El ID de ficha debe ser un texto válido' })
  @MaxLength(20, { message: 'El ID de ficha no puede exceder 20 caracteres' })
  idFicha?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string válido' })
  @Matches(/^\d{10}$/, { message: 'El teléfono debe contener exactamente 10 dígitos' })
  telefono?: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;

  @IsString({ message: 'La contraseña debe ser un texto válido' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número' }
  )
  password: string;
}
