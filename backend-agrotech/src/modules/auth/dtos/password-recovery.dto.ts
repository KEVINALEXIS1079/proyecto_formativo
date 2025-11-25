import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  correo: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'El correo debe ser válido' })
  correo: string;

  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString({ message: 'El código debe ser un texto' })
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  code: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  nuevaPassword: string;
}
