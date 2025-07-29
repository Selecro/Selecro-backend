import {injectable} from '@loopback/core';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
dotenv.config();

// Define the interface for the email service
export interface EmailService {
  sendEmail(options: Mail.Options): Promise<void>;
}

@injectable()
export class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    // You could inject a config object here if you prefer,
    // but for simplicity, we'll use process.env directly.
    // @inject('application.config.emailService', {optional: true})
    // private emailConfig?: object,
  ) {
    // Retrieve SMTP configuration from environment variables
    const emailHost = process.env.EMAIL_HOST ?? 'smtp.example.com';
    const emailPort = +(process.env.EMAIL_PORT ?? 587); // Common SMTP port, often 587 or 465
    const emailUser = process.env.EMAIL_USER ?? '';
    const emailPassword = process.env.EMAIL_PASSWORD ?? '';
    const emailSecure = emailPort === 465; // Use SSL if port is 465

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      connectionTimeout: 5000, // Optional: Set a timeout for the connection
      greetingTimeout: 5000, // Optional: Set a timeout for the greeting response
      logger: true, // Optional: Enable logging for debugging
      debug: process.env.NODE_ENV === 'development', // Optional: Enable debug mode in development
    });
  }

  async sendEmail(options: Mail.Options): Promise<void> {
    try {
      // Send mail with defined transport object
      const info = await this.transporter.sendMail(options);
      console.log('Message sent: %s', info.messageId);
      // Optional: Log preview URL if using ethereal.email for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email: ' + (error as Error).message);
    }
  }
}
