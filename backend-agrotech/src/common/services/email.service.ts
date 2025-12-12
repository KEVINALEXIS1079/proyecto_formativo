import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendAdminNewUserNotification(to: string, data: { nombre: string; correo: string }) {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to,
      subject: 'Nuevo Usuario Registrado - Requiere Aprobación',
      html: `
        <h1>Nuevo Usuario Registrado</h1>
        <p>Un nuevo usuario se ha registrado y requiere tu aprobación para acceder al sistema.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${data.nombre}</p>
          <p><strong>Correo:</strong> ${data.correo}</p>
        </div>
        <p>Por favor, ingresa al sistema para aprobar o rechazar esta solicitud.</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(to: string, code: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to,
      subject: 'Verificación de correo - Agrotech',
      html: `
        <h1>Bienvenido a Agrotech</h1>
        <p>Tu código de verificación es:</p>
        <h2 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${code}</h2>
        <p>Este código expira en 30 minutos.</p>
        <p>Si no solicitaste este código, ignora este correo.</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, code: string) {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to,
      subject: 'Recuperación de contraseña - Agrotech',
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Tu código de recuperación es:</p>
        <h2 style="color: #FF5722; font-size: 32px; letter-spacing: 5px;">${code}</h2>
        <p>Este código expira en 30 minutos.</p>
        <p>Si no solicitaste este código, ignora este correo y tu contraseña permanecerá sin cambios.</p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(to: string, data: { nombre: string; correo: string; password: string }) {
    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to,
      subject: 'Bienvenido a Agrotech - Credenciales de Acceso',
      html: `
        <h1>Bienvenido a Agrotech, ${data.nombre}!</h1>
        <p>Tu cuenta ha sido creada exitosamente. A continuación tus credenciales de acceso:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Correo:</strong> ${data.correo}</p>
          <p><strong>Contraseña temporal:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px;">${data.password}</code></p>
        </div>
        <p><strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
        <p>Puedes acceder al sistema en: <a href="http://localhost:3000">http://localhost:3000</a></p>
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
