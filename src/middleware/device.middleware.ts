import {inject, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Middleware, Request, Response, RestBindings} from '@loopback/rest';
import {createHash, randomUUID} from 'crypto';
import {DeviceRepository, LanguageRepository} from '../repositories';

export const LanguageCodes = {
  ENGLISH: 'en',
  CZECH: 'cz',
} as const;

export type LanguageCode = typeof LanguageCodes[keyof typeof LanguageCodes];

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

function parseLanguagePreference(acceptLanguage: string): LanguageCode {
  const preferredLanguage = acceptLanguage.split(',')[0].toLowerCase();

  if (preferredLanguage.startsWith(LanguageCodes.ENGLISH)) {
    return LanguageCodes.ENGLISH;
  }
  return LanguageCodes.CZECH;
}

export class DeviceMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @repository(DeviceRepository)
    private deviceRepository: DeviceRepository,
    @repository(LanguageRepository)
    private languageRepository: LanguageRepository,
  ) { }

  value(): Middleware {
    return async (ctx, next) => {
      const clientIp = this.request.headers['x-forwarded-for'] as string || this.request.ip;
      const userAgent = this.request.headers['user-agent'] ?? 'Unknown';
      const {os, version} = parseUserAgent(userAgent);
      const languageCode = this.request.headers['accept-language'] ?
        parseLanguagePreference(this.request.headers['accept-language'] as string) :
        LanguageCodes.CZECH;
      const deviceToken = this.request.headers['x-device-token'] as string;
      const deviceFingerprint = createHash('sha256')
        .update(`${userAgent}-${clientIp}`)
        .digest('hex');
      let languageId: number | undefined;
      let existingDevice;

      if (deviceFingerprint && deviceFingerprint.length > 0) {
        try {
          existingDevice = await this.deviceRepository.findOne({where: {deviceFingerprint: deviceFingerprint}});
        } catch (error) {
          console.error('Failed to query device by fingerprint:', error);
        }
      }

      const now = new Date().toISOString();

      if (existingDevice) {

      } else {
        try {
          const uniqueId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 10000);

          const newDevice = await this.deviceRepository.create({
            id: uniqueId,
            deviceUuid: randomUUID(),
            deviceName: userAgent,
            lastUsedAt: now,
            isTrusted: false,
            biometricEnabled: false,
            deviceFingerprint: deviceFingerprint,
            lastKnownIp: clientIp ?? '0.0.0.0',
            deviceToken: deviceToken,
            languageId: languageId,
            deviceOs: os,
            deviceVersion: version,
            createdAt: now,
            updatedAt: now,
          });
          existingDevice = newDevice;
        } catch (error) {
          console.error('Failed to create new device record:', error);

        }
      }

      (ctx.request as any).id = existingDevice ? existingDevice.id : undefined;

      await next();
    };
  }
}
