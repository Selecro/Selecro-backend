import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Middleware, Request, Response, RestBindings} from '@loopback/rest';
import {createHash} from 'crypto';
import {DeviceLanguagePreference} from '../models';
import {DeviceRepository} from '../repositories';

declare module '@loopback/rest' {
  interface Request {
    deviceId?: string;
  }
}

function parseUserAgent(userAgent: string): {os: string, version: string} {
  const osInfo = {os: 'Unknown', version: 'Unknown'};

  if (userAgent.includes('Windows NT 10.0')) {
    osInfo.os = 'Windows';
    osInfo.version = '10';
  } else if (userAgent.includes('Windows')) {
    osInfo.os = 'Windows';
    osInfo.version = 'Unknown';
  } else if (userAgent.includes('Macintosh')) {
    osInfo.os = 'Macintosh';
    osInfo.version = 'macOS';
  } else if (userAgent.includes('Android')) {
    osInfo.os = 'Android';
    const match = userAgent.match(/Android (\d+(\.\d+)*)/);
    osInfo.version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    osInfo.os = 'iOS';
    const match = userAgent.match(/(iPhone|iPad) OS (\d+_\d+)/);
    osInfo.version = match ? match[2].replace(/_/g, '.') : 'Unknown';
  } else if (userAgent.includes('Linux')) {
    osInfo.os = 'Linux';
    osInfo.version = 'Unknown';
  }
  return osInfo;
}

function parseLanguagePreference(acceptLanguage: string): DeviceLanguagePreference {
  const preferredLanguage = acceptLanguage.split(',')[0].toLowerCase();
  if (preferredLanguage.startsWith(DeviceLanguagePreference.EN)) {
    return DeviceLanguagePreference.EN;
  }
  return DeviceLanguagePreference.CZ;
}

export class DeviceMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @repository(DeviceRepository)
    private deviceRepository: DeviceRepository,
  ) { }

  value(): Middleware {
    return async (ctx, next) => {
      const clientIp = this.request.headers['x-forwarded-for'] as string || this.request.ip;
      const userAgent = this.request.headers['user-agent'] ?? 'Unknown';

      const {os, version} = parseUserAgent(userAgent);
      const languagePreference = this.request.headers['accept-language'] ?
        parseLanguagePreference(this.request.headers['accept-language'] as string) :
        DeviceLanguagePreference.CZ;

      const deviceToken = this.request.headers['x-device-token'] as string;

      const deviceFingerprint = createHash('sha256')
        .update(`${userAgent}-${clientIp}`)
        .digest('hex');

      let existingDevice;
      try {
        existingDevice = await this.deviceRepository.findOne({where: {device_fingerprint: deviceFingerprint}});
      } catch (error) {
        console.error('Failed to query device by fingerprint:', error);
      }

      if (existingDevice) {
        try {
          await this.deviceRepository.updateById(existingDevice.id, {
            last_used_at: new Date().toISOString(),
            last_known_ip: clientIp ?? '0.0.0.0',
            device_name: userAgent,
            device_token: deviceToken,
            device_language_preference: languagePreference,
            device_os: os,
            device_version: version,
            updated_at: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to update device record:', error);
        }
      } else {
        try {
          const newDevice = await this.deviceRepository.create({
            device_fingerprint: deviceFingerprint,
            device_name: userAgent,
            last_used_at: new Date().toISOString(),
            last_known_ip: clientIp ?? '0.0.0.0',
            device_token: deviceToken,
            device_language_preference: languagePreference,
            device_os: os,
            device_version: version,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          existingDevice = newDevice;
        } catch (error) {
          console.error('Failed to create new device record:', error);
        }
      }

      (ctx.request as any).deviceId = existingDevice ? existingDevice.id : undefined;

      await next();
    };
  }
}
