import {HttpErrors} from '@loopback/rest';
import * as dotenv from 'dotenv';
import * as isEmail from 'isemail';
dotenv.config();

export function validateCredentials(credentials: {
  email: string;
  password0: string;
  password1: string;
  username: string;
}) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('Invalid Email');
  }

  if (credentials.password0 !== credentials.password1) {
    throw new HttpErrors.UnprocessableEntity('Passwords do not match');
  }

  if (credentials.password0.length <= 8 && credentials.password1.length <= 8) {
    throw new HttpErrors.UnprocessableEntity(
      'Password length should be greater than 8',
    );
  }

  if (credentials.username.length <= 4) {
    throw new HttpErrors.UnprocessableEntity(
      'Username length should be greater than 4',
    );
  }
}
