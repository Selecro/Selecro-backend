import {
  bind,
  BindingScope,
  inject,
  injectable
} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  format
} from 'util';
import {
  FcmBindings
} from '../keys';
import {
  DeliveryMethod,
  DeviceLanguagePreference,
  Notification,
  NotificationType
} from '../models';
import {
  DeviceRepository,
  NotificationRepository
} from '../repositories';

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: {
    [key: string]: string
  };
}

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: FcmBindings.SERVICE
})
export class ZFcmService {
  private readonly firebaseAdmin: typeof admin;
  private translations: {
    [key: string]: any
  } = {};

  constructor(
    @inject(FcmBindings.ADMIN) firebaseAdmin: typeof admin,
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
    @repository(NotificationRepository) private notificationRepository: NotificationRepository,
  ) {
    this.firebaseAdmin = firebaseAdmin;
    this.loadTranslations();
  }

  private async loadTranslations(): Promise<void> {
    const supportedLangs = [DeviceLanguagePreference.EN, DeviceLanguagePreference.CZ];
    for (const lang of supportedLangs) {
      try {
        const filePath = path.join(__dirname, `../locales/${lang}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        this.translations[lang] = JSON.parse(fileContent);
      } catch (error) {
        throw new Error(`Failed to load translation file for language: ${lang}.`);
      }
    }
  }

  private _getLocalizedPayload(
    lang: DeviceLanguagePreference,
    messageKey: string,
    type: NotificationType,
    replacements: string[] = [],
  ): NotificationPayload {
    const localeMessages = this.translations[lang]?.fcm;
    if (!localeMessages || !localeMessages[messageKey]) {
      return {
        title: 'Notification Error',
        body: `Translation key '${messageKey}' not found for language '${lang}'.`,
        type: NotificationType.Error,
        data: {
          type: 'error',
          messageKey,
          lang
        },
      };
    }

    const title = format(localeMessages[messageKey].title, ...replacements);
    const body = format(localeMessages[messageKey].body, ...replacements);

    return {
      title,
      body,
      type,
      data: {
        messageKey
      },
    };
  }

  private _createMessage(tokens: string[], payload: NotificationPayload): admin.messaging.MulticastMessage {
    return {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens,
    };
  }

  private async _sendMulticastMessage(message: admin.messaging.MulticastMessage): Promise<admin.messaging.BatchResponse> {
    try {
      return await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    } catch (error) {
      throw new Error(`An error occurred while sending the notification: ${error}`);
    }
  }

  public async sendToDevice(deviceToken: string, payload: NotificationPayload): Promise<admin.messaging.BatchResponse> {
    const message = this._createMessage([deviceToken], payload);
    return this._sendMulticastMessage(message);
  }

  public async sendToUser(userId: number, payload: NotificationPayload, creatorId?: number): Promise<admin.messaging.BatchResponse> {
    const devices = await this.deviceRepository.find({
      where: {
        userId
      }
    });
    const tokens = devices.map(device => device.token);

    const newNotification = new Notification({
      user_id: userId,
      title: payload.title,
      notification_message: payload.body,
      notification_type: payload.type,
      delivery_method: DeliveryMethod.Push,
      creator_user_id: creatorId,
      extra_data: JSON.stringify(payload.data),
    });
    await this.notificationRepository.create(newNotification);

    if (tokens.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        responses: []
      };
    }

    const message = this._createMessage(tokens, payload);
    return this._sendMulticastMessage(message);
  }

  public async sendWelcomeNotification(userId: number): Promise<admin.messaging.BatchResponse> {
    const device = await this.deviceRepository.findOne({
      where: {
        userId
      }
    });
    const lang = device?.device_language_preference || DeviceLanguagePreference.CZ;
    const welcomePayload = this._getLocalizedPayload(lang, 'welcome', NotificationType.Success);
    return this.sendToUser(userId, welcomePayload);
  }

  public async sendPasswordResetSuccessNotification(userId: number): Promise<admin.messaging.BatchResponse> {
    const device = await this.deviceRepository.findOne({
      where: {
        userId
      }
    });
    const lang = device?.device_language_preference || DeviceLanguagePreference.CZ;
    const resetSuccessPayload = this._getLocalizedPayload(lang, 'password_reset_success', NotificationType.Success);
    return this.sendToUser(userId, resetSuccessPayload);
  }

  public async sendNewMessageNotification(userId: number, senderUsername: string, messageBody: string): Promise<admin.messaging.BatchResponse> {
    const device = await this.deviceRepository.findOne({
      where: {
        userId
      }
    });
    const lang = device?.device_language_preference || DeviceLanguagePreference.CZ;
    const messagePayload = this._getLocalizedPayload(lang, 'new_message', NotificationType.Activity, [senderUsername, messageBody]);
    return this.sendToUser(userId, messagePayload);
  }

  public async sendLocalizedNotificationToAllUsers(messageKey: string, type: NotificationType, replacements: string[] = []): Promise<admin.messaging.BatchResponse> {
    const allDevices = await this.deviceRepository.find();
    const langToTokens = allDevices.reduce((acc, device) => {
      const lang = device?.device_language_preference || DeviceLanguagePreference.CZ;
      acc[lang] = acc[lang] || [];
      acc[lang].push(device.token);
      return acc;
    }, {} as {
      [key: string]: string[]
    });

    const sendPromises: Promise<admin.messaging.BatchResponse>[] = [];

    for (const lang in langToTokens) {
      if (langToTokens[lang].length > 0) {
        const payload = this._getLocalizedPayload(lang as DeviceLanguagePreference, messageKey, type, replacements);
        const message = this._createMessage(langToTokens[lang], payload);
        sendPromises.push(this._sendMulticastMessage(message));
      }
    }

    const settledResponses = await Promise.allSettled(sendPromises);

    const successCount = settledResponses.reduce((acc, res) => acc + (res.status === 'fulfilled' ? res.value.successCount : 0), 0);
    const failureCount = settledResponses.reduce((acc, res) => acc + (res.status === 'fulfilled' ? res.value.failureCount : 0), 0);
    const responses = settledResponses.flatMap(res => res.status === 'fulfilled' ? res.value.responses : []);

    return {
      successCount,
      failureCount,
      responses
    };
  }
}
