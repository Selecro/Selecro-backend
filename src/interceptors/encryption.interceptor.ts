import {
  BindingKey,
  inject,
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import crypto from 'crypto';

// Interface for the expected request body structure
interface EncryptedRequestPayload {
  encryptedData: string;       // Base64
  encryptedAesKey: string;     // Base64
  iv: string;                  // Base64 (for request AES decryption)
  frontendPublicKey: string;   // Base64 encoded PEM public key string
}

// Interface for the response body structure to be sent back
interface EncryptedResponsePayload {
  encryptedResponseData: string; // Base64
  encryptedResponseAesKey: string; // Base64
  responseIv: string;            // Base64 (for response AES decryption)
}

/**
 * This interceptor decrypts incoming requests and encrypts outgoing responses.
 */
@injectable({tags: {key: EncryptDecryptInterceptor.BINDING_KEY}})
export class EncryptDecryptInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = BindingKey.create<EncryptDecryptInterceptor>(
    'interceptors.EncryptDecryptInterceptor',
  );

  // Define a unique key to store the frontend public key within the invocation context
  private readonly FE_PUB_KEY_CTX_KEY =
    'interceptors.EncryptDecryptInterceptor.frontendPublicKey';

  constructor(
    @inject(RestBindings.Http.REQUEST) protected request: Request,
    // Optionally inject configuration for key paths, algorithms etc.
    // @inject('config.encryption') private encryptionConfig: any
  ) { }

  /**
   * @returns The interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The actual interception logic for request and response.
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or controller method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): Promise<InvocationResult> {
    // --- Shared Configuration ---
    const backendPrivateKeyPem = process.env.PRIVATE_RSA_KEY_PEM; // Load securely!
    if (!backendPrivateKeyPem) {
      console.error('FATAL: PRIVATE_RSA_KEY_PEM environment variable not set.');
      throw new HttpErrors.InternalServerError('Server configuration error.');
    }
    // Consistent algorithms and padding MUST be used across frontend and backend
    const requestAesAlgorithm = 'aes-256-cbc';
    const responseAesAlgorithm = 'aes-256-cbc'; // Can be the same or different if needed
    const rsaPadding = crypto.constants.RSA_PKCS1_OAEP_PADDING;
    const hashAlgorithm = 'sha256'; // For OAEP

    // --- 1. Request Decryption (Before `next()`) ---
    try {
      // Only process requests that should contain encrypted body
      if (this.request.body && ['POST', 'PUT', 'PATCH'].includes(this.request.method)) {
        console.log('EncryptDecryptInterceptor: Processing incoming encrypted request...');
        const payload = this.request.body as EncryptedRequestPayload;

        // Validate all required fields are present
        if (
          !payload.encryptedData ||
          !payload.encryptedAesKey ||
          !payload.iv ||
          !payload.frontendPublicKey
        ) {
          throw new HttpErrors.BadRequest(
            'Missing required encrypted fields: encryptedData, encryptedAesKey, iv, frontendPublicKey',
          );
        }

        // Decode Base64 inputs for request decryption
        const encryptedAesKeyBuffer = Buffer.from(payload.encryptedAesKey, 'base64');
        const encryptedDataBuffer = Buffer.from(payload.encryptedData, 'base64');
        const ivBuffer = Buffer.from(payload.iv, 'base64');
        const frontendPublicKeyPemBase64 = payload.frontendPublicKey;

        // Decode and Store Frontend Public Key for later (response encryption)
        // Basic validation: check if it starts like a PEM key after decoding
        const frontendPublicKeyPem = Buffer.from(frontendPublicKeyPemBase64, 'base64').toString('utf8');
        if (!frontendPublicKeyPem.startsWith('-----BEGIN PUBLIC KEY-----')) {
          throw new HttpErrors.BadRequest('Invalid frontendPublicKey format (expected Base64 encoded PEM).');
        }
        invocationCtx.bind(this.FE_PUB_KEY_CTX_KEY).to(frontendPublicKeyPem);
        console.log('EncryptDecryptInterceptor: Stored frontend public key.');


        // --- RSA Decryption (Request AES Key) ---
        const decryptedAesKey = crypto.privateDecrypt(
          {
            key: backendPrivateKeyPem,
            padding: rsaPadding,
            oaepHash: hashAlgorithm,
          },
          encryptedAesKeyBuffer,
        );

        // --- AES Decryption (Request Data) ---
        if (requestAesAlgorithm === 'aes-256-cbc' && ivBuffer.length !== 16) {
          throw new HttpErrors.BadRequest(`Invalid IV length for request decryption. Expected 16 bytes for AES-256-CBC, got ${ivBuffer.length}.`);
        }
        const decipher = crypto.createDecipheriv(requestAesAlgorithm, decryptedAesKey, ivBuffer);
        let decryptedData = decipher.update(encryptedDataBuffer);
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);
        const decryptedJsonString = decryptedData.toString('utf8');

        // --- Parse & Replace Request Body ---
        let originalJsonObject: object;
        try {
          originalJsonObject = JSON.parse(decryptedJsonString);
        } catch (parseError) {
          console.error('EncryptDecryptInterceptor: Failed to parse decrypted request data.', parseError);
          throw new HttpErrors.BadRequest('Decrypted request data is not valid JSON.');
        }

        // Replace argument in invocation context (adjust index if needed)
        const bodyArgIndex = invocationCtx.args.findIndex(arg => arg === payload);
        if (bodyArgIndex !== -1) {
          invocationCtx.args[bodyArgIndex] = originalJsonObject;
          console.log(`EncryptDecryptInterceptor: Request body decrypted and replaced at arg index ${bodyArgIndex}.`);
        } else {
          console.warn("EncryptDecryptInterceptor: Could not find exact request body in args. Assuming first argument.");
          // Add more robust check based on your argument structure if needed
          if (invocationCtx.args.length > 0 && typeof invocationCtx.args[0] === 'object' && invocationCtx.args[0] !== null && 'encryptedData' in invocationCtx.args[0]) {
            invocationCtx.args[0] = originalJsonObject;
            console.log("EncryptDecryptInterceptor: Request body decrypted and replaced at arg index 0 (fallback).");
          } else {
            console.error("EncryptDecryptInterceptor: Failed to replace request body argument. Controller might receive encrypted data.");
            // Consider throwing an error if replacement is critical
          }
        }

      } else {
        console.log('EncryptDecryptInterceptor: Skipping request decryption (no body/irrelevant method).');
      }
    } catch (error) {
      console.error('EncryptDecryptInterceptor: Request decryption failed!', error);
      if (error instanceof HttpErrors.HttpError) {
        throw error; // Re-throw known HTTP errors
      }
      throw new HttpErrors.BadRequest('Invalid encrypted request or decryption failed.');
    }

    // --- 2. Call Controller Method (`next()`) ---
    console.log('EncryptDecryptInterceptor: Proceeding to controller...');
    const originalResult = await next(); // This is the response from the controller

    // --- 3. Response Encryption (After `next()`) ---
    try {
      // Retrieve the frontend public key stored earlier
      const frontendPublicKeyPem = await invocationCtx.get<string>(this.FE_PUB_KEY_CTX_KEY, {optional: true});

      // Only encrypt the response if we have the public key and a result exists
      if (frontendPublicKeyPem && originalResult != null) {
        console.log('EncryptDecryptInterceptor: Encrypting controller response...');

        // --- Generate NEW AES Key and IV for the response ---
        const responseAesKey = crypto.randomBytes(32); // 256-bit key
        const responseIv = crypto.randomBytes(16); // 16-byte IV for AES-CBC

        // --- AES Encryption (Response Data) ---
        const responseJsonString = JSON.stringify(originalResult);
        const responseCipher = crypto.createCipheriv(responseAesAlgorithm, responseAesKey, responseIv);
        let encryptedResponseData = responseCipher.update(responseJsonString, 'utf8');
        encryptedResponseData = Buffer.concat([encryptedResponseData, responseCipher.final()]);

        // --- RSA Encryption (Response AES Key using Frontend's Public Key) ---
        const encryptedResponseAesKey = crypto.publicEncrypt(
          {
            key: frontendPublicKeyPem, // Use the public key provided by the frontend
            padding: rsaPadding,
            oaepHash: hashAlgorithm,
          },
          responseAesKey, // Encrypt the generated response AES key
        );

        // --- Construct Final Encrypted Payload ---
        const encryptedResponsePayload: EncryptedResponsePayload = {
          encryptedResponseData: encryptedResponseData.toString('base64'),
          encryptedResponseAesKey: encryptedResponseAesKey.toString('base64'),
          responseIv: responseIv.toString('base64'),
        };

        console.log('EncryptDecryptInterceptor: Response encrypted successfully.');
        // Return the encrypted payload INSTEAD of the original controller result
        return encryptedResponsePayload;

      } else {
        // If no public key was found or result is null/undefined, return the original result
        if (!frontendPublicKeyPem) {
          console.log('EncryptDecryptInterceptor: Skipping response encryption (no frontend public key was provided/stored).');
        } else {
          console.log('EncryptDecryptInterceptor: Skipping response encryption (controller result is null/undefined).');
        }
        return originalResult;
      }
    } catch (error) {
      console.error('EncryptDecryptInterceptor: Response encryption failed!', error);
      // Avoid leaking details to the client, log server-side.
      throw new HttpErrors.InternalServerError('Failed to encrypt the server response.');
    }
  }
}
