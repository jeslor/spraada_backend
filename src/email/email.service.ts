import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { CreateEmailDto } from './dto/create-email.dto';
import { passwordResetTemplate } from './templates/passwordRest';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}
  mailTransport() {
    const host = this.configService.get<string>('EMAIL_HOST');
    const port = this.configService.get<number>('EMAIL_PORT');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASSWORD');

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
    return transport;
  }

  //send email with the reset url to the user
  async sendPasswordResetEmail(email: string, resetLink: string) {
    try {
      const mailOptions: CreateEmailDto = {
        from: this.configService.get('EMAIL_FROM') || '',
        to: [email],
        subject: `Password Reset Request option for Your Spraada Account`,
        html: passwordResetTemplate(resetLink),
      };

      const transport = this.mailTransport();
      const emailSent = await transport.sendMail(mailOptions);
      return emailSent;
    } catch (error) {
      throw error;
    }
  }
}
