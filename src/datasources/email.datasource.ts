import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
dotenv.config();

const config = {
  host: process.env.EMAILHOST,
  secure: true,
  port: Number(process.env.EMAILPORT),
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASSWORD,
  },
};

export const EmailDataSource = nodemailer.createTransport(config);
