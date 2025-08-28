// src/services/jwt.service.ts
import {
  JWTService, // Import the JWTService interface
} from '@loopback/authentication-jwt';
import {injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {sign, SignOptions, verify} from 'jsonwebtoken';

@injectable()
export class JwtAuthService extends JWTService {
  // REMOVE this line: private readonly jwtExpiresIn: string;
  // The base class JWTService already handles expiresIn internally from its constructor.

  // You might want to store the secret and expiresIn values if you need to access them directly
  // within *this* class for other purposes, but they should not be 'private' if they conflict
  // with a private property in the base class.
  // Instead, you can make them protected or simply use the values passed to super().
  protected jwtSecretValue: string; // Changed to protected
  protected jwtExpiresInValue: string; // Changed to protected

  constructor() {
    const jwtSecret = process.env.JWT_SECRET ?? 'supersecretjwtkeyforapp';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1h'; // Get it here

    super(jwtSecret, jwtExpiresIn);

    // Store them in protected properties if you need to access them later in this class
    this.jwtSecretValue = jwtSecret;
    this.jwtExpiresInValue = jwtExpiresIn;


    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }
  }

  /**
   * Generates a JWT for the given user profile.
   * Aligned with JWTService interface.
   * @param userProfile The user profile to embed in the token.
   * @param options Optional signing options for jsonwebtoken.
   * @returns The signed JWT string.
   */
  async generateToken(userProfile: UserProfile, options?: SignOptions): Promise<string> {
    try {
      if (!userProfile.id) {
        throw new HttpErrors.BadRequest('User profile must have an ID to generate a token.');
      }

      const signOptions: SignOptions = {
        expiresIn: options?.expiresIn ?? '1h', // Use options or default value
        ...options,
        jwtid: userProfile.id + '-' + Date.now().toString(),
      };

      // Use the secret from the base class (which is set by `super()`)
      // JWTService typically exposes `this.secret` or manages it internally.
      // If `this.jwtSecret` is not available, use `this.jwtSecretValue`
      // The `JWTService` class itself will use the secret provided to its constructor.
      // For `jsonwebtoken.sign`, you pass the secret directly.
      const token = sign(userProfile, this.jwtSecretValue, signOptions); // Use the protected property
      return token;
    } catch (error) {
      console.error('Error generating JWT:', error);
      throw new HttpErrors.InternalServerError('Error generating authentication token.');
    }
  }

  /**
   * Verifies a given JWT and returns the decoded UserProfile.
   * Aligned with JWTService interface.
   * @param token The JWT string to verify.
   * @returns The decoded UserProfile payload of the token.
   * @throws HttpErrors.Unauthorized if the token is invalid or expired.
   */
  async verifyToken(token: string): Promise<UserProfile> {
    try {
      // The `JWTService` base class likely has a `secret` property or uses the one provided in `super()`.
      // If `this.jwtSecret` (from base) is available, use it. Otherwise, use `this.jwtSecretValue`.
      const decoded = verify(token, this.jwtSecretValue); // Use the protected property
      if (typeof decoded === 'string') {
        throw new HttpErrors.Unauthorized('Invalid token format');
      }
      if (!decoded.id) {
        throw new HttpErrors.Unauthorized('Invalid token payload: missing user ID.');
      }
      return decoded as UserProfile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new HttpErrors.Unauthorized('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new HttpErrors.Unauthorized('Invalid token');
        }
      }
      console.error('Error verifying JWT:', error);
      throw new HttpErrors.Unauthorized('Authentication failed');
    }
  }
}
