// src/services/email.service.ts
import {
  BindingScope,
  injectable
} from '@loopback/core';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// You should define an interface for your email service to make it easier to inject and test.
export interface IEmailService {
  sendEmail(options: Mail.Options): Promise<void>;
}

@injectable({
  scope: BindingScope.SINGLETON
})
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // It's a good practice to load your environment variables here.
    const config = {
      host: process.env.EMAIL_HOST,
      secure: process.env.EMAIL_SECURE === 'true', // Use 'true'/'false' in .env
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendEmail(options: Mail.Options): Promise<void> {
    try {
      await this.transporter.sendMail(options);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error; // Propagate the error so the caller can handle it
    }
  }
}
