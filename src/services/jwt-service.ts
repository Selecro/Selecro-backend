// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService} from '@loopback/authentication';
import {TokenObject} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {promisify} from 'util';
import {EmailService} from '.';
import {UserRepository} from '../repositories';
import {MyUserService} from './user-service';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject('authentication.jwt.secret')
    private jwtSecret: string,
    @inject('authentication.jwt.expiresIn')
    private jwtExpiresIn: string,
    @inject('services.email')
    public emailService: EmailService,
    @inject('services.user.service')
    public userService: MyUserService,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }
    let userProfile: UserProfile;
    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: '', username: ''},
        {
          [securityId]: decodedToken.id,
          username: decodedToken.username,
          id: decodedToken.id,
        },
      );
    } catch (error) {
      await this.emailService.sendError('Error verifying token:' + error);
      throw new HttpErrors.Unauthorized(`Error verifying token`);
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    const userInfoForToken = {
      id: userProfile[securityId],
      username: userProfile.username,
      email: userProfile.email,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret, {
        expiresIn: this.jwtExpiresIn,
      });
    } catch (error) {
      await this.emailService.sendError('Error encoding token:' + error);
      throw new HttpErrors.Unauthorized(`Error encoding token`);
    }
    return token;
  }

  async refreshToken(refreshToken: string): Promise<TokenObject> {
    try {
      if (!refreshToken) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token : 'refresh token' is null`,
        );
      }
      const userRefreshData = await this.verifyToken(refreshToken);
      const user = await this.userRepository.findById(
        userRefreshData.userId.toString(),
      );
      const userProfile: UserProfile =
        this.userService.convertToUserProfile(user);
      // create a JSON Web Token based on the user profile
      const token = await this.generateToken(userProfile);
      return {
        accessToken: token,
      };
    } catch (error) {
      await this.emailService.sendError(`Error verifying token: ` + error);
      throw new HttpErrors.Unauthorized(`Error verifying token`);
    }
  }
}
