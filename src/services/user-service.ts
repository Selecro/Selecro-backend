import {UserService} from '@loopback/authentication';
import {Credentials} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models'; // Assuming User model is still needed for UserProfile conversion
import {UserSecurityRepository} from '../repositories/user-security.repository'; // Import UserSecurityRepository
import {UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserSecurityRepository) // Inject UserSecurityRepository
    public userSecurityRepository: UserSecurityRepository,
    @inject('services.hasher')
    public hasher: BcryptHasher,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    let foundUser: User | null;

    // Determine if the credential is an email or username
    if (credentials.email.includes('@')) {
      foundUser = await this.userRepository.findOne({
        where: {
          email: credentials.email,
        },
      });
    } else {
      foundUser = await this.userRepository.findOne({
        where: {
          username: credentials.email, // Assuming username is used for non-email logins
        },
      });
    }

    if (!foundUser) {
      throw new HttpErrors.NotFound(`User not found`);
    }

    // Fetch the UserSecurity record for the found user
    const userSecurity = await this.userSecurityRepository.findOne({
      where: {
        userId: foundUser.id, // Assuming pgId is the foreign key in UserSecurity for userId
      },
    });

    if (!userSecurity || !userSecurity.passwordHash) {
      throw new HttpErrors.Unauthorized('User security information or password hash not found');
    }

    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      userSecurity.passwordHash,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Password is not valid');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id?.toString() || '', // Use the uuid as the securityId
      username: user.username,
      id: user.id, // Keep the uuid as 'id' in the profile
      email: user.email,
    };
  }
}
