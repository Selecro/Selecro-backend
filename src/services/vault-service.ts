import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

export class VaultService {
  private readonly vaultEndpoint =
    process.env.VAULT_URL ?? '' + process.env.VAULT_PORT ?? '';
  private readonly unsealKeys: string[] = [
    process.env.UNSEAL_KEY_1 ?? '',
    process.env.UNSEAL_KEY_2 ?? '',
    process.env.UNSEAL_KEY_3 ?? '',
  ];
  private readonly rootToken = process.env.ROOT_VAULT_TOKEN ?? '';

  constructor() {
    this.checkAndUnsealIfNeeded().catch(error => {
      throw new Error('Error during initialization:' + error);
    });
  }

  private async checkAndUnsealIfNeeded(): Promise<void> {
    try {
      const response = await fetch(`${this.vaultEndpoint}/v1/sys/seal-status`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Status check error: ${response.statusText}`);
      }
      const responseData = await response.json();
      if (responseData.sealed) {
        await this.unseal();
      }
    } catch (error) {
      throw new Error(`Status check error: ${error.message}`);
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
          throw new Error(`Unseal error`);
        }
      }
    } catch (error) {
      throw new Error(`Unseal error: ${error.message}`);
    }
  }

  async createUser(password: string, id: string): Promise<void> {
    try {
      const data = {
        password: password,
        policies: [String(id)],
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
        throw new Error(`Unable to create user`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  async createUserPolicy(id: string): Promise<void> {
    try {
      let policyData = fs.readFileSync(
        `./src/services/example-user-policy.hcl`,
        'utf-8',
      );
      policyData = policyData.replace('{{id}}', id);
      const response = await fetch(
        `${this.vaultEndpoint}/v1/sys/policy/${id}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
          body: JSON.stringify({data: policyData}),
        },
      );
      if (!response.ok) {
        throw new Error(`Unable to create policy`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
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
        throw new Error(`Unable to create key`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  async updatePassword(password: string, id: string): Promise<void> {
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
        throw new Error(`Unable to update password`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
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
        throw new Error(`Unable to delete user`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
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
        throw new Error(`Unable to delete policy`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
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
        throw new Error(`Unable to delete key`);
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }
}
