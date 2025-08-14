import {
  bind,
  BindingScope,
  injectable
} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import {
  UserLanguagePreference
} from '../models';
import {
  UserRepository,
  UserSettingRepository
} from '../repositories';

dotenv.config();

class TemplateNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}

const templateCache = new Map<string, string>();

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'email.service'
})
export class ZEmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @repository(UserSettingRepository)
    public userSettingRepository: UserSettingRepository,
    @repository(UserRepository) private userRepository: UserRepository,
  ) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Required email environment variables are not configured.');
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

  private async sendMail(options: Mail.Options): Promise<void> {
    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('An error occurred while sending the email.');
    }
  }

  public generateVerificationToken(userId: string): string {
    const secret = process.env.JWT_SECRET_EMAIL;
    if (!secret) {
      throw new Error('JWT_SECRET_EMAIL environment variable is not configured.');
    }

    const token = jwt.sign({
      userId
    }, secret, {
      expiresIn: '1h',
      algorithm: 'HS256',
    });
    return token;
  }

  private async readHtmlTemplate(templateName: string, language: UserLanguagePreference, replacements: {
    [key: string]: string
  } = {}): Promise<string> {
    const cacheKey = `${templateName}-${language}`;
    if (templateCache.has(cacheKey)) {
      let body = templateCache.get(cacheKey)!;
      for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        body = body.replace(regex, replacements[key]);
      }
      return body;
    }

    let body: string;
    try {
      const templatePath = path.resolve(__dirname, `../html/${templateName}-${language}.html`);
      body = await fs.promises.readFile(templatePath, 'utf-8');
    } catch (error) {
      try {
        const defaultTemplatePath = path.resolve(__dirname, `../html/${templateName}-cz.html`);
        body = await fs.promises.readFile(defaultTemplatePath, 'utf-8');
      } catch (defaultError) {
        throw new TemplateNotFoundError(`Template "${templateName}" not found for language "${language}" or default "cz".`);
      }
    }

    for (const key in replacements) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      body = body.replace(regex, replacements[key]);
    }

    templateCache.set(cacheKey, body);
    return body;
  }

  public async sendTemplatedEmail(to: string, subject: {
    [key in UserLanguagePreference]: string
  }, templateName: string, userId: string, replacements: {
    [key: string]: string
  } = {}, attachments: Mail.Attachment[] = []): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userId
      },
      include: [{
        relation: 'userSetting'
      }]
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const userLanguage = user.userSetting?.user_language_preference as UserLanguagePreference || UserLanguagePreference.CZ;

    replacements.username = replacements.username || user.username || 'there';

    const body = await this.readHtmlTemplate(templateName, userLanguage, replacements);

    await this.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject[userLanguage],
      html: body,
      attachments: attachments,
    });
  }

  public async sendError(error: string): Promise<void> {
    await this.sendMail({
      from: process.env.EMAIL_USER,
      to: 'error@selecro.cz',
      subject: 'Selecro: error',
      html: error,
    });
  }
}
