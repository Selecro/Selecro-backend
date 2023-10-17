import {UserService} from '@loopback/authentication';
import {Credentials} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.hasher')
    public hasher: BcryptHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const foundUser0 = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    const foundUser1 = await this.userRepository.findOne({
      where: {
        username: credentials.email,
      },
    });
    if (credentials.email.includes('@')) {
      if (!foundUser0) {
        throw new HttpErrors.NotFound(`User not found`);
      }
      const passwordMatched = await this.hasher.comparePassword(
        credentials.password,
        foundUser0.passwordHash,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized('Password is not valid');
      }
      return foundUser0;
    } else {
      if (!foundUser1) {
        throw new HttpErrors.NotFound(`User not found`);
      }
      const passwordMatched = await this.hasher.comparePassword(
        credentials.password,
        foundUser1.passwordHash,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized('Password is not valid');
      }
      return foundUser1;
    }
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      username: user.username,
      id: user.id,
      email: user.email,
    };
  }
}
