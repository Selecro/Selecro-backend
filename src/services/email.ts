import {bind, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository'; // Import repository decorator
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import {User} from '../models'; // Import UserSetting model
import {UserSettingRepository} from '../repositories/user-setting.repository'; // Import UserSettingRepository

dotenv.config();

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  readonly domain: string =
    process.env.DEFAULT_PORT === '3002'
      ? 'https://develop.selecro.cz/#'
      : 'https://selecro.cz/#';

  constructor(
    @repository(UserSettingRepository)
    public userSettingRepository: UserSettingRepository,
  ) { }

  private generateVerificationToken(userId: string): string {
    const secret = process.env.JWT_SECRET_EMAIL ?? '';
    const token = jwt.sign({userId}, secret, {
      expiresIn: '1h',
      algorithm: 'HS256',
    });
    return token;
  }

  private async getUserLanguage(userId: number): Promise<string> {
    const userSetting = await this.userSettingRepository.findOne({
      where: {
        userId: userId,
      },
    });
    // Default to 'en' if setting not found or languagePreference is not set
    return userSetting?.languagePreference || 'en';
  }

  async sendRegistrationEmail(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.uuid);
    const url = `${this.domain}/verification?token=${token}`;
    const userLanguage = await this.getUserLanguage(user.id as number); // Assuming id is the userId for UserSetting
    let body = fs.readFileSync(
      `./src/html/registration${userLanguage}.html`,
      'utf-8',
    );
    body = body.replace('{{URL}}', url);
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Registration',
      html: body,
    });
  }
  static sendMail(arg0: {from: string | undefined; to: string | undefined; subject: string; html: string;}) {
    throw new Error('Method not implemented.');
  }

  async sendResetEmail(user: User, email: string | undefined): Promise<void> {
    const token = this.generateVerificationToken(user.uuid);
    const url = `${this.domain}/verication?token=${token}`;
    const userLanguage = await this.getUserLanguage(user.id as number); // Assuming id is the userId for UserSetting
    let body0 = fs.readFileSync(
      `./src/html/verification${userLanguage}.html`,
      'utf-8',
    );
    const body1 = fs.readFileSync(
      `./src/html/emailInfo${userLanguage}.html`,
      'utf-8',
    );
    body0 = body0.replace('{{URL}}', url);
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Selecro: Email verification',
      html: body0,
    });
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Email change',
      html: body1,
    });
  }

  async sendPasswordChange(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.uuid);
    const url = `${this.domain}/passwdchange?token=${token}`;
    const userLanguage = await this.getUserLanguage(user.id as number); // Assuming id is the userId for UserSetting
    let body = fs.readFileSync(
      `./src/html/passwordChange${userLanguage}.html`,
      'utf-8',
    );
    body = body.replace('{{URL}}', url);
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Change password',
      html: body,
    });
  }

  async sendSuccessfulyPasswordChange(user: User): Promise<void> {
    const userLanguage = await this.getUserLanguage(user.id as number); // Assuming id is the userId for UserSetting
    const body = fs.readFileSync(
      `./src/html/successfulyPasswordChange${userLanguage}.html`,
      'utf-8',
    );
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Successfuly changed password',
      html: body,
    });
  }

  async sendError(error: string): Promise<void> {
    await EmailService.sendMail({
      from: process.env.EMAIL_USER,
      to: 'error@selecro.cz',
      subject: 'Selecro: error',
      html: error,
    });
  }
}
