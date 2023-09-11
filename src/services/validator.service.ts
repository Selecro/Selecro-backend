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
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }

  if (credentials.password0 !== credentials.password1) {
    throw new HttpErrors.UnprocessableEntity('passwords do not match');
  }

  if (credentials.password0.length <= 8 && credentials.password1.length <= 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8',
    );
  }

  if (credentials.username.length <= 4) {
    throw new HttpErrors.UnprocessableEntity(
      'username length should be greater than 4',
    );
  }
}
