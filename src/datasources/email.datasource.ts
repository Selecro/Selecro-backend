import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
dotenv.config();

const config = {
  host: process.env.EMAIL_HOST,
  secure: true,
  port: Number(process.env.EMAIL_PORT) || 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

export const EmailDataSource = nodemailer.createTransport(config);
