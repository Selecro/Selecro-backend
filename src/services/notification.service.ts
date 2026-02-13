import {bind, BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as admin from 'firebase-admin';
import {Notification, NotificationType} from '../models';
import {
  DeviceRepository,
  NotificationRepository,
  UserRepository,
} from '../repositories';

export interface NotificationPayload {
  title: string;
  notificationMessage: string;
  notificationType: NotificationType;
  imageUrl?: string;
  actionUrl?: string;
  extraData?: string;
}

export interface NotificationOptions {
  silent?: boolean;
  topic?: string;
  creatorUserId?: number;
  audienceType?: 'user' | 'group' | 'broadcast';
}

@injectable({scope: BindingScope.SINGLETON})
@bind({tags: 'notification.service'})
export class NotificationService {
  private readonly firebaseAdmin = admin;

  constructor(
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
    @repository(NotificationRepository)
    private notificationRepository: NotificationRepository,
    @repository(UserRepository) private userRepository: UserRepository,
  ) {}

  public async sendNotification(
    users: number[] | undefined,
    devices: string[] | undefined,
    payload: NotificationPayload,
    options: NotificationOptions = {},
  ): Promise<void> {
    if (users?.length) {
      await Promise.all(
        users.map(userId =>
          this.notificationRepository.create(
            new Notification({
              ...payload,
              userId: userId,
              creatorUserId: options.creatorUserId,
              audienceType: options.audienceType ?? 'user',
            }),
          ),
        ),
      );
    } else {
      await this.notificationRepository.create(
        new Notification({
          ...payload,
          creatorUserId: options.creatorUserId,
          audienceType:
            options.audienceType ?? (options.topic ? 'broadcast' : 'group'),
        }),
      );
    }

    const deviceTokens: string[] = devices ?? [];

    if (users?.length) {
      const userDevices = await this.deviceRepository.find({
        where: {userId: {inq: users}},
        fields: ['device_token'],
      });
      deviceTokens.push(
        ...userDevices.map(d => d.device_token).filter((t): t is string => !!t),
      );
    }

    if (options.topic) {
      await this._sendToTopic(payload, options);
    }

    if (deviceTokens.length > 0) {
      await this._sendToDevices(deviceTokens, payload, options);
    }
  }

  private async _sendToDevices(
    tokens: string[],
    payload: NotificationPayload,
    options: NotificationOptions,
  ) {
    const message: admin.messaging.MulticastMessage = {
      notification: options.silent
        ? undefined
        : {
            title: payload.title,
            body: payload.notificationMessage,
            imageUrl: payload.imageUrl,
          },
      data: {
        notificationType: String(payload.notificationType),
        actionUrl: payload.actionUrl ?? '',
        extraData: payload.extraData ?? '',
      },
      tokens,
    };

    if (options.silent) {
      message.android = {priority: 'high'};
      message.apns = {
        headers: {'apns-priority': '5'},
        payload: {aps: {'content-available': 1}},
      };
    }

    const response = await this.firebaseAdmin
      .messaging()
      .sendEachForMulticast(message);
    const failedTokens = response.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter((t): t is string => !!t);
    if (failedTokens.length > 0) console.warn('Failed tokens:', failedTokens);
  }

  private async _sendToTopic(
    payload: NotificationPayload,
    options: NotificationOptions,
  ) {
    const message: admin.messaging.Message = {
      topic: options.topic!,
      notification: options.silent
        ? undefined
        : {
            title: payload.title,
            body: payload.notificationMessage,
            imageUrl: payload.imageUrl,
          },
      data: {
        notificationType: String(payload.notificationType),
        actionUrl: payload.actionUrl ?? '',
        extraData: payload.extraData ?? '',
      },
    };

    if (options.silent) {
      message.android = {priority: 'high'};
      message.apns = {
        headers: {'apns-priority': '5'},
        payload: {aps: {'content-available': 1}},
      };
    }

    await this.firebaseAdmin.messaging().send(message);
  }

  public async sendToAllRegisteredUsers(
    payload: NotificationPayload,
    options: NotificationOptions = {},
  ) {
    await this.notificationRepository.create(
      new Notification({
        ...payload,
        creatorUserId: options.creatorUserId,
        audienceType: 'group',
      }),
    );

    const devices = await this.deviceRepository.find({
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(d => d.device_token)
      .filter((t): t is string => !!t);

    if (deviceTokens.length > 0) {
      await this._sendToDevices(deviceTokens, payload, options);
    }
  }

  public async sendToAllDevices(
    payload: NotificationPayload,
    options: NotificationOptions = {},
  ) {
    await this.notificationRepository.create(
      new Notification({
        ...payload,
        creatorUserId: options.creatorUserId,
        audienceType: 'broadcast',
      }),
    );

    const devices = await this.deviceRepository.find({
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(d => d.device_token)
      .filter((t): t is string => !!t);

    if (deviceTokens.length > 0) {
      await this._sendToDevices(deviceTokens, payload, options);
    }
  }
}
