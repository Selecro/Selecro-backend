import {UserService} from '@loopback/authentication';
import {Credentials} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('services.hasher')
    public hasher: BcryptHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    let foundUser: User | null;

    const query = credentials.email.includes('@')
      ? {email: credentials.email}
      : {username: credentials.email};

    foundUser = await this.userRepository.findOne({where: query});

    if (!foundUser) {
      throw new HttpErrors.NotFound(`User not found`);
    }

    if (!foundUser.passwordHash) {
      throw new HttpErrors.Unauthorized('User password hash not found');
    }

    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.passwordHash,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id?.toString() || '',
      username: user.username,
      id: user.id,
      email: user.email,
    };
  }
}
