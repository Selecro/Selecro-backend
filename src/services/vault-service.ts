import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

export class VaultService {
  private readonly vaultEndpoint = process.env.VAULT_URL ?? '';
  private readonly unsealKeys: string[] = [
    process.env.UNSEAL_KEY_1 ?? '',
    process.env.UNSEAL_KEY_2 ?? '',
  ];
  private readonly rootToken = process.env.ROOT_VAULT ?? '';

  constructor() {
    this.checkAndUnsealIfNeeded().catch(error => {
      throw new Error('Error during initialization:' + error);
    });
  }

  private async checkAndUnsealIfNeeded(): Promise<void> {
    try {
      const response = await fetch(`${this.vaultEndpoint}/v1/sys/seal-status`, {
        method: 'GET',
        headers: {
          'X-Vault-Token': this.rootToken,
        },
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
      const unsealKeys: string[] = [this.unsealKeys[0], this.unsealKeys[1]];
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
          throw new Error(
            `Unseal error with key ${key}: ${response.statusText}`,
          );
        }
      }
    } catch (error) {
      throw new Error(`Unseal error: ${error.message}`);
    }
  }

  async authenticate(password: string, username: string): Promise<string> {
    try {
      const data = {
        password: password,
      };
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/login/${username}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Authentication error: Unable to authenticate with the provided credentials.`,
        );
      }
      const responseData = await response.json();
      return responseData.auth.client_token;
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }

  async createUser(password: string, username: string): Promise<void> {
    try {
      const data = {
        password: password,
        policies: ['selecro-main'],
      };
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/users/${username}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.rootToken,
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Authentication error: Unable to authenticate with the provided credentials.`,
        );
      }
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }
}
