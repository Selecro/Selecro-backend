import {BindingScope, injectable, Provider} from '@loopback/core';
import * as admin from 'firebase-admin';

@injectable({
  scope: BindingScope.SINGLETON,
})
export class FirebaseAdminProvider implements Provider<Promise<typeof admin>> {
  constructor() {}

  async value(): Promise<typeof admin> {
    const firebaseBase64 = process.env.FIREBASE_ADMIN_BASE64;

    if (!firebaseBase64) {
      const errorMsg =
        'CRITICAL ERROR: FIREBASE_ADMIN_BASE64 environment variable is not set. Aborting app startup.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (admin.apps.length) {
      console.warn('Firebase Admin SDK is already initialized.');
      return admin;
    }

    try {
      const serviceAccountJson = Buffer.from(firebaseBase64, 'base64').toString(
        'utf8',
      );
      const serviceAccount = JSON.parse(serviceAccountJson);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      return admin;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      throw new Error(
        `Failed to initialize Firebase Admin SDK: ${error.message}`,
      );
    }
  }
}
