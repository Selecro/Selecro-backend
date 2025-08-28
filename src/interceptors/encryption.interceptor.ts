import {inject, Interceptor, InvocationContext, Next, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import * as crypto from 'crypto';
import {SessionRepository} from '../repositories';

const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || `-----BEGIN RSA PRIVATE KEY-----
... your private key here ...
-----END RSA PRIVATE KEY-----`;

export class EncryptionInterceptor implements Provider<Interceptor> {
  constructor(
    @repository(SessionRepository)
    private sessionRepository: SessionRepository,
    @inject(RestBindings.Http.REQUEST) private request: Request,
  ) { }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: Next,
  ) {
    const sessionToken = this.request.cookies['session_token'];

    if (!sessionToken) {
      return next();
    }

    const session = await this.sessionRepository.findOne({where: {session_token: sessionToken}});

    if (this.request.body && typeof this.request.body === 'object') {
      const {encrypted_key, iv, data} = this.request.body;
      if (encrypted_key && iv && data) {
        try {
          const aesKey = crypto.privateDecrypt(
            {
              key: BACKEND_PRIVATE_KEY,
              passphrase: '',
              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            },
            Buffer.from(encrypted_key, 'base64'),
          );

          const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            aesKey,
            Buffer.from(iv, 'base64'),
          );
          let decryptedBody = decipher.update(data, 'base64', 'utf8');
          decryptedBody += decipher.final('utf8');

          invocationCtx.args[0] = JSON.parse(decryptedBody);
        } catch (err) {
          console.error('Decryption failed for incoming request:', err);
          throw new HttpErrors.InternalServerError('Decryption failed.');
        }
      }
    }

    const result = await next();

    if (!session || !session.public_key) {
      console.log('Sending unencrypted response: Session or public key not found.');
      return result;
    }

    try {
      const clientPublicKey = session.public_key;
      const responseAesKey = crypto.randomBytes(32);
      const responseIv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        responseAesKey,
        responseIv,
      );
      let encryptedData = cipher.update(JSON.stringify(result), 'utf8', 'base64');
      encryptedData += cipher.final('base64');

      const encryptedAesKey = crypto.publicEncrypt(
        {key: clientPublicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING},
        responseAesKey,
      ).toString('base64');

      return {
        encrypted_key: encryptedAesKey,
        iv: responseIv.toString('base64'),
        data: encryptedData,
      };
    } catch (err) {
      console.error('Encryption failed for response:', err);
      throw new HttpErrors.InternalServerError('Encryption failed for response.');
    }
  }
}
