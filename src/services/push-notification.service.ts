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
  NotificationType
} from '../models';
import {
  DeviceRepository
} from '../repositories';

// The payload for push notifications
export interface PushPayload {
  title: string;
  notification_message: string;
  notification_type: NotificationType;
  image_url?: string;
  action_url?: string;
  extra_data?: string;
}

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'push-notification.service'
})
export class PushNotificationService {
  private readonly firebaseAdmin: typeof admin;

  constructor(
    @inject(NotificationBindings.PUSH_NOTIFICATION_SERVICE) firebaseAdmin: typeof admin,
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
  ) {
    this.firebaseAdmin = firebaseAdmin;
  }

  public async sendToUser(userId: number, payload: PushPayload): Promise<void> {
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
          title: payload.title,
          body: payload.notification_message,
        },
        data: {
          actionUrl: payload.action_url || '',
          notificationType: payload.notification_type,
          extraData: payload.extra_data || '',
        },
        tokens: deviceTokens,
      };
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    }
  }

  public async sendBroadcast(topicName: string, payload: PushPayload): Promise<void> {
    const message: admin.messaging.TopicMessage = {
      notification: {
        title: payload.title,
        body: payload.notification_message,
      },
      data: {
        notificationType: payload.notification_type,
        actionUrl: payload.action_url || '',
        extraData: payload.extra_data || '',
      },
      topic: topicName,
    };
    await this.firebaseAdmin.messaging().send(message);
  }

  public async sendToAllUsers(payload: PushPayload): Promise<void> {
    const devices = await this.deviceRepository.find({
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(device => device.device_token)
      .filter(token => token !== undefined);
  }

  public async sendToAllRegisteredUsers(payload: PushPayload): Promise<void> {
    const devices = await this.deviceRepository.find({
      fields: ['device_token'],
    });
    const deviceTokens = devices
      .map(device => device.device_token)
      .filter(token => token !== undefined);
  }
}
