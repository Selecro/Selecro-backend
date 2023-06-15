import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  host: process.env.SFTPHOST,
  port: Number(process.env.SFTPPORT),
  username: process.env.SFTPUSERNAME,
  password: process.env.SFTPPASSWORD,
};
