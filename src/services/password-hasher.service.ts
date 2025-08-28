import {injectable} from '@loopback/core';
import {compare, genSalt, hash} from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

// Define the interface for your password hashing service
export interface PasswordHasher<T = string> {
  /**
   * Hashes the given password.
   * @param password The plain text password to hash.
   * @returns The hashed password string.
   */
  hashPassword(password: T): Promise<T>;

  /**
   * Compares a plain text password with a hashed password.
   * @param suppliedPassword The plain text password provided by the user.
   * @param storedPassword The hashed password stored in the database.
   * @returns True if the passwords match, false otherwise.
   */
  comparePassword(suppliedPassword: T, storedPassword: T): Promise<boolean>;
}

@injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
  // You can configure the salt rounds (cost factor) from an environment variable
  // or a configuration file if you need it to be dynamic.
  // Higher rounds means more secure but slower hashing. Default is 10.
  readonly saltRounds: number;

  constructor() {
    // Attempt to get salt rounds from environment variable,
    // otherwise use a default (e.g., 10).
    // Ensure that process.env.BCRYPT_SALT_ROUNDS is configured in your .env if desired.
    this.saltRounds = +(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    if (Number.isNaN(this.saltRounds) || this.saltRounds < 10 || this.saltRounds > 31) {
      console.warn(
        `Invalid BCRYPT_SALT_ROUNDS '${process.env.BCRYPT_SALT_ROUNDS}'. ` +
        `Using default salt rounds: 10.`,
      );
      this.saltRounds = 10;
    }
  }

  /**
   * Hashes a plain text password using bcrypt.
   * @param password The plain text password.
   * @returns The hashed password string.
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
    return hash(password, salt);
  }

  /**
   * Compares a plain text password with a hashed password using bcrypt.
   * @param suppliedPassword The plain text password from user input.
   * @param storedPassword The hashed password from the database.
   * @returns A boolean indicating if the passwords match.
   */
  async comparePassword(
    suppliedPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return compare(suppliedPassword, storedPassword);
  }
}
