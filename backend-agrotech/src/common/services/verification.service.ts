import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { EmailCode } from '../../modules/auth/entities/email-code.entity';
import { EmailService } from './email.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(EmailCode) private emailCodeRepo: Repository<EmailCode>,
    private emailService: EmailService,
  ) {}

  // Generar código de verificación (6 dígitos, expira en 30 min), guardar en EmailCode, enviar por email
  async generateCode(email: string, tipo: string, usuarioId: number): Promise<void> {
    const code = this.generateRandomCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    const emailCode = this.emailCodeRepo.create({
      usuarioId,
      tipo,
      code,
      expiresAt,
    });

    await this.emailCodeRepo.save(emailCode);

    // Enviar email basado en tipo
    if (tipo === 'verify') {
      await this.emailService.sendVerificationEmail(email, code);
    } else if (tipo === 'reset') {
      await this.emailService.sendPasswordResetEmail(email, code);
    } else {
      throw new BadRequestException('Tipo de verificación no soportado');
    }
  }

  // Verificar código (validar expiración y uso), marcar como usado si válido
  async verifyCode(tipo: string, usuarioId: number, code: string): Promise<boolean> {
    const emailCode = await this.emailCodeRepo.findOne({
      where: {
        usuarioId,
        tipo,
        code,
        usedAt: IsNull(),
      },
    });

    if (!emailCode) {
      return false;
    }

    if (new Date() > emailCode.expiresAt) {
      return false;
    }

    // Marcar como usado
    emailCode.usedAt = new Date();
    await this.emailCodeRepo.save(emailCode);

    return true;
  }

  // Marcar código como usado manualmente
  async markAsUsed(emailCodeId: number): Promise<void> {
    const emailCode = await this.emailCodeRepo.findOne({ where: { id: emailCodeId } });
    if (emailCode) {
      emailCode.usedAt = new Date();
      await this.emailCodeRepo.save(emailCode);
    }
  }

  private generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}