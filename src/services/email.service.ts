import {bind, BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import {User} from '../models';
import {UserRepository, UserSettingRepository} from '../repositories';

dotenv.config();

class TemplateNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}

const templateCache = new Map<string, string>();

export interface EmailPayload {
  subject: string;
  templateName: string;
  replacements?: {
    [key: string]: string;
  };
  attachments?: Mail.Attachment[];
}

@injectable({
  scope: BindingScope.SINGLETON,
})
@bind({
  tags: 'email.service',
})
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @repository(UserSettingRepository)
    public userSettingRepository: UserSettingRepository,
    @repository(UserRepository) private userRepository: UserRepository,
  ) {
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      throw new Error(
        'Required email environment variables are not configured.',
      );
    }

    const config = {
      host: process.env.EMAIL_HOST,
      secure: process.env.EMAIL_SECURE === 'true',
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
    this.transporter = nodemailer.createTransport(config);
  }

  private async loadTemplate(templateName: string): Promise<string> {
    if (templateCache.has(templateName)) {
      return templateCache.get(templateName)!;
    }
    const templatePath = path.join(
      __dirname,
      `../templates/${templateName}.html`,
    );
    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      templateCache.set(templateName, template);
      return template;
    } catch (error) {
      throw new TemplateNotFoundError(
        `Template file not found for: ${templateName}`,
      );
    }
  }

  private async getHtmlBody(
    templateName: string,
    replacements: {
      [key: string]: string;
    },
  ): Promise<string> {
    const template = await this.loadTemplate(templateName);
    let html = template;
    for (const key in replacements) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(placeholder, replacements[key]);
    }
    return html;
  }

  private async sendMail(to: string, payload: EmailPayload): Promise<void> {
    const htmlBody = await this.getHtmlBody(
      payload.templateName,
      payload.replacements ?? {},
    );
    const options: Mail.Options = {
      from: process.env.EMAIL_USER,
      to,
      subject: payload.subject,
      html: htmlBody,
      attachments: payload.attachments,
    };

    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('An error occurred while sending the email.');
    }
  }

  public async sendToUser(
    userId: number,
    payload: EmailPayload,
  ): Promise<void> {
    const user: User = await this.userRepository.findById(userId);

    if (!user?.email) {
      console.warn(`User with ID ${userId} not found or has no email.`);
      return;
    }

    payload.replacements = {
      ...payload.replacements,
      username: user.username,
    };

    await this.sendMail(user.email, payload);
  }

  public async sendToAllRegisteredUsers(payload: EmailPayload): Promise<void> {
    const allUsers: User[] = await this.userRepository.find();

    const sendPromises = allUsers
      .filter(user => user.email)
      .map(user => {
        const userPayload: EmailPayload = {
          ...payload,
          replacements: {
            ...payload.replacements,
            username: user.username,
          },
        };
        return this.sendMail(user.email, userPayload);
      });

    await Promise.allSettled(sendPromises);
  }
}
