import {
  Request,
  Response
} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

export class PictureService {

  private readonly clientId = process.env.CLIENT_ID ?? '';

  constructor() { }

  async saveProfilePicture(request: Request, response: Response): Promise<{link: string, deletehash: string}> {
    try {
      const file = await this.uploadImage(request, response);
      const imgurResponse = await fetch(
        'https://api.imgur.com/3/image',
        {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${this.clientId}`,
          },
          body: `${file.buffer.toString('base64')}`,
        },
      );
      const imgurData = await imgurResponse.json();
      if (!imgurData.success) {
        throw new Error(`Error in save`);
      }
      return {link: imgurData.data.link, deletehash: imgurData.data.deletehash};
    } catch (error) {
      throw new Error(`Save error: ${error.message}`);
    }
  }

  async deleteProfilePicture(deleteHash: string): Promise<boolean> {
    try {
      const imgurResponse = await fetch(
        `https://api.imgur.com/3/image/${deleteHash}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Client-ID ${this.clientId}`,
          },
        },
      );
      const imgurData = await imgurResponse.json();
      if (!imgurData.success) {
        throw new Error(`Error in save`);
      }
      return true;
    } catch (error) {
      throw new Error(`Write error: ${error.message}`);
    }
  }

  /*async savePicture(request: Request, response: Response): Promise<void> {
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

  async deletePicture(deleteHash: string): Promise<void> {
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
  }*/

  private async uploadImage(request: Request, response: Response): Promise<Express.Multer.File> {
    const storage = multer.memoryStorage();
    const upload = multer({storage}).single('image');
    try {
      await new Promise<void>((resolve, reject) => {
        upload(request, response, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      if (request.file) {
        return request.file;
      }
      else {
        throw new Error(`No file uploaded.`);
      }
    } catch (error) {
      throw new Error(`Upload error: ${error.message}`);
    }
  }
}
