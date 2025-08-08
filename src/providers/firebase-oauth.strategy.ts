import {
  AuthenticationStrategy
} from '@loopback/authentication';
import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import admin from 'firebase-admin';
import {FirebaseBindings} from '../keys';
import {User} from '../models';
import {OauthAccountRepository} from '../repositories/oauth-account.repository';
import {UserRepository} from '../repositories/user.repository';
import {FirebaseAdminService} from '../services/firebase-admin.service';

@injectable({scope: BindingScope.TRANSIENT})
export class FirebaseOauthStrategy implements AuthenticationStrategy {
  name = 'firebase-oauth';

  constructor(
    @inject(FirebaseBindings.ADMIN_SERVICE)
    private firebaseAdminService: FirebaseAdminService,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(OauthAccountRepository) private oauthAccountRepository: OauthAccountRepository,
  ) { }

  async authenticate(request: Request): Promise<UserProfile> {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new HttpErrors.Unauthorized('Authorization header not found.');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpErrors.Unauthorized('Invalid Authorization header format.');
    }
    const idToken = parts[1];

    try {
      const decodedToken = await this.firebaseAdminService.verifyIdToken(idToken);
      const firebaseUser = await this.firebaseAdminService.getUserByUid(decodedToken.uid);
      const user = await this.findOrCreateUser(decodedToken, firebaseUser);

      const userProfile: UserProfile = {
        [securityId]: user.id.toString(),
        name: user.username ?? '',
        email: user.email ?? '',
        id: user.id,
      };

      return userProfile;

    } catch (error) {
      console.error('Authentication failed:', error);
      throw new HttpErrors.Unauthorized('Authentication failed. Invalid token or user data.');
    }
  }


  private async findOrCreateUser(decodedToken: admin.auth.DecodedIdToken, firebaseUser: admin.auth.UserRecord): Promise<User> {
    const provider = decodedToken.firebase.sign_in_provider;
    if (!provider) {
      throw new Error('Sign-in provider not found in Firebase token.');
    }
    const providerUserId = decodedToken.uid;

    const existingOauthAccount = await this.oauthAccountRepository.findOne({
      where: {provider: provider, provider_user_id: providerUserId},
    });

    if (existingOauthAccount) {
      return this.userRepository.findById(existingOauthAccount.user_id);
    } else {
      const newUser = await this.userRepository.create({
        email: firebaseUser.email,
        username: firebaseUser.displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const newOauthAccount = await this.oauthAccountRepository.create({
        user_id: newUser.id,
        provider,
        provider_user_id: providerUserId,
        access_token: decodedToken.sub, created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return newUser;
    }
  }
}
