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
  FcmBindings
} from '../keys';
import {
  Notification
} from '../models';
import {
  DeviceRepository,
  NotificationRepository,
  UserRepository
} from '../repositories';

export type InAppPayload = Omit<Notification, 'id' | 'user_id' | 'creator_user_id' | 'created_at' | 'read_at' | 'deleted' | 'deleted_at' | 'deleted_by'>;

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'in-app-notification.service'
})
export class InAppNotificationService {
  private readonly firebaseAdmin: typeof admin;

  constructor(
    @inject(FcmBindings.ADMIN) firebaseAdmin: typeof admin,
    @repository(NotificationRepository) private notificationRepository: NotificationRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
  ) {
    this.firebaseAdmin = firebaseAdmin;
  }

  public async sendForUser(userId: number, payload: InAppPayload): Promise<void> {
    const savedNotification = await this.notificationRepository.create(new Notification({
      ...payload,
      user_id: userId,
    }));

    const devices = await this.deviceRepository.find({
      where: {
        user_id: userId
      },
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(device => device.device_token)
      .filter(token => token !== undefined);

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

  public async sendForAllRegisteredUsers(payload: InAppPayload): Promise<void> {
    const devices = await this.deviceRepository.find({
      fields: ['user_id', 'device_token'],
    });

    const userIds = [...new Set(devices.map(device => device.user_id))];
    await Promise.all(userIds.map(userId => this.notificationRepository.create(new Notification({
      ...payload,
      user_id: userId,
    }))));

    const deviceTokens = devices.map(device => device.device_token).filter(token => token !== undefined);

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
