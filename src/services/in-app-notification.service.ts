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
import {
  NotificationBindings
} from '../keys';
import {
  Notification
} from '../models';
import {
  DeviceRepository,
  NotificationRepository,
  UserRepository
} from '../repositories';

export type InAppPayload = Pick<Notification,
  'title' |
  'notification_message' |
  'notification_type' |
  'image_url' |
  'action_url' |
  'extra_data' |
  'read_at' |
  'deleted_by'
>;

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'in-app-notification.service'
})
export class InAppNotificationService {
  private readonly firebaseAdmin: typeof admin;

  constructor(
    @inject(NotificationBindings.IN_APP_NOTIFICATION_SERVICE) firebaseAdmin: typeof admin,
    @repository(NotificationRepository) private notificationRepository: NotificationRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
  ) {
    this.firebaseAdmin = firebaseAdmin;
  }

  public async sendForUser(userId: number, creatorUserId: number, payload: InAppPayload): Promise<void> {
    const savedNotification = await this.notificationRepository.create(new Notification({
      ...payload,
      user_id: userId,
      creator_user_id: creatorUserId,
    }));

    const devices = await this.deviceRepository.find({
      where: {
        user_id: userId
      },
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(device => device.device_token)
      .filter((token): token is string => token !== undefined);

    if (deviceTokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: savedNotification.title,
          body: savedNotification.notification_message,
        },
        data: {
          notificationId: savedNotification.id.toString(),
          actionUrl: savedNotification.action_url || '',
          notificationType: savedNotification.notification_type,
        },
        tokens: deviceTokens,
      };
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    }
  }

  public async sendForAllRegisteredUsers(creatorUserId: number, payload: InAppPayload): Promise<void> {
    const devices = await this.deviceRepository.find({
      fields: ['user_id', 'device_token'],
    });

    const userIds = [...new Set(devices.map(device => device.user_id))];
    await Promise.all(userIds.map(userId => this.notificationRepository.create(new Notification({
      ...payload,
      user_id: userId,
      creator_user_id: creatorUserId,
    }))));

    const deviceTokens = devices
      .map(device => device.device_token)
      .filter((token): token is string => token !== undefined);

    if (deviceTokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.notification_message,
        },
        data: {
          notificationType: payload.notification_type,
          actionUrl: payload.action_url || '',
        },
        tokens: deviceTokens,
      };
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    }
  }

  public async sendToAllDevices(payload: InAppPayload): Promise<void> {
    const devices = await this.deviceRepository.find({
      fields: ['device_token'],
    });

    const deviceTokens = devices
      .map(device => device.device_token)
      .filter((token): token is string => token !== undefined);

    if (deviceTokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: payload.title,
          body: payload.notification_message,
        },
        data: {
          notificationType: payload.notification_type,
          actionUrl: payload.action_url || '',
        },
        tokens: deviceTokens,
      };
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    }
  }
}
