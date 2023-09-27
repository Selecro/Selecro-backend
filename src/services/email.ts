import {bind, BindingScope} from '@loopback/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';
import {EmailDataSource} from '../datasources';
import {User} from '../models';
dotenv.config();

@bind({scope: BindingScope.TRANSIENT})
export class EmailService {
  constructor() { }

  public generateVerificationToken(userId: string): string {
    const secret = process.env.JWT_SECRET_EMAIL ?? '';
    const token = jwt.sign({userId}, secret, {
      expiresIn: '1h',
      algorithm: 'HS256',
    });
    return token;
  }

  async sendRegistrationEmail(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/verification?token=${token}`;
    let body = fs.readFileSync(
      `./src/html/registration${user.language}.html`,
      'utf-8',
    );
    body = body.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Registration',
      html: body,
    });
  }

  async sendResetEmail(user: User, email: string | undefined): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/verication?token=${token}`;
    let body0 = fs.readFileSync(
      `./src/html/verification${user.language}.html`,
      'utf-8',
    );
    const body1 = fs.readFileSync(
      `./src/html/emailInfo${user.language}.html`,
      'utf-8',
    );
    body0 = body0.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Selecro: Email verification',
      html: body0,
    });
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Email change',
      html: body1,
    });
  }

  async sendPasswordChange(user: User): Promise<void> {
    const token = this.generateVerificationToken(user.id);
    const url = `https://selecro.cz/passwdchange?token=${token}`;
    let body = fs.readFileSync(
      `./src/html/passwordChange${user.language}.html`,
      'utf-8',
    );
    body = body.replace('{{URL}}', url);
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Change password',
      html: body,
    });
  }

  async sendSuccessfulyPasswordChange(user: User): Promise<void> {
    const body = fs.readFileSync(
      `./src/html/successfulyPasswordChange${user.language}.html`,
      'utf-8',
    );
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Selecro: Successfuly changed password',
      html: body,
    });
  }

  async sendError(error: string): Promise<void> {
    await EmailDataSource.sendMail({
      from: process.env.EMAIL_USER,
      to: 'error@selecro.cz',
      subject: 'Selecro: error',
      html: error,
    });
  }
}
