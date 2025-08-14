import {
  bind,
  BindingScope,
  inject,
  injectable
} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import * as fs from 'fs/promises';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import {
  format
} from 'util';
import {
  EmailService
} from '.';
import {
  User,
  UserLanguagePreference
} from '../models';
import {
  NewsRepository,
  RoleRepository,
  UserNotificationSettingRepository,
  UserRepository,
  UserRoleRepository
} from '../repositories';

export interface EmailPayload {
  subject: {
    [key in UserLanguagePreference]: string
  };
  templateName: string;
  replacements?: {
    [key: string]: string
  };
  attachments?: Mail.Attachment[];
}

@injectable({
  scope: BindingScope.SINGLETON
})
@bind({
  tags: 'email-manager.service'
})
export class EmailManagerService {
  readonly domain: string;
  private translations: {
    [key: string]: any
  } = {};

  constructor(
    @inject('email.service') private emailService: EmailService,
    @repository(UserRepository) private userRepository: UserRepository,
    @repository(NewsRepository) private newsRepository: NewsRepository,
    @repository(UserNotificationSettingRepository) private userNotificationSettingRepository: UserNotificationSettingRepository,
    @repository(UserRoleRepository) private userRoleRepository: UserRoleRepository,
    @repository(RoleRepository) private roleRepository: RoleRepository,
  ) {
    const domain = process.env.VERIFICATION_DOMAIN;
    if (!domain) {
      throw new Error('VERIFICATION_DOMAIN is not configured.');
    }
    this.domain = domain;
    this.loadTranslations();
  }

  private async loadTranslations(): Promise<void> {
    const supportedLangs = [UserLanguagePreference.EN, UserLanguagePreference.CZ];
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

  private _getLocalizedSubject(lang: UserLanguagePreference, key: string, replacements: string[] = []): string {
    const subject = this.translations[lang]?.email?.[key];
    if (!subject) {
      return `Subject Not Found: ${key}`;
    }
    return format(subject, ...replacements);
  }

  public async sendRegistrationEmail(user: User): Promise<void> {
    const token = this.emailService.generateVerificationToken(user.uuid);
    const url = `${this.domain}/verification?token=${token}`;
    const subject = {
      [UserLanguagePreference.EN]: this._getLocalizedSubject(UserLanguagePreference.EN, 'registration'),
      [UserLanguagePreference.CZ]: this._getLocalizedSubject(UserLanguagePreference.CZ, 'registration'),
    };

    await this.emailService.sendTemplatedEmail(user.email, subject, 'registration', user.uuid, {
      URL: url,
      username: user.username
    });
  }

  public async sendPasswordChange(user: User): Promise<void> {
    const token = this.emailService.generateVerificationToken(user.uuid);
    const url = `${this.domain}/passwdchange?token=${token}`;
    const subject = {
      [UserLanguagePreference.EN]: this._getLocalizedSubject(UserLanguagePreference.EN, 'password_change'),
      [UserLanguagePreference.CZ]: this._getLocalizedSubject(UserLanguagePreference.CZ, 'password_change'),
    };

    await this.emailService.sendTemplatedEmail(user.email, subject, 'passwordChange', user.uuid, {
      URL: url,
      username: user.username
    });
  }

  public async sendSuccessfullyPasswordChange(user: User): Promise<void> {
    const subject = {
      [UserLanguagePreference.EN]: this._getLocalizedSubject(UserLanguagePreference.EN, 'successful_password_change'),
      [UserLanguagePreference.CZ]: this._getLocalizedSubject(UserLanguagePreference.CZ, 'successful_password_change'),
    };
    await this.emailService.sendTemplatedEmail(user.email, subject, 'successfulyPasswordChange', user.uuid, {
      username: user.username
    });
  }

  public async sendResetEmail(user: User, newEmail: string): Promise<void> {
    const token = this.emailService.generateVerificationToken(user.uuid);
    const url = `${this.domain}/verification?token=${token}`;

    const verificationSubject = {
      [UserLanguagePreference.EN]: this._getLocalizedSubject(UserLanguagePreference.EN, 'email_verification'),
      [UserLanguagePreference.CZ]: this._getLocalizedSubject(UserLanguagePreference.CZ, 'email_verification'),
    };
    await this.emailService.sendTemplatedEmail(newEmail, verificationSubject, 'verification', user.uuid, {
      URL: url,
      username: user.username
    });

    const emailChangeSubject = {
      [UserLanguagePreference.EN]: this._getLocalizedSubject(UserLanguagePreference.EN, 'email_change'),
      [UserLanguagePreference.CZ]: this._getLocalizedSubject(UserLanguagePreference.CZ, 'email_change'),
    };
    await this.emailService.sendTemplatedEmail(user.email, emailChangeSubject, 'emailInfo', user.uuid, {
      username: user.username
    });
  }

  public async sendToUser(userId: string, payload: EmailPayload): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userId
      }
    });

    if (!user || !user.email) {
      return;
    }

    await this.emailService.sendTemplatedEmail(user.email, payload.subject, payload.templateName, user.uuid, payload.replacements, payload.attachments);
  }

  public async sendToListOfUsers(userIds: string[], payload: EmailPayload): Promise<PromiseSettledResult<void>[]> {
    const users = await this.userRepository.find({
      where: {
        uuid: {
          inq: userIds
        }
      },
      include: [{
        relation: 'userNotificationSetting'
      }]
    });

    const sendPromises = users
      .filter(user => user.email && user.userNotificationSetting?.receive_private_messages)
      .map(user => this.emailService.sendTemplatedEmail(user.email, payload.subject, payload.templateName, user.uuid, payload.replacements, payload.attachments));

    return Promise.allSettled(sendPromises);
  }

  public async sendNewsToAllUsers(newsId: string): Promise<PromiseSettledResult<void>[]> {
    const news = await this.newsRepository.findOne({
      where: {
        uuid: newsId
      }
    });

    if (!news) {
      return [];
    }

    const users = await this.userRepository.find({
      include: [{
        relation: 'userNotificationSetting'
      }]
    });

    const sendPromises = users
      .filter(user => user.email && user.userNotificationSetting?.receive_news)
      .map(user => {
        const userLanguage = user.userNotificationSetting?.user_language_preference || UserLanguagePreference.CZ;
        const replacements = {
          title: userLanguage === UserLanguagePreference.CZ ? news.title_cz : news.title_en,
          content: userLanguage === UserLanguagePreference.CZ ? news.content_cz : news.content_en,
          username: user.username,
        };

        const subjectEn = this._getLocalizedSubject(UserLanguagePreference.EN, 'news_update_subject', [news.title_en]);
        const subjectCz = this._getLocalizedSubject(UserLanguagePreference.CZ, 'news_update_subject', [news.title_cz]);
        const subject = {
          [UserLanguagePreference.EN]: subjectEn,
          [UserLanguagePreference.CZ]: subjectCz,
        };
        return this.emailService.sendTemplatedEmail(user.email, subject, 'news-template', user.uuid, replacements);
      });

    return Promise.allSettled(sendPromises);
  }

  public async sendToRole(roleName: string, payload: EmailPayload): Promise<PromiseSettledResult<void>[]> {
    const role = await this.roleRepository.findOne({
      where: {
        role_name: roleName
      }
    });

    if (!role) {
      return [];
    }

    const userRoles = await this.userRoleRepository.find({
      where: {
        roleId: role.id
      }
    });
    const userIds = userRoles.map(ur => ur.userId);

    const users = await this.userRepository.find({
      where: {
        id: {
          inq: userIds
        }
      },
      include: [{
        relation: 'userNotificationSetting'
      }]
    });

    const sendPromises = users
      .filter(user => user.email && user.userNotificationSetting?.receive_private_messages)
      .map(user => this.emailService.sendTemplatedEmail(user.email, payload.subject, payload.templateName, user.uuid, payload.replacements, payload.attachments));

    return Promise.allSettled(sendPromises);
  }

  public async sendMarketingEmail(payload: EmailPayload): Promise<PromiseSettledResult<void>[]> {
    const notificationSettings = await this.userNotificationSettingRepository.find({
      where: {
        marketing_consent_given_at: {
          neq: null
        }
      }
    });

    const userIds = notificationSettings.map(ns => ns.userId);
    const users = await this.userRepository.find({
      where: {
        id: {
          inq: userIds
        }
      }
    });

    const sendPromises = users
      .filter(user => user.email)
      .map(user => this.emailService.sendTemplatedEmail(user.email, payload.subject, payload.templateName, user.uuid, payload.replacements, payload.attachments));

    return Promise.allSettled(sendPromises);
  }

  public async sendBillingEmail(userId: string, billingPdfBuffer: Buffer, subjectKey: string, replacements?: string[]): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userId
      }
    });

    if (!user || !user.email) {
      return;
    }

    const replacementsObj = {
      username: user.username,
      billingPeriod: 'October 2023'
    };

    const attachments: Mail.Attachment[] = [{
      filename: 'invoice.pdf',
      content: billingPdfBuffer,
      contentType: 'application/pdf',
    },];

    const subjectEn = this._getLocalizedSubject(UserLanguagePreference.EN, subjectKey, replacements);
    const subjectCz = this._getLocalizedSubject(UserLanguagePreference.CZ, subjectKey, replacements);

    const payload: EmailPayload = {
      subject: {
        [UserLanguagePreference.EN]: subjectEn,
        [UserLanguagePreference.CZ]: subjectCz,
      },
      templateName: 'billing-template',
      replacements: replacementsObj,
      attachments: attachments,
    };

    await this.sendToUser(userId, payload);
  }
}
