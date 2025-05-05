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
// You would typically integrate a proper CSRF library (like csurf adapted)
// and session management here.

@injectable({tags: {key: CsrfProtectionInterceptor.BINDING_KEY}})
export class CsrfProtectionInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = BindingKey.create<CsrfProtectionInterceptor>(
    'interceptors.CsrfProtectionInterceptor',
  );

  constructor(
    @inject(RestBindings.Http.REQUEST) protected request: Request,
    // *** Inject your Session Management service/component here ***
    // e.g. @inject('services.SessionService') private sessionService: SessionService,
  ) { }

  value() {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): Promise<InvocationResult> {
    const method = this.request.method.toUpperCase();
    const requiresProtection = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    if (!requiresProtection) {
      // Skip CSRF check for non-state-changing methods
      return next();
    }

    console.log('CsrfProtectionInterceptor: Validating CSRF token...');

    // 1. Extract token from header (adjust if using body)
    const submittedToken = this.request.headers['x-csrf-token'] as string | undefined;
    if (!submittedToken) {
      console.warn('CSRF Token missing from X-CSRF-Token header');
      throw new HttpErrors.Forbidden('CSRF token missing.');
    }

    // 2. Get expected token/secret from session (IMPLEMENT THIS BASED ON YOUR SESSION LOGIC)
    const expectedTokenOrSecret = await this.getExpectedCsrfValueFromSession();
    if (!expectedTokenOrSecret) {
      console.error('Failed to retrieve expected CSRF value from session.');
      // Avoid revealing details, could be session timeout or config error
      throw new HttpErrors.Forbidden('CSRF validation failed (session state).');
    }


    // 3. Verify token (IMPLEMENT THIS USING CSRF LIBRARY OR SECURE COMPARE)
    const isValid = this.verifyCsrfToken(submittedToken, expectedTokenOrSecret);
    if (!isValid) {
      console.warn(`Invalid CSRF token received: ${submittedToken}`);
      throw new HttpErrors.Forbidden('Invalid CSRF token.');
    }

    console.log('CsrfProtectionInterceptor: CSRF token validated successfully.');
    // If valid, proceed to the next interceptor (EncryptDecryptInterceptor)
    return next();
  }

  // --- Placeholder methods - Replace with actual logic ---

  private async getExpectedCsrfValueFromSession(): Promise<string | undefined> {
    // *** Replace with your actual session logic ***
    // This needs to securely retrieve the token/secret stored for the current user's session
    console.warn('TODO: Implement getExpectedCsrfValueFromSession()');
    // Example: return this.sessionService.getCurrentCsrfSecret(this.request);
    return process.env.DUMMY_CSRF_SECRET; // Replace with real session lookup!
  }

  private verifyCsrfToken(submitted: string, expected: string): boolean {
    // *** Replace with actual verification logic from a library (e.g., csurf) or timing-safe compare ***
    console.warn('TODO: Implement verifyCsrfToken() securely');
    // Example: return Tokens.verify(expectedSecret, submittedToken); // Using 'csrf' library pattern
    return submitted === expected; // Basic, potentially insecure compare - AVOID IN PRODUCTION
  }
}
