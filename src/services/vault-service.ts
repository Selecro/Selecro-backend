import {HttpErrors} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

export class VaultService {
  private readonly vaultEndpoint = process.env.VAULT_ENDPOINT ?? '';
  private readonly unsealKeys: string[] = [
    process.env.UNSEAL_KEY_1 ?? '',
    process.env.UNSEAL_KEY_2 ?? '',
    process.env.UNSEAL_KEY_3 ?? '',
  ];
  private readonly rootToken = process.env.ROOT_VAULT_TOKEN ?? '';

  constructor() {
    this.checkAndUnsealIfNeeded().catch(async error => {
      console.error('Error during initialization: ' + error);
      throw new HttpErrors.InternalServerError('Error during initialization');
    });
  }

  private async checkAndUnsealIfNeeded(): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/sys/seal-status`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) {
        console.error(
          String('Status check error: ' + JSON.stringify(response, null, 2)),
        );
        throw new HttpErrors.InternalServerError('Status check error');
      }
      const responseData = await response.json();
      if (responseData.sealed) {
        await this.unseal();
      }
    } catch (error) {
      console.error('Status check error: ' + error);
      throw new HttpErrors.InternalServerError('Status check error');
    }
  }

  private async unseal(): Promise<void> {
    try {
      const unsealKeys: string[] = [
        this.unsealKeys[0],
        this.unsealKeys[1],
        this.unsealKeys[2],
      ];
      for (const key of unsealKeys) {
        const response = await fetch(`${this.vaultEndpoint}/v1/sys/unseal`, {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: key,
          }),
        });
        if (!response.ok) {
          console.error(
            String('Unseal error: ' + JSON.stringify(response, null, 2)),
          );
          throw new HttpErrors.InternalServerError('Unseal error');
        }
      }
    } catch (error) {
      console.error('Unseal error: ' + error);
      throw new HttpErrors.InternalServerError('Unseal error');
    }
  }

  async createUser(id: string, password: string): Promise<void> {
    try {
      const data = {
        password: password,
        policies: [`acl/${id}`],
      };
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/users/${id}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        console.error(
          String('Unable to create user: ' + JSON.stringify(response, null, 2)),
        );
        throw new HttpErrors.InternalServerError('Unable to create user');
      }
    } catch (error) {
      console.error('Unable to create user: ' + error);
      throw new HttpErrors.InternalServerError('Unable to create user');
    }
  }

  async createUserPolicy(id: string): Promise<void> {
    const policyData = {
      name: '{{id}}',
      policy: `path "transit/encrypt/{{id}}" {
  capabilities = ["update"]
}
path "transit/decrypt/{{id}}" {
  capabilities = ["update"]
}
path "auth/token/renew-self" {
  capabilities = ["update"]
}
path "auth/userpass/login/*" {
  capabilities = ["create"]
}`,
    };
    policyData.name = policyData.name.replace(/{{id}}/g, id);
    policyData.policy = policyData.policy.replace(/{{id}}/g, id);
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/sys/policy/acl/${id}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
          body: JSON.stringify(policyData),
        },
      );
      if (!response.ok) {
        console.error(
          String(
            'Unable to create policy: ' + JSON.stringify(response, null, 2),
          ),
        );
        throw new HttpErrors.InternalServerError('Unable to create policy');
      }
    } catch (error) {
      console.error('Unable to create policy: ' + error);
      throw new HttpErrors.InternalServerError('Unable to create policy');
    }
  }

  async createUserKey(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/transit/keys/${id}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
        },
      );
      if (!response.ok) {
        console.error(
          String('Unable to create key: ' + JSON.stringify(response, null, 2)),
        );
        throw new HttpErrors.InternalServerError('Unable to create key');
      }
    } catch (error) {
      console.error('Unable to create key: ' + error);
      throw new HttpErrors.InternalServerError('Unable to create key');
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      const data = {
        password: password,
      };
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/users/${id}/password`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        console.error(
          String(
            'Unable to update password: ' + JSON.stringify(response, null, 2),
          ),
        );
        throw new HttpErrors.InternalServerError('Unable to update password');
      }
    } catch (error) {
      console.error('Unable to update password: ' + error);
      throw new HttpErrors.InternalServerError('Unable to update password');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/users/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
        },
      );
      if (!response.ok) {
        console.error(
          String('Unable to delete user: ' + JSON.stringify(response, null, 2)),
        );
        throw new HttpErrors.InternalServerError('Unable to delete user');
      }
    } catch (error) {
      console.error('Unable to delete user: ' + error);
      throw new HttpErrors.InternalServerError('Unable to delete user');
    }
  }

  async deleteUserPolicy(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/sys/policy/acl/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
        },
      );
      if (!response.ok) {
        console.error(
          String(
            'Unable to delete policy: ' + JSON.stringify(response, null, 2),
          ),
        );
        throw new HttpErrors.InternalServerError('Unable to delete policy');
      }
    } catch (error) {
      console.error('Unable to delete policy: ' + error);
      throw new HttpErrors.InternalServerError('Unable to delete policy');
    }
  }

  async deleteUserKey(id: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/transit/keys/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
        },
      );
      if (!response.ok) {
        console.error(
          String('Unable to delete key: ' + JSON.stringify(response, null, 2)),
        );
        throw new HttpErrors.InternalServerError('Unable to delete key');
      }
    } catch (error) {
      console.error('Unable to delete key: ' + error);
      throw new HttpErrors.InternalServerError('Unable to delete key');
    }
  }
}
