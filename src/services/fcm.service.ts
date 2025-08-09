import {bind, BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as admin from 'firebase-admin';
import {FcmBindings} from '../keys';
import {DeviceRepository} from '../repositories';

// Interface for the notification payload
export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    [key: string]: string;
  };
}

@injectable({scope: BindingScope.SINGLETON})
@bind({tags: FcmBindings.SERVICE})
export class FcmService {
  private readonly firebaseAdmin: typeof admin;

  constructor(
    @inject(FcmBindings.ADMIN) firebaseAdmin: typeof admin,
    @repository(DeviceRepository) private deviceRepository: DeviceRepository,
  ) {
    this.firebaseAdmin = firebaseAdmin;
  }

  /**
   * Sends a notification to all devices.
   * @param payload The notification payload.
   */
  public async sendToAll(payload: NotificationPayload): Promise<admin.messaging.BatchResponse> {
    const devices = await this.deviceRepository.find();
    const tokens = devices.map(device => device.token);

    if (tokens.length === 0) {
      console.log('No devices found to send notifications to.');
      return Promise.resolve({
        successCount: 0,
        failureCount: 0,
        responses: []
      });
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens: tokens,
    };

    try {
      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      console.log('Successfully sent message to all devices:', response.successCount, 'succeeded,', response.failureCount, 'failed.');
      return response;
    } catch (error) {
      console.error('Error sending message to all devices:', error);
      throw error;
    }
  }

  /**
   * Sends a notification to a specific user's devices.
   * @param userId The ID of the user.
   * @param payload The notification payload.
   */
  public async sendToUser(userId: string, payload: NotificationPayload): Promise<admin.messaging.BatchResponse> {
    const devices = await this.deviceRepository.find({where: {userId}});
    const tokens = devices.map(device => device.token);

    if (tokens.length === 0) {
      console.log(`No devices found for user ${userId}.`);
      return Promise.resolve({
        successCount: 0,
        failureCount: 0,
        responses: []
      });
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens: tokens,
    };

    try {
      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent message to user ${userId}'s devices:`, response.successCount, 'succeeded,', response.failureCount, 'failed.');
      return response;
    } catch (error) {
      console.error(`Error sending message to user ${userId}'s devices:`, error);
      throw error;
    }
  }

  /**
   * Sends a notification to a list of specific user IDs.
   * @param userIds An array of user IDs.
   * @param payload The notification payload.
   */
  public async sendToListOfUsers(userIds: string[], payload: NotificationPayload): Promise<admin.messaging.BatchResponse> {
    const devices = await this.deviceRepository.find({where: {userId: {inq: userIds}}});
    const tokens = devices.map(device => device.token);

    if (tokens.length === 0) {
      console.log(`No devices found for the provided list of users.`);
      return Promise.resolve({
        successCount: 0,
        failureCount: 0,
        responses: []
      });
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      tokens: tokens,
    };

    try {
      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent message to list of users:`, response.successCount, 'succeeded,', response.failureCount, 'failed.');
      return response;
    } catch (error) {
      console.error(`Error sending message to list of users:`, error);
      throw error;
    }
  }
}
