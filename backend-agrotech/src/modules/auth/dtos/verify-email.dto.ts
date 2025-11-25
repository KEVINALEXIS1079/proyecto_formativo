import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;

  @IsString({ message: 'El código debe ser un texto válido' })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @MaxLength(10, { message: 'El código no puede exceder 10 caracteres' })
  code: string;
}
