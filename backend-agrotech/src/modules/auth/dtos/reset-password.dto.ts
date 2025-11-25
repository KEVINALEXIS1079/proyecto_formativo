import { IsEmail, IsString, MinLength, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class RequestResetDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;

  @IsString({ message: 'El código debe ser un texto válido' })
  @IsNotEmpty({ message: 'El código de recuperación es requerido' })
  @MaxLength(10, { message: 'El código no puede exceder 10 caracteres' })
  code: string;

  @IsString({ message: 'La nueva contraseña debe ser un texto válido' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La nueva contraseña no puede exceder 100 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    { message: 'La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número' }
  )
  nuevaPassword: string;
}
