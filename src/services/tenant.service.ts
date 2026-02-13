import {inject} from '@loopback/context';
import {BindingScope, Context, injectable} from '@loopback/core';
import {RestBindings} from '@loopback/rest';
import {TENANT_BINDING_KEY} from '../keys';

@injectable({
  scope: BindingScope.SINGLETON,
})
export class TenantService {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    private context: Context,
  ) {}

  async getTenantId(): Promise<string> {
    const tenantId = await this.context.get<string | undefined>(
      TENANT_BINDING_KEY,
      {
        optional: true,
      },
    );
    if (!tenantId) {
      throw new Error('Tenant ID not found in the request context.');
    }
    return tenantId;
  }
}
