import {inject} from '@loopback/core';
import {HttpErrors, Request, Response} from '@loopback/rest';
import fetch from 'cross-fetch';
import * as dotenv from 'dotenv';
import multer from 'multer';
import {EmailService} from '.';
dotenv.config();

export class ImgurService {
  private readonly clientId = process.env.IMGUR_CLIENT_ID ?? '';

  constructor(
    @inject('services.email')
    public emailService: EmailService,
  ) { }

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
        await this.emailService.sendError('Error in save picture: ' + JSON.stringify(imgurData, null, 2));
        throw new HttpErrors.InternalServerError('Error in save picture');
      }
      return {link: imgurData.data.link, deletehash: imgurData.data.deletehash};
    } catch (error) {
      await this.emailService.sendError('Error in save picture: ' + error);
      throw new HttpErrors.InternalServerError('Error in save picture');
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
        await this.emailService.sendError('Error in delete picture: ' + JSON.stringify(imgurData, null, 2));
        throw new HttpErrors.InternalServerError('Error in delete picture');
      }
      return true;
    } catch (error) {
      await this.emailService.sendError('Error in delete picture: ' + error);
      throw new HttpErrors.InternalServerError('Error in delete picture');
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
          cb(new HttpErrors.UnprocessableEntity('Only image files are allowed'));
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
        throw new HttpErrors.UnprocessableEntity('No file uploaded.');
      }
    } catch (error) {
      await this.emailService.sendError('Error in upload picture: ' + error);
      throw new HttpErrors.InternalServerError('Error in upload picture');
    }
  }
}
