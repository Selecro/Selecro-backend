import {
  bind,
  BindingScope,
  inject,
  injectable
} from '@loopback/core';
import {
  EmailPayload,
  EmailService,
  InAppNotificationService,
  InAppPayload,
  PushNotificationService,
  PushPayload
} from '.';
import {
  NotificationType
} from '../models';

export enum UserNotification {
  Welcome = 'welcome',
  VerifyEmail = 'verify_email',
  SetPassword = 'set_password',
  ExploreFeatures = 'explore_features',
  ResetPassword = 'reset_password',
  LoginCode = 'login_code',
  NewLoginDetected = 'new_login_detected',
  AccountLocked = 'account_locked',
  OrderConfirmed = 'order_confirmed',
  PaymentReceived = 'payment_received',
  OrderShipped = 'order_shipped',
  InvoiceReady = 'invoice_ready',
  SubscriptionActivated = 'subscription_activated',
  ProfileUpdated = 'profile_updated',
  EmailChanged = 'email_changed',
  SubscriptionPlanChanged = 'subscription_plan_changed',
  SubscriptionRenewal = 'subscription_renewal',
  UsageSummary = 'usage_summary',
  DataDownloadReady = 'data_download_ready',
  TrialEnding = 'trial_ending',
  ReEngagement = 're_engagement',
  MilestoneReached = 'milestone_reached',
  KycReceived = 'kyc_received',
  VerificationComplete = 'verification_complete',
  PrivacyRequestConfirmed = 'privacy_request_confirmed',
  ApprovalNeeded = 'approval_needed',
  RequestRejected = 'request_rejected',
  TaskAssigned = 'task_assigned',
  ProjectUpdated = 'project_updated',
  EventRegistrationConfirmed = 'event_registration_confirmed',
  TicketsReady = 'tickets_ready',
  EventReminder = 'event_reminder',
  BookingCancelled = 'booking_cancelled',
  WaitlistSpotOpened = 'waitlist_spot_opened',
  NewMessage = 'new_message',
  PostReply = 'post_reply',
  Mention = 'mention',
  NewFollower = 'new_follower',
  ModerationAction = 'moderation_action',
  PriceDrop = 'price_drop',
  BackInStock = 'back_in_stock',
  RefundProcessed = 'refund_processed',
  ReviewRequest = 'review_request',
  PaymentFailed = 'payment_failed',
  Other = 'other'
}

export enum GroupNotification {
  ScheduledMaintenance = 'scheduled_maintenance',
  ServiceDowntime = 'service_downtime',
  TermsUpdated = 'terms_updated',
  NewFeature = 'new_feature',
  ComplianceUpdate = 'compliance_update',
  EventReminderGroup = 'event_reminder_group',
  LowInventory = 'low_inventory',
  SystemHealthSummary = 'system_health_summary',
  Other = 'other'
}

export enum BroadcastNotification {
  NewFeaturePublic = 'new_feature_public',
  Promotion = 'promotion',
  BigEvent = 'big_event',
  PublicDowntime = 'public_downtime',
  Other = 'other'
}

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'notification.service'
})
export class NotificationService {
  constructor(
    @inject('in-app-notification.service') private inAppNotificationService: InAppNotificationService,
    @inject('push-notification.service') private pushNotificationService: PushNotificationService,
    @inject('email.service') private emailService: EmailService,
  ) { }

  public async sendToUser(notificationType: UserNotification, userId: number): Promise<void> {
    const emailPayload: EmailPayload = {
      subject: `Notification: ${notificationType}`,
      templateName: notificationType,
    };

    const inAppPayload: InAppPayload = {
      title: `New message from Selecro`,
      notification_message: `You have a new notification of type: ${notificationType}`,
      notification_type: NotificationType.Info,
    };

    const pushPayload: PushPayload = {
      title: inAppPayload.title,
      notification_message: inAppPayload.notification_message,
      notification_type: inAppPayload.notification_type,
    };

    await this.emailService.sendToUser(userId, emailPayload);
    await this.inAppNotificationService.sendForUser(userId, inAppPayload);
    await this.pushNotificationService.sendToUser(userId, pushPayload);
  }

  public async sendToAllRegisteredUsers(notificationType: GroupNotification): Promise<void> {
    const emailPayload: EmailPayload = {
      subject: `Group Notification: ${notificationType}`,
      templateName: notificationType,
    };

    const inAppPayload: InAppPayload = {
      title: `Group Update: ${notificationType}`,
      notification_message: `A new group notification is available.`,
      notification_type: NotificationType.Info,
    };

    const pushPayload: PushPayload = {
      title: inAppPayload.title,
      notification_message: inAppPayload.notification_message,
      notification_type: inAppPayload.notification_type,
    };

    await this.emailService.sendToAllRegisteredUsers(emailPayload);
    await this.inAppNotificationService.sendForAllRegisteredUsers(inAppPayload);
    await this.pushNotificationService.sendToAllRegisteredUsers(pushPayload);
  }

  public async sendBroadcast(notificationType: BroadcastNotification): Promise<void> {
    const topicName = 'broadcast';
    const pushPayload: PushPayload = {
      title: `Broadcast Alert: ${notificationType}`,
      notification_message: `A new public announcement has been made.`,
      notification_type: NotificationType.Promotion,
    };

    await this.pushNotificationService.sendBroadcast(topicName, pushPayload);
  }
}
