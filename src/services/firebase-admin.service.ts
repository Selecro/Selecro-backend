import {BindingScope, inject, injectable} from '@loopback/core';
import * as admin from 'firebase-admin';
import {FirebaseBindings} from '../keys';

@injectable({scope: BindingScope.SINGLETON})
export class FirebaseAdminService {
  private readonly firebaseAdmin: typeof admin;

  constructor(@inject(FirebaseBindings.ADMIN) firebaseAdmin: typeof admin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.firebaseAdmin
        .auth()
        .verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      throw new Error('Invalid Firebase ID token.');
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.firebaseAdmin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      console.error('Error getting user from Firebase:', error);
      throw new Error('Firebase user not found.');
    }
  }
}
