import {bind, BindingScope, inject, injectable} from '@loopback/core';
import {NotificationType} from '../models';
import {EmailPayload, EmailService} from './email.service';
import {NotificationPayload, NotificationService} from './notification.service';

export enum UserNotification {
  Welcome = 'welcome',
  VerifyEmail = 'verify_email',
  ResetPassword = 'reset_password',
  LoginCode = 'login_code',
  NewLoginDetected = 'new_login_detected',
  AccountLocked = 'account_locked',
  OrderConfirmed = 'order_confirmed',
  PaymentReceived = 'payment_received',
  OrderShipped = 'order_shipped',
  SubscriptionActivated = 'subscription_activated',
  ProfileUpdated = 'profile_updated',
  SubscriptionPlanChanged = 'subscription_plan_changed',
  SubscriptionRenewal = 'subscription_renewal',
  TrialEnding = 'trial_ending',
  ReEngagement = 're_engagement',
  MilestoneReached = 'milestone_reached',
  Other = 'other',
}

export enum GroupNotification {
  ScheduledMaintenance = 'scheduled_maintenance',
  ServiceDowntime = 'service_downtime',
  TermsUpdated = 'terms_updated',
  NewFeature = 'new_feature',
  ComplianceUpdate = 'compliance_update',
  EventReminderGroup = 'event_reminder_group',
  SystemHealthSummary = 'system_health_summary',
  Other = 'other',
}

export enum BroadcastNotification {
  NewFeaturePublic = 'new_feature_public',
  Promotion = 'promotion',
  BigEvent = 'big_event',
  PublicDowntime = 'public_downtime',
  Other = 'other',
}

@injectable({scope: BindingScope.SINGLETON})
@bind({tags: 'user-notification.service'})
export class UserNotificationService {
  constructor(
    @inject('notification.service')
    private notificationService: NotificationService,
    @inject('email.service') private emailService: EmailService,
  ) {}

  public async sendToUser(
    notificationType: UserNotification,
    userId: number,
    creatorUserId: number,
  ): Promise<void> {
    const emailPayload: EmailPayload = {
      subject: `Notification: ${notificationType}`,
      templateName: notificationType,
    };

    const payload: NotificationPayload = {
      title: `New message from Selecro`,
      notificationMessage: `You have a new notification of type: ${notificationType}`,
      notificationType: NotificationType.Info,
    };

    await this.emailService.sendToUser(userId, emailPayload);
    await this.notificationService.sendNotification(
      [userId],
      undefined,
      payload,
      {creatorUserId},
    );
  }

  public async sendToAllRegisteredUsers(
    notificationType: GroupNotification,
    creatorUserId: number,
  ): Promise<void> {
    const emailPayload: EmailPayload = {
      subject: `Group Notification: ${notificationType}`,
      templateName: notificationType,
    };

    const payload: NotificationPayload = {
      title: `Group Update: ${notificationType}`,
      notificationMessage: `A new group notification is available.`,
      notificationType: NotificationType.Info,
    };

    await this.emailService.sendToAllRegisteredUsers(emailPayload);
    await this.notificationService.sendToAllRegisteredUsers(payload, {
      creatorUserId,
    });
  }

  public async sendBroadcast(
    notificationType: BroadcastNotification,
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `Broadcast Alert: ${notificationType}`,
      notificationMessage: `A new public announcement has been made.`,
      notificationType: NotificationType.Promotion,
    };

    await this.notificationService.sendNotification(
      undefined,
      undefined,
      payload,
      {topic: 'broadcast'},
    );
  }

  public async sendToDevice(
    deviceToken: string,
    notificationType: UserNotification,
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `Direct Device Notification`,
      notificationMessage: `Notification of type: ${notificationType}`,
      notificationType: NotificationType.Info,
    };

    await this.notificationService.sendNotification(
      undefined,
      [deviceToken],
      payload,
    );
  }
}
