import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Credentials} from '../controllers/user.controller';
import {User} from '../models';
import {UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.hasher')
    public hasher: BcryptHasher,
  ) {}
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
        throw new HttpErrors.NotFound(`user not found`);
      }
      const passwordMatched = await this.hasher.comparePassword(
        credentials.passwordHash,
        foundUser0.passwordHash,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized('password is not valid');
      }
      return foundUser0;
    } else {
      if (!foundUser1) {
        throw new HttpErrors.NotFound(`user not found`);
      }
      const passwordMatched = await this.hasher.comparePassword(
        credentials.passwordHash,
        foundUser1.passwordHash,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized('password is not valid');
      }
      return foundUser1;
    }
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.name) {
      userName = user.name;
    }
    if (user.surname) {
      userName = user.name ? `${user.name} ${user.surname}` : user.surname;
    }
    return {[securityId]: `${user.id}`, name: userName, email: user.email};
  }
}
