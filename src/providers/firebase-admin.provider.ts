import {
  BindingScope,
  injectable,
  Provider
} from '@loopback/core';
import * as admin from 'firebase-admin';

@injectable({
  scope: BindingScope.SINGLETON,
})
export class FirebaseAdminProvider implements Provider<typeof admin> {
  constructor() { }

  value(): typeof admin {
    const firebaseBase64 = process.env.FIREBASE_ADMIN_BASE64;

    if (!firebaseBase64) {
      console.warn('WARNING: FIREBASE_ADMIN_BASE64 environment variable is not set. Firebase Admin SDK will not be available.');
      return admin;
    }

    try {
      const serviceAccountJson = Buffer.from(firebaseBase64, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      console.log('Firebase Admin SDK initialized successfully.');
      return admin;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      return admin;
    }
  }
}
