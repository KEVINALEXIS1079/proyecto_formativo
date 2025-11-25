import { IsEmail, MaxLength } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  correo: string;
}
