import {Request, Response} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

export class ImgurService {
  private readonly clientId = process.env.CLIENT_ID ?? '';

  constructor() { }

  async savePicture(
    request: Request,
    response: Response,
  ): Promise<{link: string; deletehash: string}> {
    try {
      const file = await this.uploadImage(request, response);
      const imgurResponse = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${this.clientId}`,
        },
        body: `${file.buffer.toString('base64')}`,
      });
      const imgurData = await imgurResponse.json();
      if (!imgurData.success) {
        throw new Error(`Error in save`);
      }
      return {link: imgurData.data.link, deletehash: imgurData.data.deletehash};
    } catch (error) {
      throw new Error(`Save error: ${error.message}`);
    }
  }

  async deleteImage(deleteHash: string): Promise<boolean> {
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

  private async uploadImage(
    request: Request,
    response: Response,
  ): Promise<Express.Multer.File> {
    const storage = multer.memoryStorage();
    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      },
    }).single('image');
    try {
      await new Promise<void>((resolve, reject) => {
        upload(request, response, (err: string) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      if (request.file) {
        return request.file;
      } else {
        throw new Error(`No file uploaded.`);
      }
    } catch (error) {
      throw new Error(`Upload error: ${error.message}`);
    }
  }
}
