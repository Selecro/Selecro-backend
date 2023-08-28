import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

export class VaultService {
  private readonly vaultEndpoint = process.env.VAULT_URL ?? '';
  private readonly userpass = {
    username: process.env.VAULT_USERNAME ?? '',
    password: process.env.VAULT_PASSWORD ?? '',
  };
  private readonly unsealKeys: string[] = [
    process.env.UNSEAL_KEY_1 ?? '',
    process.env.UNSEAL_KEY_2 ?? '',
  ];
  private token: string;

  constructor() {
    this.checkAndUnsealIfNeeded().catch(error => {
      throw new Error('Error during initialization:' + error);
    });
  }

  async read(path: string): Promise<JSON> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/secret/data/selecro/${path}`,
        {
          method: 'GET',
          headers: {
            'X-Vault-Token': this.token,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Read error: ${response.statusText}`);
      }
      const responseData = await response.json();
      return responseData.data;
    } catch (error) {
      throw new Error(`Read error: ${error.message}`);
    }
  }

  async write(path: string, data: Object): Promise<void> {
    try {
      const response = await fetch(
        `${this.vaultEndpoint}/v1/secret/data/selecro/${path}`,
        {
          method: 'POST',
          headers: {
            'X-Vault-Token': this.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(
          `Write error: ${response.statusText}\nResponse data: ${JSON.stringify(
            responseBody,
          )}`,
        );
      }
    } catch (error) {
      throw new Error(`Write error: ${error.message}`);
    }
  }

  private async checkAndUnsealIfNeeded(): Promise<void> {
    try {
      const response = await fetch(`${this.vaultEndpoint}/v1/sys/seal-status`, {
        method: 'GET',
        headers: {
          'X-Vault-Token': this.token,
        },
      });
      if (!response.ok) {
        throw new Error(`Status check error: ${response.statusText}`);
      }
      const responseData = await response.json();
      if (responseData.sealed) {
        await this.unseal();
      }
      await this.authenticate();
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
            'X-Vault-Token': this.token,
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

  private async authenticate(): Promise<void> {
    try {
      const data = {
        password: this.userpass.password,
      };
      const response = await fetch(
        `${this.vaultEndpoint}/v1/auth/userpass/login/${this.userpass.username}`,
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
      this.token = responseData.auth.client_token;
    } catch (error) {
      throw new Error(`Authentication error: ${error.message}`);
    }
  }
}
