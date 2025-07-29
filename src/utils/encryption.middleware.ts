// src/middleware/encryption.middleware.ts
import {Middleware} from '@loopback/rest';
import * as crypto from 'crypto';

// Retrieve the RSA private key from environment variables once
const rsaPrivateKey = process.env.RSA_PRIVATE_KEY || '';
if (!rsaPrivateKey) {
  console.warn('RSA_PRIVATE_KEY is not set. Encryption middleware will not function correctly.');
}

export const encryptionMiddleware: Middleware = async (context, next) => {
  const {request, response} = context;

  if (
    process.env.NODE_ENV === 'production' &&
    ['POST', 'PUT', 'PATCH'].includes(request.method) &&
    request.is('application/json')
  ) {
    try {
      const encryptedPayload = request.body;

      const {encryptedAesKey, encryptedData, iv} = encryptedPayload;

      if (!encryptedAesKey || !encryptedData || !iv) {
        throw new Error('Missing encrypted payload components (encryptedAesKey, encryptedData, or iv).');
      }

      const encryptedAesKeyBuffer = Buffer.from(encryptedAesKey, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decryptedAesKey = crypto.privateDecrypt(
        {
          key: rsaPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        encryptedAesKeyBuffer,
      );

      const decipher = crypto.createDecipheriv('aes-256-cbc', decryptedAesKey, ivBuffer);
      let decryptedData = decipher.update(encryptedDataBuffer);
      decryptedData = Buffer.concat([decryptedData, decipher.final()]);

      request.body = JSON.parse(decryptedData.toString('utf8'));

      console.log('Request body decrypted successfully.');
    } catch (error) {
      console.error('EncryptionMiddleware: Decryption failed:', error);
    }
  }

  await next();
};
